package models

import "github.com/heymind/puki/pkg/base"

// FieldEquipment 设备类目
type FieldEquipment struct {
	base.Model

	// 设备名称
	Name string `gorm:"not null;unique" json:"name"`

	// 设备图标链接
	IconPicURL string `gorm:"not null" json:"iconPicUrl"`

	// 设备对应的场地
	Fields []Field `gorm:"many2many:field_field_equipments;" json:"fields"`
}
