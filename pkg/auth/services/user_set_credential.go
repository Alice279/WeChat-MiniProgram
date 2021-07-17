package services

import (
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
)

type UserSetCredentialReq struct {
	UserName string `validate:"required,alphanum,max=25,min=5" json:"userName" trans:"用户名"`
	Password string `validate:"required,printascii,min=6,max=30" json:"password" trans:"密码"`
}

type UserSetCredentialRes struct {
	User *models.User `json:"user"`
}

func (s *UserService) SetCredential(ctx *rpc.Context, req *UserSetCredentialReq, res *UserSetCredentialRes) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return err
	}

	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var user models.User
		err := tx.Model(&models.User{}).First(&user, su.ID).Error
		if err != nil {
			return errors.WithStack(err)
		}
		if user.UserName.Valid {
			return base.UserErrorf(nil, "SetCredential: 用户已设置用户名和密码，用户名一旦设置不可修改。")
		}
		var cnt int64
		err = tx.Model(&models.User{}).Where("user_name", req.UserName).Count(&cnt).Error
		if err != nil {
			return errors.WithStack(err)
		}

		if cnt > 0 {
			return base.UserErrorf(nil, "SetCredential: 用户已存在。")
		}

		user.UserName = null.StringFrom(req.UserName)
		err = user.SetPassword(req.Password)
		if err != nil {
			return errors.WithStack(err)
		}

		err = tx.Save(&user).Error
		if err != nil {
			return errors.WithStack(err)
		}

		res.User = &user
		return nil

	})

	return err

}
