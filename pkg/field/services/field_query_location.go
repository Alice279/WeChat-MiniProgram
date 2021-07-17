package services

import (
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type FieldQueryLocationsReq struct {
}

type FieldQueryLocationsRes struct {
	TotalNum  int      `json:"totalNum"`
	Locations []string `json:"locations"`
}

func (s *FieldService) QueryLocations(ctx *rpc.Context, req *FieldQueryLocationsReq, res *FieldQueryLocationsRes) error {
	_, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}

	txErr := s.db.Transaction(func(tx *gorm.DB) error {
		var locations []string
		selectFieldLocationErr := tx.Table("fields").Select("location").Distinct("location").Scan(&locations).Error
		if selectFieldLocationErr != nil {
			ctx.Errorf("select field locations error: %+v", errors.WithStack(selectFieldLocationErr))
		}
		res.Locations = locations
		res.TotalNum = len(locations)
		ctx.Infof("[QueryLocations] res: %+v", res)
		return nil
	})
	return txErr
}
