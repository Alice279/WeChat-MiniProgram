package models

import (
	"github.com/heymind/puki/pkg/base"
)

type JoinUs struct {
	base.Model
	Name    string `gorm:"not null;uniqueIndex;comment: 存储名称" json:"name" `
	Content string `gorm:"not null;comment: 存储加入我们相关内容" json:"content" `
}
