package models

import (
	"github.com/heymind/puki/pkg/base"
)

type UserDevice struct {
	base.Model
	User      *User
	UserID    base.ID
	Key1      uint64
	Key2      uint64
	UserAgent string
}
