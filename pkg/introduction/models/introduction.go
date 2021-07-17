package models

import (
	"github.com/heymind/puki/pkg/base"
)

type Introduction struct {
	base.Model
	Name    string `gorm:"not null;uniqueIndex;comment: 存储名称" json:"name" `
	Content string `gorm:"not null;comment: 存储介绍相关内容" json:"content"`
}

// Content 内容为IntroductionItem List json序列化后内容，
//type IntroductionItem struct {
//	Title   string
//	Icon    string
//	Content string
//	IsCopy  string
//	Address string
//}
