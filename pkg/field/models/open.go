package models

import "github.com/heymind/puki/pkg/base"

// FieldOpenSlot 场地开放时段的条目
type FieldOpenSlot struct {
	base.Model

	Field *Field `json:"field"`

	FieldID base.ID `json:"fieldID"`

	// 开放时段开始时间
	BeginHour   int `gorm:"not null" validate:"required,gte=0,lte=23" json:"beginHour"`
	BeginMinute int `gorm:"not null" validate:"required,gte=0,lte=59" json:"beginMinute"`

	// 开放时段结束时间
	EndHour   int `gorm:"not null" validate:"required,gte=0,lte=23" json:"endHour"`
	EndMinute int `gorm:"not null" validate:"required,gte=0,lte=59" json:"endMinute"`
}
