package models

import (
	"github.com/heymind/puki/pkg/base"
)

type Field struct {
	base.Model

	// 场地名称
	Name string `gorm:"not null" json:"name"`

	// 场地所处位置
	// Example: "石油大院"
	Location string `gorm:"not null" json:"location"`

	// 场地主图
	CoverPicURL string `gorm:"not null" json:"coverPicUrl"`

	// 场地地址
	Address string `gorm:"not null" json:"address"`

	// 可预约人数
	Capacity int `gorm:"not null" json:"capacity"`

	// 场地设备
	Equipments []FieldEquipment `gorm:"many2many:field_field_equipments;" json:"equipments"`

	// 场地标签
	Labels []FieldLabel `gorm:"many2many:field_field_labels;" json:"labels"`

	// 场地开放时间段
	OpenSlots []FieldOpenSlot `json:"openSlots"`
}
