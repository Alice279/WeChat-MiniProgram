package services

import (
	"encoding/json"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type UserWechatUpdateProfileReq struct {
	NickName  string `json:"nickName"`
	AvatarUrl string `json:"AvatarUrl"`
	Gender    int    `json:"gender"`
	Country   string `json:"country"`
	Province  string `json:"province"`
	City      string `json:"city"`
	Language  string `json:"language"`
}

type UserWechatUpdateProfileResp struct {
}

func (s *UserService) WechatUpdateProfile(ctx *rpc.Context, req *UserWechatUpdateProfileReq, res *UserWechatUpdateProfileResp) error {
	if s.wechatLogin == nil {
		return errors.New("WechatLogin is not enable")
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		return err
	}
	tx := s.db.WithContext(ctx)

	return tx.Transaction(func(tx *gorm.DB) error {
		err := tx.Model(&models.User{}).Where("id", su.ID).Updates(map[string]interface{}{"nick_name": req.NickName, "avatar_uri": req.AvatarUrl}).Error
		if err != nil {
			return errors.WithMessage(err, "update user")
		}

		info, err := json.Marshal(req)
		if err != nil {
			return err
		}

		err = tx.Model(&models.WechatUser{}).Where("user_id", su.ID).Update("info", info).Error
		if err != nil {
			return errors.WithMessage(err, "update wechat_user.info")
		}
		return nil
	})
}
