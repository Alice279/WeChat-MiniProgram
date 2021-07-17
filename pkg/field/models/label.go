package models

import "github.com/heymind/puki/pkg/base"

// FieldLabel 场地分类标签
type FieldLabel struct {
	base.Model

	// 场地分类标签名
	Name string `gorm:"not null;unique" json:"name"`

	// 分类标签对应的场地
	Fields []Field `gorm:"many2many:field_field_labels;" json:"fields"`
}
