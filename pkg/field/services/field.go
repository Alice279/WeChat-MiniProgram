package services

import (
	"fmt"
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"gopkg.in/guregu/null.v4"
	"time"

	//"github.com/pkg/errors"
	"gorm.io/gorm"
)

type FieldService struct {
	db *gorm.DB
	sm *auth.SessionManager
}

func NewFieldService(db *gorm.DB, sm *auth.SessionManager) *FieldService {
	return &FieldService{db: db, sm: sm}
}

type LabelInfo struct {
	LabelID base.ID `json:"labelID"`

	LabelName string `json:"labelName"`
}

type EquipmentInfo struct {
	EquipmentID base.ID `json:"equipmentID"`

	EquipmentName string `json:"equipmentName"`

	EquipmentIconString string `json:"equipmentIconString"`
}

type FieldBasicInfo struct {
	FieldID base.ID `json:"fieldID"`

	FieldName string `json:"fieldName"`

	CoverPicURL string `json:"coverPicURL"`

	Capacity int `json:"capacity"`

	Address string `json:"address"`

	Labels []LabelInfo `json:"labels"`
}

type FieldStaticProfile struct {
	FieldID base.ID `json:"fieldID"`

	FieldName string `json:"fieldName"`

	CoverPicURL string `json:"coverPicURL"`

	Capacity int `json:"capacity"`

	Address string `json:"address"`

	OpenSlotString string `json:"OpenSlotString"`

	Description string `json:"description"`

	ContactInfo string `json:"contactInfo"`

	PictureURLs models.Pictures `json:"pictureURLs"`

	Labels []LabelInfo `json:"labels"`

	Equipments []EquipmentInfo `json:"equipments"`
}

// ------------- 测试初始化数据 -------------
type TestInitDataReq struct {
}

type TestInitDataRes struct {
}

func (s *FieldService) TestInitData(ctx *rpc.Context, req *TestInitDataReq, res *TestInitDataRes) error {
	err := s.db.Transaction(func(tx *gorm.DB) error {
		label1 := models.FieldLabel{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:   "老年场馆",
			Fields: nil,
		}
		label2 := models.FieldLabel{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:   "青少年场馆",
			Fields: nil,
		}
		if err := tx.Create(&label1).Error; err != nil {
			return err
		}
		if err := tx.Create(&label2).Error; err != nil {
			return err
		}
		equipment1 := models.FieldEquipment{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:       "TV",
			IconPicURL: "TV_URL",
			Fields:     nil,
		}
		if err := tx.Create(&equipment1).Error; err != nil {
			return err
		}
		equipment2 := models.FieldEquipment{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:       "投影仪",
			IconPicURL: "投影仪_URL",
			Fields:     nil,
		}
		if err := tx.Create(&equipment2).Error; err != nil {
			return err
		}
		field1 := models.Field{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:        "活动中心",
			Location:    "石油大院",
			CoverPicURL: "coverURL",
			Address:     "中间的某个地址",
			Capacity:    110,
			Equipments:  []models.FieldEquipment{equipment1, equipment2},
			Labels:      []models.FieldLabel{label1, label2},
		}
		if err := tx.Create(&field1).Error; err != nil {
			return err
		}
		field2 := models.Field{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:        "棋牌室",
			Location:    "石油大院",
			CoverPicURL: "coverURL",
			Address:     "二号地址",
			Capacity:    50,
			Equipments:  []models.FieldEquipment{equipment2},
			Labels:      []models.FieldLabel{label1, label2},
		}
		if err := tx.Create(&field2).Error; err != nil {
			return err
		}
		field3 := models.Field{
			Model: base.Model{
				ID: base.NewID(),
			},
			Name:        "养生讲堂",
			Location:    "北医三院",
			CoverPicURL: "coverURL",
			Address:     "三号地址",
			Capacity:    1000,
			Equipments:  []models.FieldEquipment{},
			Labels:      []models.FieldLabel{label1},
		}
		if err := tx.Create(&field3).Error; err != nil {
			return err
		}

		profile1 := models.FieldProfile{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:       &field1,
			FieldID:     field1.ID,
			Description: "活动中心介绍",
			ContactInfo: "负责人联系方式",
			PictureURLs: models.Pictures{"pic_urls_1", "pic_urls_2"},
		}
		if err := tx.Create(&profile1).Error; err != nil {
			return err
		}
		profile2 := models.FieldProfile{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:   &field2,
			FieldID: field2.ID,

			Description: "棋牌室介绍",
			ContactInfo: "负责人联系方式-棋牌室",
			PictureURLs: models.Pictures{"pic_urls_3", "pic_urls_4"},
		}
		if err := tx.Create(&profile2).Error; err != nil {
			return err
		}
		profile3 := models.FieldProfile{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:       &field3,
			FieldID:     field3.ID,
			Description: "养生讲堂介绍",
			ContactInfo: "负责人联系方式-养生讲堂",
			PictureURLs: models.Pictures{"pic_urls_5", "pic_urls_6"},
		}
		if err := tx.Create(&profile3).Error; err != nil {
			return err
		}
		open1 := models.FieldOpenSlot{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:       &field1,
			FieldID:     field1.ID,
			BeginHour:   10,
			BeginMinute: 0,
			EndHour:     14,
			EndMinute:   0,
		}
		if err := tx.Create(&open1).Error; err != nil {
			return err
		}
		open2 := models.FieldOpenSlot{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:       &field2,
			FieldID:     field2.ID,
			BeginHour:   8,
			BeginMinute: 0,
			EndHour:     18,
			EndMinute:   0,
		}
		if err := tx.Create(&open2).Error; err != nil {
			return err
		}
		open3 := models.FieldOpenSlot{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:       &field3,
			FieldID:     field3.ID,
			BeginHour:   10,
			BeginMinute: 0,
			EndHour:     16,
			EndMinute:   0,
		}
		if err := tx.Create(&open3).Error; err != nil {
			return err
		}

		fmt.Println(time.Now())
		fmt.Println(time.Now().Local())
		nowTime := time.Now().Local()

		order1 := models.FieldOrder{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:      &field1,
			FieldID:    field1.ID,
			CreatorID:  123,
			Comment:    "活动中心预约-出资人1",
			BeginTime:  nowTime,
			EndTime:    nowTime,
			VerifiedAt: null.Time{},
			IsVerified: false,
		}
		if err := tx.Create(&order1).Error; err != nil {
			return err
		}
		order2 := models.FieldOrder{
			Model: base.Model{
				ID: base.NewID(),
			},
			Field:      &field2,
			FieldID:    field2.ID,
			CreatorID:  666,
			Comment:    "活动中心预约-出资人2",
			BeginTime:  nowTime,
			EndTime:    nowTime,
			VerifiedAt: null.Time{},
			IsVerified: false,
		}
		if err := tx.Create(&order2).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}
