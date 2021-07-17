package services

import (
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
)

type UserListReq struct {
	Pagination base.Pagination `json:"pagination"`
}

type UserListRes struct {
	// TotalNum 1234
	TotalNum int            `json:"totalNum"`
	Users    []*models.User `json:"users"`
}

func (s *UserService) List(ctx *rpc.Context, req *UserListReq, res *UserListRes) error {
	//su, err := s.sm.Extract(ctx)
	//if err != nil {
	//	return err
	//}
	//if !su.IsStaff {
	//	return base.ErrPermissionDenied
	//}
	var users []*models.User
	err := s.db.Model(models.User{}).Scopes(req.Pagination.AsScope()).Find(&users).Error
	if err != nil {
		return errors.WithStack(err)
	}
	res.Users = users
	return nil
}
