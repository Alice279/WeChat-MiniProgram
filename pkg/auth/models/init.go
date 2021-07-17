/* 数据库模型定义

 */
package models

import (
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) error {
	if err := db.SetupJoinTable(&User{}, "Permissions", &UserPermission{}); err != nil {
		return errors.WithStack(err)
	}
	if err := db.SetupJoinTable(&User{}, "Roles", &UserRole{}); err != nil {
		return errors.WithStack(err)
	}
	if err := db.SetupJoinTable(&Role{}, "Permissions", &RolePermission{}); err != nil {
		return errors.WithStack(err)
	}
	err := db.AutoMigrate(&User{}, &Role{}, &UserRole{}, &UserPermission{}, &Permission{}, &RolePermission{}, &WechatUser{}, &UserDevice{})
	if err != nil {
		return errors.WithStack(err)
	}

	return nil
}

func Cleanup(db *gorm.DB) error {
	return db.Migrator().DropTable(&UserPermission{}, &RolePermission{}, &UserRole{}, &User{}, &Role{}, &Permission{}, &WechatUser{}, &UserDevice{})
}
