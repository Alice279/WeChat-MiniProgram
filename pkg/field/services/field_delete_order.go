package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"strconv"
)

type FieldDeleteOrderReq struct {
	FieldID base.ID `validate:"required" json:"fieldID" trans:"场地ID"`
	OrderID base.ID `validate:"required" json:"orderID" trans:"场地预约ID"`
}
type FieldDeleteOrderRes struct {
	OrderID base.ID `json:"orderID"`
}

func (s *FieldService) DeleteOrder(ctx *rpc.Context, req *FieldDeleteOrderReq, res *FieldDeleteOrderRes) error {
	// user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有员工或合作方可以删除场地预约订单")
	}

	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		var orderToDelete models.FieldOrder
		findOrderErr := tx.Model(&models.FieldOrder{}).Where("id = ? and field_id = ?", req.OrderID, req.FieldID).Find(&orderToDelete).Error

		if orderToDelete.ID == 0 {
			return base.UserErrorf(nil, "未找到场地(%s)上的预约订单(%s)", strconv.FormatInt(int64(req.FieldID), 10), strconv.FormatInt(int64(req.OrderID), 10))
		}
		if findOrderErr != nil {
			ctx.Errorf("find order error: %+v", errors.WithStack(findOrderErr))
			return findOrderErr
		}

		if !su.IsSuper && (su.ID != orderToDelete.CreatorID) {
			return base.UserErrorf(nil, "不能删除不属于自己的场地预约")
		}

		deleteOrderErr := tx.Delete(&orderToDelete).Error
		if deleteOrderErr != nil {
			ctx.Errorf("delete order error: %+v", errors.WithStack(deleteOrderErr))
			return deleteOrderErr
		}

		res.OrderID = orderToDelete.ID

		ctx.Infof("[DeleteOrder] field order(%s: %s) on field(%s) is deleted", orderToDelete.OrderName, strconv.FormatInt(int64(req.OrderID), 10), strconv.FormatInt(int64(req.FieldID), 10))
		return nil
	})

	return txErr
}
