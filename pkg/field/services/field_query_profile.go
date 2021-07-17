package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"strconv"
)

type FieldQueryProfileReq struct {
	FieldID base.ID `validate:"required" json:"fieldID"`
}

type FieldQueryProfileRes struct {
	Field        models.Field        `json:"field"`
	FieldProfile models.FieldProfile `json:"fieldProfile"`
}

func (s *FieldService) QueryProfile(ctx *rpc.Context, req *FieldQueryProfileReq, res *FieldQueryProfileRes) error {
	_, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		ctx.Infof("[QueryProfile] req: %+v", req)

		var field models.Field
		var profile models.FieldProfile

		findFieldErr := tx.Model(&models.Field{}).Where("id = ?", req.FieldID).Preload("Labels").Preload("Equipments").Preload("OpenSlots").Find(&field).Error
		if findFieldErr != nil {
			ctx.Errorf("find field error: %+v", errors.WithStack(findFieldErr))
			return findFieldErr
		}
		if field.ID == 0 {
			return base.UserErrorf(nil, "未找到场地(%s)", strconv.FormatInt(int64(req.FieldID), 10))
		}

		findProfileErr := tx.Model(&models.FieldProfile{}).Where("field_id = ?", req.FieldID).Find(&profile).Error
		if findProfileErr != nil {
			ctx.Errorf("find field profile error: %+v", errors.WithStack(findProfileErr))
			return findProfileErr
		}

		res.Field = field
		res.FieldProfile = profile

		ctx.Infof("[QueryProfile] field profile(%s) on field(%s) found",
			strconv.FormatInt(int64(res.FieldProfile.ID), 10), strconv.FormatInt(int64(res.Field.ID), 10))
		ctx.Infof("[QueryProfile] res: %+v", res)
		return nil
	})

	return txErr
}
