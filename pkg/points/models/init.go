package models

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) error {
	err := db.AutoMigrate(&Point{}, &PointChange{})
	if err != nil {
		return errors.WithStack(err)
	}

	return nil
}

func Cleanup(db *gorm.DB) error {
	return db.Migrator().DropTable(&Point{}, &PointChange{})
}
