package models

import "github.com/heymind/puki/pkg/base"

type Permission struct {
	base.Model
	Name        string `gorm:"unique;not null" json:"name"`
	Title       string `gorm:"not null" json:"title"`
	Description string `gorm:"not null" json:"description"`
}
