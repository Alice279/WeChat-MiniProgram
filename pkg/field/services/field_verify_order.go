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

type FieldVerifyOrderReq struct {
	FieldID base.ID `validate:"required" json:"fieldID" trans:"场地ID"`
	OrderID base.ID `validate:"required" json:"orderID" trans:"订单ID"`
}
type FieldVerifyOrderRes struct {
	OrderID base.ID `json:"orderID"`
}

func (s *FieldService) VerifyOrder(ctx *rpc.Context, req *FieldVerifyOrderReq, res *FieldVerifyOrderRes) error {
	// user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有员工或合作方可以审核场地预约订单")
	}
	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		ctx.Infof("[VerifyOrder] req: %+v", req)
		var orderToVerify models.FieldOrder
		findOrderErr := tx.Model(&models.FieldOrder{}).Where("id = ? and field_id = ?", req.OrderID, req.FieldID).Find(&orderToVerify).Error
		if orderToVerify.ID == 0 {
			return base.UserErrorf(nil, "order(%s) on field(%s) not found", strconv.FormatInt(int64(req.OrderID), 10), strconv.FormatInt(int64(req.FieldID), 10))
		}
		if findOrderErr != nil {
			ctx.Errorf("find order error: %+v", errors.WithStack(findOrderErr))
			return findOrderErr
		}

		if !su.IsSuper && (su.ID != orderToVerify.CreatorID) {
			return base.UserErrorf(nil, "不能审核不属于自己的场地预约")
		}

		orderToVerify.IsVerified = true
		orderToVerify.VerifiedAt = null.NewTime(time.Now(), true)
		updateOrderErr := tx.Model(&models.FieldOrder{}).Where("ID = ?", orderToVerify.ID).Save(&orderToVerify).Error
		if updateOrderErr != nil {
			ctx.Errorf("update order error: %+v", errors.WithStack(updateOrderErr))
			return updateOrderErr
		}

		res.OrderID = orderToVerify.ID
		ctx.Infof("[VerifyOrder] order(%s) on field(%s) verified", strconv.FormatInt(int64(req.OrderID), 10), strconv.FormatInt(int64(req.FieldID), 10))
		ctx.Infof("[VerifyOrder] res: %+v", res)
		return nil
	})

	return txErr
}
