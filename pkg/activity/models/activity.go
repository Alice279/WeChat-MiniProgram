package models

import (
	"github.com/heymind/puki/pkg/base"
	log "github.com/sirupsen/logrus"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
	"strconv"
	"time"
)

type Activity struct {
	base.Model

	// 活动总人数
	TotalQuota int `gorm:"default:0" json:"totalQuota"`

	// 活动已报名人数
	ApplyQuota int `gorm:"default:0" json:"applyQuota"`

	// 活动假报名人数
	FakeQuota int `gorm:"default:0" json:"fakeQuota"`

	// 活动开始时间
	BeginTime time.Time `gorm:"not null" json:"beginTime"`

	// 活动结束时间
	EndTime time.Time `gorm:"not null" json:"endTime"`

	// 活动报名时间
	SignUpBegin time.Time `gorm:"not null" json:"signUpBegin"`

	// 活动报名截止时间
	SignUpEnd time.Time `gorm:"not null" json:"signUpEnd"`

	// 活动参与者
	Participants []*ActivitySignUp

	// 活动标签
	Labels []ActivityLabel `gorm:"many2many:activity_activity_labels;constraint::OnUpdate:CASCADE,OnDelete:CASCADE" json:"labels"`

	// 活动大场所
	Location string `gorm:"not null" json:"location"`

	// 活动积分
	Points int `gorm:"default:0" json:"points"`

	// 是否完成审核
	//VerifiedAt null.Time `gorm:"default:null" json:"verifiedAt"`

	// 是否需要审核
	//VerifyRequired bool `gorm:"default:false" json:"verifyRequired"`

	// 是否需要Check In
	//CheckinRequired bool `gorm:"default:false" json:"checkinRequired"`

	// 活动详细信息
	Profile *ActivityProfile `json:"profile"`

	// 拥有者ID
	UserID base.ID `gorm:"not null" json:"userID"`
}

// ------------ 接口设计 -------------
type ActivityBaseInfo struct {
	ID base.ID `json:"id"`

	// 活动名称
	Title string `validate:"required,max=25" json:"title" trans:"活动名称"`

	// 活动场地
	Field string `validate:"required,max=25" json:"field" trans:"活动场地"`

	// 活动大场所
	Location string `validate:"required,max=25" json:"location" trans:"活动地点"`

	// 活动主图
	CoverPicURL string `validate:"required" json:"coverPicUrl" trans:"封面图片"`

	// 活动总人数
	TotalQuota int `validate:"required,lte=1000" json:"totalQuota" trans:"活动人数"`

	// 活动已报名人数
	ApplyQuota int `validate:"lte=1000" json:"applyQuota" trans:"已报名人数"`

	// 活动假报名人数
	FakeQuota int `validate:"lte=10000" json:"fakeQuota" trans:"虚拟人数"`

	// 活动开始时间
	Begin time.Time `validate:"required" json:"begin" trans:"活动开始时间"`

	// 活动结束时间
	End time.Time `validate:"required" json:"end" trans:"活动结束时间"`

	// 活动报名时间
	SignUpBegin time.Time `validate:"required" json:"signUpBegin" trans:"报名开始时间"`

	// 活动报名截止时间
	SignUpEnd time.Time `validate:"required" json:"signUpEnd" trans:"报名结束时间"`

	// 活动标签
	Labels []ActivityLabel `json:"labels" trans:"活动标签"`
}

type ActivityAllInfo struct {
	ActivityBaseInfo

	// 活动主办方
	Sponsor null.String `validate:"required,max=25" json:"sponsor" trans:"赞助商"`

	// 活动报名电话
	OriganizerNumber string `validate:"required" json:"origanizerNumber" trans:"主办方电话"`

	// 活动文字介绍
	Introduction string `validate:"required,max=200" json:"introduction" trans:"活动介绍"`

	// 活动介绍图片URL
	PictureURLs Pictures `validate:"required" json:"pictureUrls" trans:"活动详情图"`

	// 活动积分
	Points int `validate:"max=100,min=0" json:"points" trans:"活动积分"`

	// 活动动态kv
	Extra map[string]string `json:"extra"`
}

func FindAllActivities(db *gorm.DB) ([]Activity, error) {
	var activities []Activity
	err := db.Preload("Labels").Preload("Profile").Find(&activities).Error
	return activities, err
}

func FindActivityByID(db *gorm.DB, ID base.ID) (*Activity, error) {
	var activity Activity
	err := db.Model(&Activity{}).Preload("Labels").Preload("Profile").First(&activity, ID).Error
	return &activity, err
}

func TimeTransformer(activity ActivityAllInfo) ActivityAllInfo {
	activity.Begin = activity.Begin.Local()
	activity.End = activity.End.Local()
	activity.SignUpBegin = activity.SignUpBegin.Local()
	activity.SignUpEnd = activity.SignUpEnd.Local()
	return activity
}

func Activity2ActivityBaseInfo(activity Activity) ActivityBaseInfo {
	var activityBaseInfo ActivityBaseInfo
	if activity.Profile != nil {
		activityBaseInfo = ActivityBaseInfo{
			ID:          activity.ID,
			Title:       activity.Profile.Title,
			Field:       activity.Profile.Field,
			Location:    activity.Location,
			CoverPicURL: activity.Profile.CoverPicURL,
			TotalQuota:  activity.TotalQuota,
			ApplyQuota:  activity.ApplyQuota,
			FakeQuota:   activity.FakeQuota,
			Begin:       activity.BeginTime,
			End:         activity.EndTime,
			SignUpBegin: activity.SignUpBegin,
			SignUpEnd:   activity.SignUpEnd,
			Labels:      activity.Labels,
		}
	} else {
		activityBaseInfo = ActivityBaseInfo{
			ID:          activity.ID,
			Title:       "",
			Field:       "",
			Location:    activity.Location,
			CoverPicURL: "",
			TotalQuota:  activity.TotalQuota,
			ApplyQuota:  activity.ApplyQuota,
			FakeQuota:   activity.FakeQuota,
			Begin:       activity.BeginTime,
			End:         activity.EndTime,
			SignUpBegin: activity.SignUpBegin,
			SignUpEnd:   activity.SignUpEnd,
			Labels:      activity.Labels,
		}
		log.Error(strconv.FormatInt(int64(activity.ID), 10) + "没有链接Profile")
	}
	return activityBaseInfo
}

func Activity2ActivityAllInfo(activity Activity) ActivityAllInfo {
	var activityAllInfo ActivityAllInfo
	if activity.Profile != nil {
		activityAllInfo = ActivityAllInfo{
			ActivityBaseInfo: ActivityBaseInfo{
				ID:          activity.ID,
				Title:       activity.Profile.Title,
				Field:       activity.Profile.Field,
				Location:    activity.Location,
				CoverPicURL: activity.Profile.CoverPicURL,
				TotalQuota:  activity.TotalQuota,
				ApplyQuota:  activity.ApplyQuota,
				FakeQuota:   activity.FakeQuota,
				Begin:       activity.BeginTime,
				End:         activity.EndTime,
				SignUpBegin: activity.SignUpBegin,
				SignUpEnd:   activity.SignUpEnd,
				Labels:      activity.Labels,
			},
			Introduction:     activity.Profile.Introduction,
			PictureURLs:      activity.Profile.PictureURLs,
			OriganizerNumber: activity.Profile.OrganizerPhone,
			Sponsor:          activity.Profile.Sponsor,
			Points:           activity.Points,
		}
		activityAllInfo.Extra = activity.Profile.GetExtra()
	} else {
		activityAllInfo = ActivityAllInfo{
			ActivityBaseInfo: ActivityBaseInfo{
				ID:          activity.ID,
				Title:       "",
				Field:       "",
				CoverPicURL: "",
				Location:    activity.Location,
				TotalQuota:  activity.TotalQuota,
				ApplyQuota:  activity.ApplyQuota,
				FakeQuota:   activity.FakeQuota,
				Begin:       activity.BeginTime,
				End:         activity.EndTime,
				SignUpBegin: activity.SignUpBegin,
				SignUpEnd:   activity.SignUpEnd,
				Labels:      activity.Labels,
			},
			Introduction:     "",
			PictureURLs:      nil,
			OriganizerNumber: "",
			Sponsor:          null.String{},
			Points:           activity.Points,
		}
		log.Error(strconv.FormatInt(int64(activity.ID), 10) + "没有链接Profile")
	}
	return activityAllInfo
}
