package models

import (
	userModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"gopkg.in/guregu/null.v4"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type ActivitySignUp struct {
	base.ModelNonPrimary

	User *userModels.User

	UserID base.ID `gorm:"type:bigint;primaryKey;not null"`

	Activity *Activity `json:"activity"`

	ActivityID base.ID `gorm:"type:bigint;primaryKey;not null" json:"activityId"`

	VerifiedAt null.Time `gorm:"default:null" json:"verifiedAt"`

	CheckinAt null.Time `gorm:"default:null" json:"checkinAt"`

	SignUpInfo datatypes.JSONMap `gorm:"type:text" json:"signUpInfo"`
}

func FindRecordByUserIDAndActivityID(db *gorm.DB, userID base.ID, activityID base.ID, record *ActivitySignUp) error {
	err := db.Model(&ActivitySignUp{}).Preload("Activity").Where(&ActivitySignUp{UserID: userID, ActivityID: activityID}).First(&record).Error
	return err
}

func CreateSignUpRecord(db *gorm.DB, userID base.ID, activityID base.ID, form map[string]string) error {
	newSignUpRecord := ActivitySignUp{
		UserID:     userID,
		ActivityID: activityID,
	}
	newSignUpRecord.SetSignUpInfo(form)
	err := db.Create(&newSignUpRecord).Error
	return err
}

func DeleteSignUpRecord(db *gorm.DB, userID base.ID, activityID base.ID) error {
	err := db.Where(&ActivitySignUp{UserID: userID, ActivityID: activityID}).Delete(&ActivitySignUp{}).Error
	return err
}

func (a *ActivitySignUp) SetSignUpInfo(signUpInfo map[string]string) {
	signUpInfoMap := make(map[string]interface{})
	for k, v := range signUpInfo {
		signUpInfoMap[k] = v
	}
	a.SignUpInfo = signUpInfoMap
}

func (a *ActivitySignUp) GetSignUpInfo() map[string]string {
	signUpInfo := a.SignUpInfo
	signUpInfoMap := make(map[string]string)
	for k, v := range signUpInfo {
		signUpInfoMap[k] = v.(string)
	}
	return signUpInfoMap
}
