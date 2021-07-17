package models

import "github.com/heymind/puki/pkg/base"
import "gorm.io/datatypes"

type WechatUser struct {
	base.ModelNonPrimary
	UserID     base.ID `gorm:"primaryKey"`
	User       *User
	AppID      string         `gorm:"primary key;not null;uniqueIndex:app_id_open_id"`
	OpenID     string         `gorm:"not null;uniqueIndex:app_id_open_id"`
	UnionID    string         `gorm:"not null"`
	SessionKey string         `gorm:"not null"`
	Info       datatypes.JSON `gorm:"type:jsonb,not null"`
}
