package models

import (
	"github.com/heymind/puki/pkg/base"
)

type ActivityLabel struct {
	base.Model

	Name string `gorm:"not null;unique" json:"name"`

	Activities []Activity `gorm:"many2many:activity_activity_labels;"`
}
