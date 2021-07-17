package models

import (
	"github.com/heymind/puki/pkg/base"
	"gopkg.in/guregu/null.v4"
	"gorm.io/datatypes"
)

type FieldProfile struct {
	base.Model

	Field *Field `json:"field"`

	FieldID base.ID `gorm:"unique" json:"fieldID"`

	// 场地介绍
	Description string `gorm:"not null" json:"description"`

	// 活动介绍图片URL
	PictureURLs Pictures `gorm:"type:text;default:''" json:"pictureUrls"`

	// 负责人微信
	ContactWechat null.String `json:"contactWechat"`

	// 负责人邮箱
	//ContactEmail	null.String	`json:"contactEmail"`

	// 负责人联系方式
	ContactInfo string `gorm:"not null" json:"contactInfo"`

	// 场地详情动态kv
	Extra datatypes.JSONMap `gorm:"type:text" json:"extra"`
}

func (a *FieldProfile) SetExtra(extra map[string]string) {
	extraMap := make(map[string]interface{})
	for k, v := range extra {
		extraMap[k] = v
	}
	a.Extra = extraMap
}

func (a *FieldProfile) GetExtra() map[string]string {
	extra := a.Extra
	extraMap := make(map[string]string)
	for k, v := range extra {
		extraMap[k] = v.(string)
	}
	return extraMap
}
