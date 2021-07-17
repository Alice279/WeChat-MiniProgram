package services

import (
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
)

type UserSetAsStaffReq struct {
	ID base.ID `json:"id,omitempty"`
}

type UserSetAsStaffRes struct {
}

func (s *UserService) UserSetAsStaff(ctx *rpc.Context, req *UserSetAsStaffReq, res *UserSetAsStaffRes) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return err
	}
	if !su.IsSuper {
		return base.UserErrorf(nil, "您不是超级管理员，无此权限")
	}

	var user models.User
	err = s.db.Model(models.User{}).First(&user, req.ID).Error
	if err != nil {
		return base.UserErrorf(nil, "用户不存在")
	}
	user.IsStaff = true
	err = s.db.Save(&user).Error
	if err != nil {
		ctx.Error("save user %s", err.Error())
		return err
	}
	return nil
}
