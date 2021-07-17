package services

import (
	"github.com/go-resty/resty/v2"
	"github.com/heymind/puki/pkg/auth"
	"gorm.io/gorm"
)

type UserService struct {
	db          *gorm.DB
	sm          *auth.SessionManager
	wechatLogin *userServiceWechatLoginConfig
}

type userServiceWechatLoginConfig struct {
	client    *resty.Client
	appID     string
	appSecret string
}

func NewUserService(db *gorm.DB, sm *auth.SessionManager) *UserService {
	return &UserService{db: db, sm: sm}
}

func (s *UserService) EnableWechatLogin(appId, secret string, client *resty.Client) {
	if client == nil {
		client = resty.New()
	}
	s.wechatLogin = &userServiceWechatLoginConfig{appID: appId, appSecret: secret, client: client}
}
