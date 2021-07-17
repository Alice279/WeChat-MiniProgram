package base

import (
	"gorm.io/gorm"
	"time"
)

// add json tag in one line with `go run github.com/fatih/gomodifytags -file pkg/auth/user.go -struct Model  -add-tags json  -transform camelcase -w`
type Model struct {
	ID        ID             `gorm:"column:id;type:bigint;primaryKey;not null" json:"id"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deletedAt"`
}

type ModelNonPrimary struct {
	CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deletedAt"`
}
