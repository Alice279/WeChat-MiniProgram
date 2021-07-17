package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"strconv"
)

type FieldRejectOrderReq struct {
	FieldID base.ID `validate:"required" json:"fieldID" trans:"场地ID"`
	OrderID base.ID `validate:"required" json:"orderID" trans:"订单ID"`
	Reason  string  `json:"reason" trans:"拒绝理由"`
}

type FieldRejectOrderRes struct {
	OrderID base.ID `json:"orderID"`
}

func (s *FieldService) RejectOrder(ctx *rpc.Context, req *FieldRejectOrderReq, res *FieldRejectOrderRes) error {
	// user auth check
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有员工或合作方可以拒绝场地预约订单")
	}
	isReqValid, validReqMsg := base.ValidateStruct(req)
	if !isReqValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validReqMsg)
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		ctx.Infof("[RejectOrder] req: %+v", req)
		var orderToDelete models.FieldOrder
		findOrderErr := tx.Model(&models.FieldOrder{}).Where("id = ? and field_id = ?", req.OrderID, req.FieldID).Find(&orderToDelete).Error
		if orderToDelete.ID == 0 {
			return base.UserErrorf(nil, "场地(%s)上的预约订单(%s)未找到",
				strconv.FormatInt(int64(req.FieldID), 10), strconv.FormatInt(int64(req.OrderID), 10))
		}
		if findOrderErr != nil {
			ctx.Errorf("find field order error: %+v", errors.WithStack(findOrderErr))
			return findOrderErr
		}

		if !su.IsSuper && (su.ID != orderToDelete.CreatorID) {
			return base.UserErrorf(nil, "不能拒绝不属于自己的场地预约")
		}

		orderToDelete.Comment = req.Reason + ": " + orderToDelete.Comment
		updateOrderBeforeRejectErr := tx.Model(&models.FieldOrder{}).Where("ID = ?", req.OrderID).Save(&orderToDelete).Error
		if updateOrderBeforeRejectErr != nil {
			ctx.Errorf("update field order before reject error: %+v", errors.WithStack(updateOrderBeforeRejectErr))
			return updateOrderBeforeRejectErr
		}

		rejectOrderErr := tx.Delete(&orderToDelete).Error
		if rejectOrderErr != nil {
			ctx.Errorf("reject field order error: %+v", errors.WithStack(rejectOrderErr))
			return rejectOrderErr
		}

		res.OrderID = orderToDelete.ID

		ctx.Infof("[RejectOrder] field order(%s) on field(%s) is rejected",
			strconv.FormatInt(int64(req.OrderID), 10), strconv.FormatInt(int64(req.FieldID), 10))
		ctx.Infof("[RejectOrder] res: %+v", res)

		return nil
	})

	return txErr
}
