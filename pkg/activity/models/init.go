package models

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) error {
	if err := db.AutoMigrate(&Activity{}, &ActivityLabel{}, &ActivityProfile{}, &ActivitySignUp{}); err != nil {
		return errors.WithStack(err)
	}
	return nil
}
