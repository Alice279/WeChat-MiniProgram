package services

import (
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/points/models"
)

type GetMyPointsReq struct {
}

type GetMyPointsRes struct {
	Points int `json:"points"`
}

func (s *PointsService) GetMyPoints(ctx *rpc.Context, req *GetMyPointsReq, res *GetMyPointsRes) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return err
	}
	var point models.Point
	if err := s.db.Model(&models.Point{}).First(&point, &models.Point{UserID: su.ID}).Error; err != nil {
		ctx.Errorf("find user's points %s", err.Error())
		point.Amount = 0
	}

	res.Points = point.Amount
	return nil
}
