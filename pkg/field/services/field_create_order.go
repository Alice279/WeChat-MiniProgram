package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
	"strconv"
	"time"
)

func timeBeforeOrEqual(firstTimeHour int, firstTimeMinute int, secondTimeHour int, secondTimeMinute int) bool {
	if firstTimeHour < secondTimeHour {
		return true
	}
	if firstTimeHour == secondTimeHour && firstTimeMinute <= secondTimeMinute {
		return true
	}
	return false
}

type FieldCreateOrderReq struct {
	FieldID   base.ID   `validate:"required" json:"fieldID" trans:"场地ID"`
	BeginTime time.Time `validate:"required" json:"beginTime" trans:"预约开始时间"`
	EndTime   time.Time `validate:"required" json:"endTime" trans:"预约结束时间"`
	Name      string    `validate:"required,max=50,min=1" json:"name" trans:"预约名称"`
	Comment   string    `json:"comment" trans:"预约备注"`
}

type FieldCreateOrderRes struct {
	OrderID base.ID `json:"orderID"`
}

func (s *FieldService) CreateOrder(ctx *rpc.Context, req *FieldCreateOrderReq, res *FieldCreateOrderRes) error {
	//user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有员工或合作方可以创建场地预约订单")
	}
	extractedCreatorID := su.ID
	// 测试
	//extractedCreatorID := base.ID(666)

	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	// 将请求中的时间转换为当地时间
	req.BeginTime = req.BeginTime.Local()
	req.EndTime = req.EndTime.Local()

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		var targetField models.Field
		findFieldErr := tx.Model(&models.Field{}).Where("ID = ?", req.FieldID).Find(&targetField).Error
		if targetField.ID == 0 {
			return base.UserErrorf(nil, "场地ID'%s'未找到", strconv.FormatInt(int64(req.FieldID), 10))
		}
		if findFieldErr != nil {
			ctx.Errorf("find field '%s'(ID) error: %+v", strconv.FormatInt(int64(req.FieldID), 10), errors.WithStack(findFieldErr))
			return findFieldErr
		}

		newOrder := models.FieldOrder{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:      &targetField,
			FieldID:    targetField.ID,
			CreatorID:  extractedCreatorID,
			OrderName:  req.Name,
			Comment:    req.Comment,
			BeginTime:  req.BeginTime,
			EndTime:    req.EndTime,
			VerifiedAt: null.Time{},
			IsVerified: false,
		}

		// order time check
		if req.EndTime.Before(req.BeginTime) {
			return base.UserErrorf(nil, "预约开始时间应早于结束时间")
		}
		if req.EndTime.Year() != req.BeginTime.Year() || req.EndTime.Month() != req.BeginTime.Month() || req.EndTime.Day() != req.BeginTime.Day() {
			return base.UserErrorf(nil, "场地预约不能跨天")
		}

		// slot time check
		orderBeginHour, orderBeginMinute := req.BeginTime.Hour(), req.BeginTime.Minute()
		orderEndHour, orderEndMinute := req.EndTime.Hour(), req.EndTime.Minute()
		var openSlots []models.FieldOpenSlot
		findSlotErr := tx.Model(&models.FieldOpenSlot{}).Where("field_id = ?", req.FieldID).Find(&openSlots).Error
		if len(openSlots) == 0 {
			return base.UserErrorf(nil, "场地开放时间不满足该预约起止时间(%02d:%02d-%02d:%02d)", req.BeginTime.Hour(), req.BeginTime.Minute(), req.EndTime.Hour(), req.EndTime.Minute())
		}
		if findSlotErr != nil {
			ctx.Errorf("find OpenSlot error: %+v", errors.WithStack(findSlotErr))
			return findSlotErr
		}
		flag := false
		for _, openSlot := range openSlots {
			if timeBeforeOrEqual(openSlot.BeginHour, openSlot.BeginMinute, orderBeginHour, orderBeginMinute) {
				if timeBeforeOrEqual(orderEndHour, orderEndMinute, openSlot.EndHour, openSlot.EndMinute) {
					flag = true
					break
				}
			}
		}
		if !flag {
			return base.UserErrorf(nil, "场地开放时间不满足该预约起止时间(%02d:%02d-%02d:%02d)", req.BeginTime.Hour(), req.BeginTime.Minute(), req.EndTime.Hour(), req.EndTime.Minute())
		}

		// order collision check
		var collisionOrders []models.FieldOrder
		stmt := tx.Model(&models.FieldOrder{}).Where("field_id = ?", req.FieldID)
		stmt = stmt.Where("begin_time <= ? AND end_time >= ?", req.BeginTime, req.BeginTime).Or("begin_time <= ? AND end_time >= ?", req.EndTime, req.EndTime).Or("begin_time >= ? AND end_time <= ?", req.BeginTime, req.EndTime)
		findOrderErr := stmt.Find(&collisionOrders).Error
		if findOrderErr != nil {
			ctx.Errorf("find order error: %+v", findOrderErr)
			return findOrderErr
		}
		if len(collisionOrders) > 0 {
			return base.UserErrorf(nil, "场地预约订单时间冲突")
		}

		createOrderErr := tx.Model(&models.FieldOrder{}).Create(&newOrder).Error
		if createOrderErr != nil {
			ctx.Errorf("create field order error: %+v", errors.WithStack(createOrderErr))
			return createOrderErr
		}
		res.OrderID = newOrder.ID
		ctx.Infof("[CreateOrder] field order(%s: %s) on field(%s: %s) created", req.Name, strconv.FormatInt(int64(res.OrderID), 10), targetField.Name, strconv.FormatInt(int64(req.FieldID), 10))
		return nil
	})

	return txErr
}
