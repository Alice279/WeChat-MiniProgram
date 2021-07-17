package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
)

type FieldQueryFilters struct {
	NameEq     null.String `json:"nameEq,omitempty"`
	LocationEq null.String `json:"locationEq,omitempty"`
	// LabelsContain is not available for now
	LabelsContain []string `json:"labelsContain,omitempty"`
	// EquipmentsContain is not available for now
	EquipmentsContain []string `json:"equipmentsContain,omitempty"`
}

func (f *FieldQueryFilters) Apply(stmt *gorm.DB) (*gorm.DB, error) {
	if f.NameEq.Valid {
		stmt = stmt.Where("name = ?", f.NameEq)
	}
	if f.LocationEq.Valid {
		stmt = stmt.Where("location = ?", f.LocationEq)
	}
	return stmt, nil
}

type FieldQueryReq struct {
	Filters    FieldQueryFilters `json:"filters"`
	Pagination base.Pagination   `json:"pagination"`
}

type FieldQueryRes struct {
	Fields     []models.Field  `json:"fields"`
	Pagination base.Pagination `json:"pagination"`
}

func (s *FieldService) Query(ctx *rpc.Context, req *FieldQueryReq, res *FieldQueryRes) error {
	_, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}

	if len(req.Filters.LabelsContain) > 0 {
		// Filters.LabelsContain is not usable for now
		return base.UserErrorf(nil, "包含标签查询当前不可用")
	}
	if len(req.Filters.EquipmentsContain) > 0 {
		// Filters.EquipmentsContain is not usable for now
		return base.UserErrorf(nil, "包含设备查询当前不可用")
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		ctx.Infof("[Query] req: %+v", req)

		var fields []models.Field
		var totalNum int64

		stmt := tx.Model(&models.Field{})
		stmt, queryLoadErr := req.Filters.Apply(stmt)
		if queryLoadErr != nil {
			ctx.Fatalf("query filter apply fatal error")
			return queryLoadErr
		}
		countFieldErr := stmt.Count(&totalNum).Error
		if countFieldErr != nil {
			ctx.Errorf("count field error: %+v", errors.WithStack(countFieldErr))
			return countFieldErr
		}

		stmt = stmt.Scopes(req.Pagination.AsScope())
		findFieldErr := stmt.Preload("Equipments").Preload("Labels").Preload("OpenSlots").Find(&fields).Error
		if findFieldErr != nil {
			ctx.Errorf("find fields error: %+v", errors.WithStack(findFieldErr))
			return findFieldErr
		}
		res.Fields = fields
		res.Pagination.TotalNum = int(totalNum)

		ctx.Infof("[Query] res: %+v", res)
		return nil
	})

	return txErr
}
