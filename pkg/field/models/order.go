package models

import (
	"github.com/heymind/puki/pkg/base"
	"gopkg.in/guregu/null.v4"
	"time"
)

// FieldOrder 场地预约订单的条目
type FieldOrder struct {
	base.Model

	Field *Field `json:"field"`

	FieldID base.ID `json:"fieldID"`

	// 场地预约订单名
	OrderName string `gorm:"not null" json:"name"`

	// 场地预约订单备注
	Comment string `gorm:"not null" json:"comment"`

	// 场地预约订单创建人
	CreatorID base.ID `gorm:"not null" json:"creatorID"`

	BeginTime time.Time `json:"beginTime"`

	EndTime time.Time `json:"endTime"`

	// 订单审核时间
	VerifiedAt null.Time `json:"verifiedAt"`

	// 订单是否已审核
	// Default: false
	IsVerified bool `gorm:"default:false" json:"isVerified"`
}
