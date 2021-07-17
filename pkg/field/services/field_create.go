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

type OpenSlot struct {
	BeginHour   int `validate:"gte=0,lte=23" json:"beginHour"`
	BeginMinute int `validate:"gte=0,lte=59" json:"beginMinute"`
	EndHour     int `validate:"gte=0,lte=23" json:"endHour"`
	EndMinute   int `validate:"gte=0,lte=59" json:"endMinute"`
}

type FieldCreateReq struct {
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

type FieldCreateRes struct {
	FieldID base.ID `json:"fieldID"`
}

func (s *FieldService) Create(ctx *rpc.Context, req *FieldCreateReq, res *FieldCreateRes) error {
	// user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsSuper {
		return base.UserErrorf(nil, "只有超级管理员可以创建场地")
	}

	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	// OpenSlot Check
	// openSlots must be sorted and have no collision
	// example: [10:00~12:00, 14:00~18:00]
	if len(req.OpenSlots) < 1 {
		return base.UserErrorf(nil, "创建场地时必须输入至少一个开放时段")
	}
	currentBaseHour := 0
	currentBaseMinute := 0
	for _, openSlot := range req.OpenSlots {
		isOpenSlotValid, validOpenSlotMsg := base.ValidateStruct(openSlot)
		if !isOpenSlotValid {
			return base.UserErrorf(nil, "输入内容不满足条件: %s", validOpenSlotMsg)
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
		// field
		newField := models.Field{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:        req.Name,
			Location:    req.Location,
			CoverPicURL: req.CoverPicURL,
			Address:     req.Address,
			Capacity:    req.Capacity,
			Equipments:  nil,
			Labels:      nil,
			OpenSlots:   nil,
		}

		// []label
		var existLabels []models.FieldLabel
		for _, label := range req.Labels {
			var existLabel models.FieldLabel
			findLabelErr := tx.Model(&models.FieldLabel{}).Where("Name = ?", label).Find(&existLabel).Error
			if findLabelErr != nil {
				ctx.Errorf("find label '%s' error: %+v", label, errors.WithStack(findLabelErr))
				return findLabelErr
			}
			// label未找到，创建一个新的label
			if existLabel.ID == 0 {
				newLabel := models.FieldLabel{
					Model: base.Model{
						ID: base.NewID(),
					},
					Name:   label,
					Fields: []models.Field{},
				}
				createLabelErr := tx.Model(&models.FieldLabel{}).Create(&newLabel).Error
				if createLabelErr != nil {
					ctx.Errorf("create label '%s' error: %+v", label, errors.WithStack(createLabelErr))
					return createLabelErr
				}
				existLabel = newLabel
			}
			existLabels = append(existLabels, existLabel)
		}
		newField.Labels = existLabels

		// []equipment
		var existEquipments []models.FieldEquipment
		for _, equipment := range req.Equipments {
			var existEquipment models.FieldEquipment
			findEquipmentErr := tx.Model(&models.FieldEquipment{}).Where("Name = ?", equipment).Find(&existEquipment).Error
			if findEquipmentErr != nil {
				ctx.Errorf("find equipment '%s' error: %+v", equipment, errors.WithStack(findEquipmentErr))
				return findEquipmentErr
			}
			if existEquipment.ID == 0 {
				newEquipment := models.FieldEquipment{
					Model: base.Model{
						ID: base.NewID(),
					},
					Name:   equipment,
					Fields: []models.Field{},
				}
				createEquipmentErr := tx.Model(&models.FieldEquipment{}).Create(&newEquipment).Error
				if createEquipmentErr != nil {
					ctx.Errorf("create equipment '%s' error: %+v", equipment, errors.WithStack(createEquipmentErr))
					return createEquipmentErr
				}
				existEquipment = newEquipment
			}
			existEquipments = append(existEquipments, existEquipment)
		}
		newField.Equipments = existEquipments

		createFieldErr := tx.Model(&models.Field{}).Create(&newField).Error
		if createFieldErr != nil {
			ctx.Errorf("create field error: %+v", errors.WithStack(createFieldErr))
			return createFieldErr
		}

		// openSlot
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
				ctx.Errorf("create openSlot '%02d:%02d-%02d:%02d' error: %+v", openSlot.BeginHour, openSlot.BeginMinute, openSlot.EndHour, openSlot.EndMinute, errors.WithStack(createOpenSlotErr))
				return createOpenSlotErr
			}
		}

		// profile
		if len(req.PictureURLs) < 1 {
			return base.UserErrorf(nil, "必须上传场地介绍图")
		}
		newFieldProfile := models.FieldProfile{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:       &newField,
			FieldID:     newField.ID,
			Description: req.Description,
			PictureURLs: req.PictureURLs,
			ContactInfo: req.ContactInfo,
		}
		if req.ContactWechat.Valid {
			newFieldProfile.ContactWechat = req.ContactWechat
		}
		newFieldProfile.SetExtra(req.Extra)
		createProfileErr := tx.Model(&models.FieldProfile{}).Create(&newFieldProfile).Error
		if createProfileErr != nil {
			ctx.Errorf("create field profile error: %+v", errors.WithStack(createProfileErr))
			return createProfileErr
		}
		res.FieldID = newField.ID
		ctx.Infof("[Create] field(%s: %s) is created", req.Name, strconv.FormatInt(int64(newField.ID), 10))
		return nil
	})

	return txErr
}
