package models

import "github.com/heymind/puki/pkg/base"

type Role struct {
	base.Model
	ParentID    base.ID      `gorm:"type:bigint" json:"parentID"`
	ParentRole  *Role        `gorm:"foreignKey:ParentID;references:ID" json:"parentRole"`
	Name        string       `gorm:"unique;not null" json:"name"`
	Title       string       `gorm:"not null" json:"title"`
	Description string       `gorm:"not null" json:"description"`
	Permissions []Permission `gorm:"many2many:role_permissions;constraint:OnDelete:CASCADE;" json:"permissions"`
}

type RolePermission struct {
	RoleID       base.ID `gorm:"type:bigint;primaryKey;not null;"`
	PermissionID base.ID `gorm:"type:bigint;primaryKey;not null;"`
}
