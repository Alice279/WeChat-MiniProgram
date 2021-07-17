package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"strconv"
)

type FieldDeleteReq struct {
	FieldID base.ID `validate:"required" json:"fieldID" trans:"场地ID"`
}

type FieldDeleteRes struct {
}

func (s *FieldService) Delete(ctx *rpc.Context, req *FieldDeleteReq, res *FieldDeleteRes) error {
	// user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsSuper {
		return base.UserErrorf(nil, "只有超级用户可以删除场地")
	}

	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		// order exist check
		var fieldOrders []models.FieldOrder
		findOrderErr := tx.Model(&models.FieldOrder{}).Where("field_id", req.FieldID).Find(&fieldOrders).Error
		if findOrderErr != nil {
			ctx.Errorf("find field order error: %+v", errors.WithStack(findOrderErr))
			return findOrderErr
		}
		if len(fieldOrders) > 0 {
			return base.UserErrorf(nil, "该场地(%s)上还有未删除的预约", strconv.FormatInt(int64(req.FieldID), 10))
		}

		var fieldToDelete models.Field
		findFieldErr := tx.Model(&models.Field{}).Where("id", req.FieldID).Find(&fieldToDelete).Error
		if fieldToDelete.ID == 0 {
			return base.UserErrorf(nil, "未找到该场地(%s)", strconv.FormatInt(int64(req.FieldID), 10))
		}
		if findFieldErr != nil {
			ctx.Errorf("find field error: %+v", errors.WithStack(findFieldErr))
			return findFieldErr
		}

		deleteProfileErr := tx.Model(&models.FieldProfile{}).Where("field_id = ?", req.FieldID).Delete(&models.FieldProfile{}).Error
		if deleteProfileErr != nil {
			ctx.Errorf("delete field profile error: %+v", errors.WithStack(deleteProfileErr))
			return deleteProfileErr
		}

		deleteOpenSlotErr := tx.Model(&models.FieldOpenSlot{}).Where("field_id = ?", req.FieldID).Delete(&models.FieldOpenSlot{}).Error
		if deleteOpenSlotErr != nil {
			ctx.Errorf("delete open slots error: %+v", errors.WithStack(deleteOpenSlotErr))
			return deleteOpenSlotErr
		}

		openSlotsUpdateErr := tx.Model(&fieldToDelete).Association("OpenSlots").Replace([]models.FieldOpenSlot{})
		if openSlotsUpdateErr != nil {
			ctx.Errorf("open slot relations update error: %+v", errors.WithStack(openSlotsUpdateErr))
			return openSlotsUpdateErr
		}
		labelsUpdateErr := tx.Model(&fieldToDelete).Association("Labels").Replace([]models.FieldLabel{})
		if labelsUpdateErr != nil {
			ctx.Errorf("label relations update error: %+v", errors.WithStack(labelsUpdateErr))
			return labelsUpdateErr
		}
		equipmentsUpdateErr := tx.Model(&fieldToDelete).Association("Equipments").Replace([]models.FieldEquipment{})
		if equipmentsUpdateErr != nil {
			ctx.Errorf("equipment relations update error: %+v", errors.WithStack(equipmentsUpdateErr))
			return equipmentsUpdateErr
		}

		deleteFieldErr := tx.Where("id = ?", req.FieldID).Delete(&models.Field{}).Error
		if deleteFieldErr != nil {
			ctx.Errorf("delete field error: %+v", errors.WithStack(deleteFieldErr))
			return deleteFieldErr
		}

		ctx.Infof("[Delete] field(%s: %s) deleted", fieldToDelete.Name, strconv.FormatInt(int64(req.FieldID), 10))
		return nil
	})

	return txErr
}
