package services

import (
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
)

type UserDetailReq struct {
	ID base.ID `json:"id,omitempty"`
}

type UserDetailRes struct {
	User *models.User `json:"user"`
}

func (s *UserService) UserDetail(ctx *rpc.Context, req *UserDetailReq, res *UserDetailRes) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return err
	}
	var id base.ID
	if (su.IsStaff || su.IsSuper) && req.ID != 0 {
		id = req.ID
	} else {
		id = su.ID
	}
	var user models.User
	err = s.db.Model(models.User{}).First(&user, id).Error
	if err != nil {
		return errors.WithStack(err)
	}
	res.User = &user
	return nil
}
