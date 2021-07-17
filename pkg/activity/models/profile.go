package models

import (
	"github.com/heymind/puki/pkg/base"
	"gopkg.in/guregu/null.v4"
	"gorm.io/datatypes"
)

type ActivityProfile struct {
	base.ModelNonPrimary

	ActivityID base.ID `gorm:"primaryKey;not null" json:"activityID"`

	Activity *Activity

	// 活动标题
	Title string `gorm:"not null" json:"title"`

	// 活动场地
	Field string `gorm:"not null" json:"field"`

	// 活动主图
	CoverPicURL string `gorm:"not null" json:"coverPicUrl"`

	// 活动主办方
	Sponsor null.String `gorm:"default:null" json:"sponsor"`

	// 活动报名电话
	OrganizerPhone string `gorm:"default:0" json:"origanizerNumber"`

	// 活动文字介绍
	Introduction string `gorm:"default:''" json:"introduction"`

	// 活动介绍图片URL
	PictureURLs Pictures `gorm:"type:text;default:''" json:"pictureUrls"`

	// 动态kv
	Extra datatypes.JSONMap `gorm:"type:text" json:"extra"`
}

func (a *ActivityProfile) SetExtra(extra map[string]string) {
	extraMap := make(map[string]interface{})
	for k, v := range extra {
		extraMap[k] = v
	}
	a.Extra = extraMap
}

func (a *ActivityProfile) GetExtra() map[string]string {
	extra := a.Extra
	extraMap := make(map[string]string)
	for k, v := range extra {
		extraMap[k] = v.(string)
	}
	return extraMap
}
