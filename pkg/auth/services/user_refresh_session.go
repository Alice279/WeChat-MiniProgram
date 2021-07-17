package services

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base/rpc"
)

type RefreshSessionReq struct {
	DeviceToken string `json:"deviceToken"`
}

type RefreshSessionRes struct {
	Session string       `json:"session"`
	User    *models.User `json:"user"`
}

func (s *UserService) RefreshSession(ctx *rpc.Context, req *RefreshSessionReq, res *RefreshSessionRes) error {
	tk, err := auth.NewDeviceTokenFromString(req.DeviceToken)
	if err != nil {
		return err
	}
	tx := s.db.WithContext(ctx).Begin()

	user, err := tk.Check(tx)
	if err != nil {
		return err
	}

	user, su, err := auth.NewSessionUser(user.ID, tx)
	if err != nil {
		return err
	}

	session, err := s.sm.Store(ctx, su)
	if err != nil {
		return err
	}

	res.Session = session
	res.User = user

	return tx.Commit().Error
}
