package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
	"strconv"
)

type FieldUpdateReq struct {
	ID            base.ID           `validate:"required" json:"id" trans:"场地ID"`
	Name          string            `validate:"required,max=50,min=1" json:"name" trans:"场地名称"`
	Location      string            `validate:"required,max=50,min=1" json:"location" trans:"位置"`
	CoverPicURL   string            `validate:"required" json:"coverPicURL" trans:"封面图"`
	Address       string            `validate:"required" json:"address" trans:"地址"`
	Capacity      int               `validate:"required,gte=0,lte=1000" json:"capacity" trans:"容纳人数"`
	Description   string            `validate:"required" json:"description" trans:"场地描述"`
	ContactWechat null.String       `json:"contactWechat" trans:"联系人微信"`
	ContactInfo   string            `validate:"required" json:"contactInfo" trans:"联系信息"`
	PictureURLs   []string          `validate:"required" json:"pictureURLs" trans:"场地详情图"`
	OpenSlots     []OpenSlot        `json:"openSlots" trans:"开放时段"`
	Labels        []string          `json:"labels" trans:"标签"`
	Equipments    []string          `json:"equipments" trans:"设备"`
	Extra         map[string]string `json:"extra" trans:"额外信息"`
}

type FieldUpdateRes struct {
	FieldID base.ID `json:"fieldID"`
}

func (s *FieldService) Update(ctx *rpc.Context, req *FieldUpdateReq, res *FieldUpdateRes) error {
	// user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsSuper {
		return base.UserErrorf(nil, "只有超级用户可以修改场地信息")
	}

	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	// OpenSlot Check
	if len(req.OpenSlots) < 1 {
		return base.UserErrorf(nil, "必须输入至少一个开放时段")
	}
	currentBaseHour := 0
	currentBaseMinute := 0
	for _, openSlot := range req.OpenSlots {
		isOpenSlotValid, validOpenSlotMsg := base.ValidateStruct(openSlot)
		if !isOpenSlotValid {
			return base.UserErrorf(nil, "输入内容不满足条件: %s", validOpenSlotMsg)
		}
		openSlotValidateErr := base.Validator.Struct(openSlot)
		if openSlotValidateErr != nil {
			return base.UserErrorf(openSlotValidateErr, "开放时段格式错误")
		}

		if openSlot.BeginHour == openSlot.EndHour && openSlot.BeginMinute == openSlot.EndMinute {
			return base.UserErrorf(nil, "开放时段信息'%02d:%02d-%02d:%02d'时间长度为0", openSlot.BeginHour, openSlot.BeginMinute, openSlot.EndHour, openSlot.EndMinute)
		}

		if (openSlot.BeginHour < currentBaseHour) ||
			(openSlot.BeginHour == currentBaseHour && openSlot.BeginMinute < currentBaseMinute) {
			return base.UserErrorf(nil, "请按顺序输入开放时段信息")
		}

		if (openSlot.BeginHour > openSlot.EndHour) ||
			(openSlot.BeginHour == openSlot.EndHour && openSlot.BeginMinute > openSlot.EndMinute) {
			return base.UserErrorf(nil, "开放时段信息'%02d:%02d-%02d:%02d'开始时间晚于结束时间", openSlot.BeginHour, openSlot.BeginMinute, openSlot.EndHour, openSlot.EndMinute)
		}
		currentBaseHour = openSlot.EndHour
		currentBaseMinute = openSlot.EndMinute
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		ctx.Infof("[Update] req: %+v", req)
		// field
		var newField models.Field
		findFieldErr := tx.Model(&models.Field{}).Where("ID = ?", req.ID).Find(&newField).Error
		if newField.ID == 0 {
			return base.UserErrorf(nil, "场地(%s)未找到", strconv.FormatInt(int64(req.ID), 10))
		}
		if findFieldErr != nil {
			ctx.Errorf("find field error: %+v", findFieldErr)
			return findFieldErr
		}

		newField.Name = req.Name
		newField.Location = req.Location
		newField.CoverPicURL = req.CoverPicURL
		newField.Address = req.Address
		newField.Capacity = req.Capacity

		var fieldProfileToUpdate models.FieldProfile
		findProfileErr := tx.Where("field_id = ?", req.ID).Model(&models.FieldProfile{}).Find(&fieldProfileToUpdate).Error
		if fieldProfileToUpdate.ID == 0 {
			ctx.Errorf("field profile on field(%s) not found", strconv.FormatInt(int64(req.ID), 10))
			return base.UserErrorf(nil, "未找到场地(%s)关联的详情信息", strconv.FormatInt(int64(req.ID), 10))
		}
		if findProfileErr != nil {
			ctx.Errorf("find profile error: %+v", errors.WithStack(findProfileErr))
			return findProfileErr
		}
		if len(req.PictureURLs) < 1 {
			return base.UserErrorf(nil, "必须上传场地介绍图")
		}
		fieldProfileToUpdate.Description = req.Description
		fieldProfileToUpdate.PictureURLs = req.PictureURLs
		fieldProfileToUpdate.ContactInfo = req.ContactInfo
		fieldProfileToUpdate.SetExtra(req.Extra)
		profileUpdateErr := tx.Model(&models.FieldProfile{}).Where("ID = ?", fieldProfileToUpdate.ID).Save(&fieldProfileToUpdate).Error
		if profileUpdateErr != nil {
			ctx.Errorf("update field profile error: %+v", errors.WithStack(profileUpdateErr))
			return profileUpdateErr
		}
		// openSlot
		deleteOpenSlotsErr := tx.Where("field_id = ?", req.ID).Delete(&models.FieldOpenSlot{}).Error
		if deleteOpenSlotsErr != nil {
			ctx.Errorf("delete field openslots error: %+v", errors.WithStack(deleteOpenSlotsErr))
			return deleteOpenSlotsErr
		}
		for _, openSlot := range req.OpenSlots {
			newOpenSlot := models.FieldOpenSlot{
				Model: base.Model{
					ID: base.NewID(),
				},
				Field:       &newField,
				FieldID:     newField.ID,
				BeginHour:   openSlot.BeginHour,
				BeginMinute: openSlot.BeginMinute,
				EndHour:     openSlot.EndHour,
				EndMinute:   openSlot.EndMinute,
			}
			createOpenSlotErr := tx.Model(&models.FieldOpenSlot{}).Create(&newOpenSlot).Error
			if createOpenSlotErr != nil {
				ctx.Errorf("create field openslots error: %+v", errors.WithStack(createOpenSlotErr))
				return createOpenSlotErr
			}
		}

		// []label
		var existLabels []models.FieldLabel
		for _, label := range req.Labels {
			var existLabel models.FieldLabel
			findLabelErr := tx.Model(&models.FieldLabel{}).Where("Name = ?", label).Find(&existLabel).Error
			if findLabelErr != nil {
				ctx.Errorf("find field labels error: %+v", errors.WithStack(findLabelErr))
				return findLabelErr
			}
			if existLabel.ID == 0 {
				newLabel := models.FieldLabel{
					Model: base.Model{
						ID: base.NewID(),
					},
					Name:   label,
					Fields: []models.Field{newField},
				}
				createLabelErr := tx.Model(&models.FieldLabel{}).Create(&newLabel).Error
				if createLabelErr != nil {
					ctx.Errorf("create field label error: %+v", errors.WithStack(createLabelErr))
					return createLabelErr
				}
				existLabel = newLabel
			}
			existLabels = append(existLabels, existLabel)
		}
		updateLabelErr := tx.Model(&newField).Association("Labels").Replace(existLabels)
		if updateLabelErr != nil {
			ctx.Errorf("update field labels error: %+v", errors.WithStack(updateLabelErr))
			return updateLabelErr
		}

		// []equipment
		var existEquipments []models.FieldEquipment
		for _, equipment := range req.Equipments {
			var existEquipment models.FieldEquipment
			findEquipmentErr := tx.Model(&models.FieldEquipment{}).Where("Name = ?", equipment).Find(&existEquipment).Error
			if findEquipmentErr != nil {
				ctx.Errorf("find field equipments error: %+v", errors.WithStack(findEquipmentErr))
				return findEquipmentErr
			}
			if existEquipment.ID == 0 {
				newEquipment := models.FieldEquipment{
					Model: base.Model{
						ID: base.NewID(),
					},
					Name:   equipment,
					Fields: []models.Field{newField},
				}
				createEquipmentErr := tx.Model(&models.FieldEquipment{}).Create(&newEquipment).Error
				if createEquipmentErr != nil {
					ctx.Errorf("create field equipment error: %+v", errors.WithStack(createEquipmentErr))
					return createEquipmentErr
				}
				existEquipment = newEquipment
			}
			existEquipments = append(existEquipments, existEquipment)
		}
		updateEquipmentErr := tx.Model(&newField).Association("Equipments").Replace(existEquipments)
		if updateEquipmentErr != nil {
			ctx.Errorf("update field equipment error: %+v", errors.WithStack(updateEquipmentErr))
			return updateEquipmentErr
		}

		updateFieldErr := tx.Model(&models.Field{}).Where("ID = ?", req.ID).Save(&newField).Error
		if updateFieldErr != nil {
			ctx.Errorf("update field error: %+v", errors.WithStack(updateFieldErr))
			return updateFieldErr
		}

		res.FieldID = newField.ID

		ctx.Infof("[Update] field(%s: %s) updated", req.Name, strconv.FormatInt(int64(req.ID), 10))
		ctx.Infof("[Update] res: %+v", res)
		return nil
	})

	return txErr
}
