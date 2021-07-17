package models

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) error {
	err := db.AutoMigrate(&Swiper{})
	if err != nil {
		return errors.WithStack(err)
	}

	return nil
}
