package models

import (
	"github.com/heymind/puki/pkg/base"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/guregu/null.v4"
)

// 用户模型
type User struct {
	base.Model

	// 「用户名」用于用户名、密码组合登录中的用户名，全局唯一；可空，若空，则该用户未设置用户名，无法使用 "用户名、密码组合登录"
	UserName null.String `gorm:"unique;default:null" json:"userName"`
	// 「密码」用于用户名、密码组合登录中的密码
	Password string `json:"-"`

	// 「手机号」用于手机号、验证码登录组合，全局唯一。可空，若空，则该用户未设置手机号，无法使用 "手机号、验证码组合登录"
	// 格式为 <国家编号><手机号>，如 8615511123234
	PhoneNumber null.Int `gorm:"unique;default:null" json:"phoneNumber"`

	// 「真实姓名」未设置为空字符串
	RealName string `gorm:"not null" json:"realName"`

	// 「头像」 URL 未设置为空字符串
	AvatarURI string `gorm:"not null" json:"avatarURI"`

	// 「昵称」用于对外展示
	NickName string `gorm:"not null" json:"nickName"`

	Permissions []Permission `gorm:"many2many:user_permissions;constraint:OnDelete:CASCADE;" json:"permissions"`
	Roles       []Role       `gorm:"many2many:user_roles;constraint:OnDelete:CASCADE;" json:"roles"`

	IsStaff bool `gorm:"not null;default:false" json:"isStaff,omitempty"`
	IsSuper bool `gorm:"not null;default:false" json:"isSuper,omitempty"`

	// 「账号是否被禁用」
	IsDisabled null.Bool `gorm:"not null;default:false" json:"isDisabled"`
}

type UserPermission struct {
	UserID       base.ID `gorm:"type:bigint;primaryKey;not null;"`
	PermissionID base.ID `gorm:"type:bigint;primaryKey;not null;"`
}

type UserRole struct {
	UserID base.ID `gorm:"type:bigint;primaryKey;not null;"`
	RoleID base.ID `gorm:"type:bigint;primaryKey;not null;"`
}

func (user *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

//
//func (user *User) SetGender(gender null.Bool) error {
//	user.Gender = gender
//
//	return nil
//}
//
//func (user *User) SetNickName(nickName string) error {
//	user.NickName = nickName
//
//	return nil
//}
//
func (user *User) SetPassword(passWord string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(passWord), 14)
	if err != nil {
		log.Fatal(err)
	}
	user.Password = string(hashed)

	return nil
}

//
//func (user *User) SetRealName(realName string) error {
//	user.RealName = realName
//
//	return nil
//}
//
//func (user *User) SetUserName(tx *gorm.DB, userName string) error {
//	if userName == "" {
//		user.UserName = null.NewString("", false)
//		return nil
//	}
//	// TODO: remove non-ascii & length limit
//	anotherUser := FindUserByUserName(tx, userName)
//	if anotherUser != nil {
//		return base.UserErrorf(nil, "UserName exists")
//	}
//
//	user.UserName = null.StringFrom(userName)
//	return nil
//}
//
//func FindOrCreateUserByPhoneNumber(tx *gorm.DB, phoneNumber int64) *User {
//	var user User
//	user.PhoneNumber = phoneNumber
//	if err := tx.Model(&User{}).Where(&user).First(&user).Error; err == nil {
//		// 已有该用户
//		return &user
//	} else {
//		log.Debug(err)
//	}
//	// 注册新用户
//	user.ID = base.NewID() // 需要手动生成ID
//	if err := tx.Model(&User{}).Create(&user).Error; err != nil {
//		log.Panicf("%+v", err)
//	}
//
//	return &user
//}
//
//func FindUserById(tx *gorm.DB, id int64) *User {
//	var user User
//	if err := tx.Model(&User{}).First(&user, id).Error; err == nil {
//		return &user
//	} else {
//		log.Debug(err)
//		return nil
//	}
//}
//
//func FindUserByUserName(tx *gorm.DB, userName string) *User {
//	if userName == "" {
//		return nil
//	}
//	var user User
//	if err := tx.Model(&User{}).Where(&User{UserName: null.StringFrom(userName)}).First(&user).Error; err == nil {
//		return &user
//	} else {
//		log.Debug(err)
//		return nil
//	}
//}
