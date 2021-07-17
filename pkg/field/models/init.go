package models

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) error {
	if err := db.AutoMigrate(&Field{}, &FieldProfile{}, &FieldOpenSlot{}, &FieldOrder{}, &FieldLabel{}, &FieldEquipment{}); err != nil {
		return errors.WithStack(err)
	}
	return nil
}

func Cleanup(db *gorm.DB) error {
	return db.Migrator().DropTable(&Field{}, &FieldLabel{}, &FieldEquipment{}, &FieldProfile{}, &FieldOpenSlot{}, &FieldOrder{}, "field_field_labels", "field_field_equipments")
}
