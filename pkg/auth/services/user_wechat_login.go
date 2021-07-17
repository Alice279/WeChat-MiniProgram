package services

import (
	"encoding/json"
	"fmt"
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

const (
	code2SessionURL = "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code"
)

type UserWechatLoginReq struct {
	DeviceID base.ID `json:"deviceId,omitempty"`
	Code     string  `json:"code"`
}

type UserWechatLoginResp struct {
	Session     string       `json:"session"`
	DeviceToken string       `json:"deviceToken"`
	DeviceID    base.ID      `json:"deviceId"`
	User        *models.User `json:"user"`
}

func (s *UserService) WechatLogin(ctx *rpc.Context, req *UserWechatLoginReq, res *UserWechatLoginResp) error {
	if s.wechatLogin == nil {
		return errors.New("WechatLogin is not enable")
	}

	appId := s.wechatLogin.appID
	secret := s.wechatLogin.appSecret
	client := s.wechatLogin.client

	var result struct {
		ErrCode    int64  `json:"errcode"`
		ErrMsg     string `json:"errmsg"`
		OpenID     string `json:"openid"`
		SessionKey string `json:"session_key"`
		UnionID    string `json:"unionid"`
	}

	resp, err := client.R().Get(fmt.Sprintf(code2SessionURL, appId, secret, req.Code))

	if err != nil {
		return errors.WithStack(err)
	}

	err = json.Unmarshal(resp.Body(), &result)
	if err != nil {
		return errors.WithStack(err)
	}

	if result.ErrCode != 0 {
		return fmt.Errorf("Code2Session error : errcode=%v , errmsg=%v", result.ErrCode, result.ErrMsg)
	}

	tx := s.db.WithContext(ctx).Begin()

	var weuser models.WechatUser
	err = tx.Model(models.WechatUser{}).First(&weuser, models.WechatUser{AppID: appId, OpenID: result.OpenID}).Error

	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.WithStack(err)
		}
		// create
		weuser.User = &models.User{}
		weuser.User.ID = base.NewID()
		weuser.AppID = appId
		weuser.OpenID = result.OpenID
		weuser.UnionID = result.UnionID
		weuser.SessionKey = result.SessionKey
		if err = tx.Create(&weuser.User).Error; err != nil {
			return errors.WithStack(err)
		}
		if err = tx.Create(&weuser).Error; err != nil {
			return errors.WithStack(err)
		}
	} else {
		// update
		if weuser.SessionKey != result.SessionKey {
			weuser.SessionKey = result.SessionKey
			if err = tx.Save(&weuser).Error; err != nil {
				return errors.WithStack(err)
			}
		}
	}

	user, su, err := auth.NewSessionUser(weuser.UserID, tx)
	if err != nil {
		return errors.WithStack(err)
	}

	DeviceToken := auth.NewDeviceToken(user.ID)
	res.DeviceID, err = DeviceToken.Store(tx,
		&models.UserDevice{Model: base.Model{ID: req.DeviceID}, UserAgent: ctx.Request.Header.Get("User-Agent")})
	if err != nil {
		return errors.WithStack(err)
	}
	res.DeviceToken, err = DeviceToken.String()
	if err != nil {
		return errors.WithStack(err)
	}

	sessionKey, err := s.sm.Store(ctx, su)
	if err != nil {
		return errors.WithStack(err)
	}

	res.Session = sessionKey
	res.User = user

	return tx.Commit().Error
}
