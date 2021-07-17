package services

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type UserLoginReq struct {
	DeviceID base.ID `json:"deviceID"`
	UserName string  `validate:"required" json:"userName"`
	Password string  `validate:"required" json:"password"`
}

type UserLoginRes struct {
	Session     string       `json:"session"`
	DeviceToken string       `json:"deviceToken"`
	DeviceID    base.ID      `json:"deviceId"`
	User        *models.User `json:"user"`
}

func (s *UserService) Login(ctx *rpc.Context, req *UserLoginReq, res *UserLoginRes) error {
	if su, _ := s.sm.Extract(ctx); su != nil {
		return base.UserErrorf(nil, "login: 用户已登录")
	}
	if req.UserName == "" || req.Password == "" {
		return base.UserErrorf(nil, "login: 用户名或密码不能为空")
	}
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		user := &models.User{}
		err := tx.Model(&models.User{}).Where("user_name", req.UserName).First(user).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return base.UserErrorf(err, "login: 用户名不存在")
			} else {
				return errors.WithStack(err)
			}
		}
		if !user.CheckPassword(req.Password) {
			return base.UserErrorf(nil, "login: 密码错误")
		}

		user, su, err := auth.NewSessionUser(user.ID, tx)
		if err != nil {
			return errors.WithStack(err)
		}

		deviceToken := auth.NewDeviceToken(user.ID)
		res.DeviceID, err = deviceToken.Store(tx, &models.UserDevice{Model: base.Model{ID: req.DeviceID}, UserAgent: ctx.Request.Header.Get("User-Agent")})
		if err != nil {
			return errors.WithStack(err)
		}
		res.DeviceToken, err = deviceToken.String()
		if err != nil {
			return errors.WithStack(err)
		}

		res.Session, err = s.sm.Store(ctx, su)
		if err != nil {
			return errors.WithStack(err)
		}
		res.User = user
		return nil

	})
	return err

}
