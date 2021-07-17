package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
)

type FieldQueryOrdersFilters struct {
	FieldID      base.ID   `json:"fieldID,omitempty"`
	CreatorEq    base.ID   `json:"creatorEq,omitempty"`
	IsVerifiedEq null.Bool `json:"isVerifiedEq,omitempty"`
	// BeginTime and EndTime can be null, but must be valid together
	BeginTime null.Time `json:"beginTime,omitempty"`
	EndTime   null.Time `json:"endTime,omitempty"`
}

func (f *FieldQueryOrdersFilters) Apply(stmt *gorm.DB) (*gorm.DB, error) {
	// TODO: 增加权限限制->无关路人、小程序用户、内部员工、super员工

	if f.FieldID != 0 {
		stmt = stmt.Where("field_id = ?", f.FieldID)
	}
	if f.CreatorEq != 0 {
		stmt = stmt.Where("creator_id = ?", f.CreatorEq)
	}
	if f.IsVerifiedEq.Valid {
		stmt = stmt.Where("is_verified = ?", f.IsVerifiedEq)
	}
	if f.BeginTime.Valid {
		// TODO: 时区相关的时间测试
		stmt = stmt.Where("begin_time BETWEEN ? and ?", f.BeginTime, f.EndTime)
		stmt = stmt.Where("end_time BETWEEN ? and ?", f.BeginTime, f.EndTime)
	}
	return stmt, nil
}

type FieldQueryOrdersReq struct {
	Filters    FieldQueryOrdersFilters `json:"filters"`
	Pagination base.Pagination         `json:"pagination"`
}

type FieldQueryOrdersRes struct {
	FieldOrders []models.FieldOrder `json:"fieldOrders"`
	Pagination  base.Pagination     `json:"pagination"`
}

func (s *FieldService) QueryOrders(ctx *rpc.Context, req *FieldQueryOrdersReq, res *FieldQueryOrdersRes) error {
	// user auth check
	_, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}

	if req.Filters.BeginTime.Valid != req.Filters.EndTime.Valid {
		return base.UserErrorf(nil, "订单查询起止时间必须同时生效")
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		ctx.Infof("[QueryOrder] req: %+v", req)

		var fieldOrders []models.FieldOrder
		var totalNum int64

		stmt := tx.Model(&models.FieldOrder{})
		stmt, queryLoadErr := req.Filters.Apply(stmt)
		if queryLoadErr != nil {
			ctx.Fatalf("query order filter apply fatal error")
			return queryLoadErr
		}

		countFieldOrderErr := stmt.Count(&totalNum).Error
		if countFieldOrderErr != nil {
			ctx.Errorf("count field order error: %+v", errors.WithStack(countFieldOrderErr))
			return countFieldOrderErr
		}

		stmt = stmt.Scopes(req.Pagination.AsScope())
		findFieldOrderErr := stmt.Order("created_at desc").Find(&fieldOrders).Error
		if findFieldOrderErr != nil {
			ctx.Errorf("find field order error: %+v", errors.WithStack(findFieldOrderErr))
			return findFieldOrderErr
		}

		res.FieldOrders = fieldOrders
		res.Pagination.TotalNum = int(totalNum)

		ctx.Infof("[QueryOrder] res: %+v", res)
		return nil
	})

	return txErr
}
