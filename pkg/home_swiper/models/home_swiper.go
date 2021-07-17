package models

import (
	"github.com/heymind/puki/pkg/activity/models"
	"github.com/heymind/puki/pkg/base"
)

type Swiper struct {
	base.Model
	Urls models.Pictures `gorm:"type:text;not null;comment: 存储轮播图内容" json:"urls"`
}
