package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"github.com/heymind/puki/pkg/activity/models"
	"github.com/heymind/puki/pkg/auth"
	userModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
	"net/url"
	"strconv"
	"time"
)

type SignUpService struct {
	db *gorm.DB
	sm *auth.SessionManager
}

func NewSignUpService(db *gorm.DB, sm *auth.SessionManager) *SignUpService {
	return &SignUpService{db, sm}
}

type SignUpRecord struct {
	UserID      base.ID                 `json:"userID"`
	ActivityID  base.ID                 `json:"activityID"`
	UserName    null.String             `json:"userName"`
	PhoneNumber null.Int                `json:"phoneNumber"`
	RealName    string                  `json:"realName"`
	NickName    string                  `json:"nickName"`
	Activity    models.ActivityBaseInfo `json:"activity"`
	SignUpTime  time.Time               `json:"signUpTime"`
	UserInfo    map[string]string       `json:"userInfo"`
}

// ------------- 某个用户报名 -------------
type SignUpActivityReq struct {
	ActivityID base.ID           `validate:"required" json:"activityID" trans:"活动ID"`
	Form       map[string]string `validate:"required" json:"form" trans:"报名表单"`
}

type SignUpActivityRes struct {
	Message string `json:"message"`
}

func (s *SignUpService) SignUpActivity(ctx *rpc.Context, req *SignUpActivityReq, res *SignUpActivityRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	//var err error
	//err = nil
	//var su base.Model
	//su.ID = 359565502013671165

	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}
	err = s.db.Transaction(func(db *gorm.DB) error {
		activity, err := models.FindActivityByID(db, req.ActivityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(err, "报名活动不存在")
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", req.ActivityID, errors.WithStack(err))
			return err
		}

		nowTime := time.Now()
		if nowTime.After(activity.SignUpEnd) || nowTime.Before(activity.SignUpBegin) {
			return base.UserErrorf(nil, "不在报名时间内")
		}

		var record models.ActivitySignUp
		err = models.FindRecordByUserIDAndActivityID(db, su.ID, req.ActivityID, &record)
		if err == nil {
			return base.UserErrorf(nil, "用户重复报名")
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.Debugf("can sign up activity %d", req.ActivityID)
		} else {
			ctx.Errorf("find sign up record %d-%d error: %+v", su.ID, req.ActivityID)
			return err
		}

		err = models.CreateSignUpRecord(db, su.ID, req.ActivityID, req.Form)
		if err != nil {
			ctx.Errorf("create sign up record %d-%d error: %+v", su.ID, req.ActivityID, errors.WithStack(err))
			return err
		}
		return nil
	})
	if err != nil {
		return err
	}

	ctx.Infof("sign up %d-%d", su.ID, req.ActivityID)
	res.Message = "报名成功"
	return nil
}

// ------------- 取消某个用户的报名 -------------
type CancelSignUpReq struct {
	ActivityID base.ID `validate:"required" json:"activityID" trans:"活动ID"`
}

type CancelSignUpRes struct {
	Message string `json:"message"`
}

func (s *SignUpService) CancelSignUp(ctx *rpc.Context, req *CancelSignUpReq, res *CancelSignUpRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}
	err = s.db.Transaction(func(db *gorm.DB) error {
		_, err := models.FindActivityByID(db, req.ActivityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(err, "活动不存在")
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", req.ActivityID, errors.WithStack(err))
			return err
		}

		var record models.ActivitySignUp
		err = models.FindRecordByUserIDAndActivityID(db, su.ID, req.ActivityID, &record)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(err, "用户没有报名")
		} else if err != nil {
			ctx.Errorf("find sign up record %d-%d error: %+v", su.ID, req.ActivityID, errors.WithStack(err))
			return err
		}
		err = models.DeleteSignUpRecord(db, su.ID, req.ActivityID)
		if err != nil {
			ctx.Errorf("delete sign up record %d-%d error: %+v", su.ID, req.ActivityID, errors.WithStack(err))
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}
	ctx.Infof("cancel sign up record %d-%d.", su.ID, req.ActivityID)
	res.Message = "取消报名成功"
	return nil
}

// ------------- 否定某个用户的报名 -------------
type CancelToVerifySignUpReq struct {
	UserID     base.ID `validate:"required" json:"userID" trans:"用户ID"`
	ActivityID base.ID `validate:"required" json:"activityID" trans:"活动ID"`
}

type CancelToVerifySignUpRes struct {
	Message string `json:"message"`
}

func (s *SignUpService) CancelToVerifySignUp(ctx *rpc.Context, req *CancelToVerifySignUpReq, res *CancelToVerifySignUpRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	err = s.db.Transaction(func(db *gorm.DB) error {
		activity, err := models.FindActivityByID(db, req.ActivityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(err, "活动不存在")
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", req.ActivityID, errors.WithStack(err))
			return err
		}

		if !su.IsStaff {
			return base.UserErrorf(nil, "没有权限进行后台操作")
		} else if !su.IsSuper {
			if activity.UserID != su.ID {
				return base.UserErrorf(nil, "没有权限操作不属于自己的活动")
			}
		}

		var record models.ActivitySignUp
		err = models.FindRecordByUserIDAndActivityID(db, req.UserID, req.ActivityID, &record)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(err, "用户没有报名")
		} else if err != nil {
			ctx.Errorf("find sign up record %d-%d error: %+v", req.UserID, req.ActivityID, errors.WithStack(err))
			return err
		}

		if !record.VerifiedAt.IsZero() {
			return base.UserErrorf(nil, "该报名信息已经被审核")
		}

		err = models.DeleteSignUpRecord(db, req.UserID, req.ActivityID)
		if err != nil {
			ctx.Errorf("delete sign up record %d-%d error: %+v", req.UserID, req.ActivityID, errors.WithStack(err))
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}

	ctx.Infof("cancel sign up record %d-%d.", req.UserID, req.ActivityID)
	res.Message = "审核不通过"
	return nil
}

// ------------- 审核某次报名 -------------
type VerifySignUpReq struct {
	UserID     base.ID `validate:"required" json:"userID" trans:"用户ID"`
	ActivityID base.ID `validate:"required" json:"activityID" trans:"活动ID"`
}

type VerifySignUpRes struct {
	Message string `json:"message"`
}

func (s *SignUpService) VerifySignUp(ctx *rpc.Context, req *VerifySignUpReq, res *VerifySignUpRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	activity, err := models.FindActivityByID(s.db, req.ActivityID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "活动不存在")
	} else if err != nil {
		ctx.Errorf("find activity %d error: %+v", req.ActivityID, errors.WithStack(err))
		return err
	}

	if !su.IsStaff {
		return errors.New("没有权限进行后台操作")
	} else if !su.IsSuper {
		if activity.UserID != su.ID {
			return base.UserErrorf(nil, "没有权限操作不属于自己的活动")
		}
	}

	var record models.ActivitySignUp
	err = models.FindRecordByUserIDAndActivityID(s.db, req.UserID, req.ActivityID, &record)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "待审核报名信息不存在")
	} else if err != nil {
		ctx.Errorf("find sign up %d-%d error: %+v", req.UserID, req.ActivityID, errors.WithStack(err))
		return err
	}

	if !record.VerifiedAt.IsZero() {
		return base.UserErrorf(nil, "该报名记录已经审核")
	}

	// 更新ActivityProfile中的已报名人数
	activity = record.Activity
	if activity != nil {
		activity.ApplyQuota = activity.ApplyQuota + 1
		err := s.db.Save(&activity).Error
		if err != nil {
			ctx.Errorf("update activity %d apply quota error: %+v", req.ActivityID, errors.WithStack(err))
			return err
		}
	}

	// 更新Activity中的信息
	record.VerifiedAt = null.NewTime(time.Now(), true)
	err = s.db.Save(&record).Error
	if err != nil {
		ctx.Errorf("update sign up record %d-%d error: %+v", req.UserID, req.ActivityID, errors.WithStack(err))
		return err
	}

	ctx.Infof("veriyf sign up record %d-%d.", req.UserID, req.ActivityID)
	res.Message = "审核成功"
	return nil
}

// ------------- 获取单个活动的所有报名人员 -------------
type UserInfo struct {
	User        userModels.User   `json:"user"`
	Info        map[string]string `json:"info"`
	PointedTime null.Time         `json:"pointedTime"`
}

type GetActivitySignUpListReq struct {
	ID         base.ID         `validate:"required" json:"id" trans:"活动ID"`
	Pagination base.Pagination `json:"pagination"`
}

type GetActivitySignUpListRes struct {
	Pagination base.Pagination `json:"pagination"`
	UserInfos  []UserInfo      `json:"userInfos"`
}

func (s *SignUpService) GetActivitySignUpList(ctx *rpc.Context, req *GetActivitySignUpListReq, res *GetActivitySignUpListRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	activity, err := models.FindActivityByID(s.db, req.ID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "活动不存在")
	} else if err != nil {
		ctx.Errorf("find activity %d error: %+v", req.ID, errors.WithStack(err))
		return err
	}

	if !su.IsStaff {
		return base.UserErrorf(nil, "没有权限获取后台信息")
	} else if !su.IsSuper {
		if su.ID != activity.UserID {
			return base.UserErrorf(nil, "没有权限获取不属于自己的后台信息")
		}
	}

	var signUpRecords []models.ActivitySignUp
	err = s.db.Model(models.ActivitySignUp{}).Preload("User").Where("activity_id = ? and verified_at IS NOT NULL", req.ID).Scopes(req.Pagination.AsScope()).Find(&signUpRecords).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "没有人报名该活动或有人报名但未审核")
	} else if err != nil {
		ctx.Errorf("find activity %d sign up records error: %+v", req.ID, errors.WithStack(err))
		return err
	}

	var totalNum int64
	err = s.db.Model(models.ActivitySignUp{}).Where("activity_id = ? and verified_at IS NOT NULL", req.ID).Count(&totalNum).Error
	if err != nil {
		ctx.Errorf("count activity %d sign up records error: %+v", req.ID, errors.WithStack(err))
		return err
	}

	if len(signUpRecords) > 0 {
		var userInfos []UserInfo
		for _, record := range signUpRecords {
			if record.User != nil {
				newUserInfo := UserInfo{
					User:        *record.User,
					Info:        record.GetSignUpInfo(),
					PointedTime: record.CheckinAt,
				}
				userInfos = append(userInfos, newUserInfo)
			}
		}
		res.Pagination.TotalNum = int(totalNum)
		res.UserInfos = userInfos
	} else {
		return base.UserErrorf(nil, "没有人报名该活动或有人报名但未审核")
	}
	return nil
}

// ------------- 获取某个活动待审核的报名记录 -------------
type ToVerifiedSignUpRecordListReq struct {
	ActivityID base.ID         `validate:"required" json:"activityID"`
	Pagination base.Pagination `json:"pagination"`
}

type ToVerifiedSignUpRecordListRes struct {
	Pagination base.Pagination `json:"pagination"`
	Records    []SignUpRecord  `json:"records"`
}

func (s *SignUpService) ToVerifiedSignUpRecordList(ctx *rpc.Context, req *ToVerifiedSignUpRecordListReq, res *ToVerifiedSignUpRecordListRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	activity, err := models.FindActivityByID(s.db, req.ActivityID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "活动不存在")
	} else if err != nil {
		ctx.Errorf("find activity %d error: %+v", req.ActivityID, errors.WithStack(err))
		return err
	}

	if !su.IsStaff {
		return base.UserErrorf(nil, "没有权限获取后台信息")
	} else if !su.IsSuper {
		if su.ID != activity.UserID {
			return base.UserErrorf(nil, "没有权限获取不属于自己的后台信息")
		}
	}

	var signUpRecords []models.ActivitySignUp
	//err = s.db.Model(&models.ActivitySignUp{}).Preload("User").Joins("JOIN activities ON activity_sign_ups.activity_id = activities.id").Where("verified_at IS NULL and activities.user_id = ?", su.ID).Scopes(req.Pagination.AsScope()).Find(&signUpRecords).Error
	err = s.db.Model(&models.ActivitySignUp{}).Preload("User").Where("verified_at IS NULL and activity_id = ?", req.ActivityID).Scopes(req.Pagination.AsScope()).Find(&signUpRecords).Error
	if err != nil {
		ctx.Errorf("find sign up record error: %+v", errors.WithStack(err))
		return err
	}

	var totalNum int64
	//err = s.db.Model(&models.ActivitySignUp{}).Joins("JOIN activities ON activity_sign_ups.activity_id = activities.id").Where("verified_at IS NULL and activities.user_id = ?", su.ID).Count(&totalNum).Error
	err = s.db.Model(&models.ActivitySignUp{}).Preload("User").Where("verified_at IS NULL and activity_id = ?", req.ActivityID).Count(&totalNum).Error
	if err != nil {
		ctx.Errorf("count sign up records error: %+v", errors.WithStack(err))
		return err
	}

	var records []SignUpRecord
	for _, signUpRecord := range signUpRecords {
		var activity models.Activity
		// 可能很高耗
		err := s.db.Model(&models.Activity{}).Preload("Profile").Where("id = ?", signUpRecord.ActivityID).First(&activity).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.Warnf("can't find activity %d", signUpRecord.ActivityID)
			continue
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", signUpRecord.ActivityID, errors.WithStack(err))
			return err
		}
		if signUpRecord.User != nil {
			record := SignUpRecord{
				UserName:    signUpRecord.User.UserName,
				UserID:      signUpRecord.UserID,
				ActivityID:  signUpRecord.ActivityID,
				PhoneNumber: signUpRecord.User.PhoneNumber,
				RealName:    signUpRecord.User.RealName,
				NickName:    signUpRecord.User.NickName,
				SignUpTime:  signUpRecord.UpdatedAt,
				UserInfo:    signUpRecord.GetSignUpInfo(),
				Activity:    models.Activity2ActivityBaseInfo(activity),
			}
			records = append(records, record)
		} else {
			ctx.Warnf("sign up record %d-%d don't link user schema item.", signUpRecord.UserID, signUpRecord.ActivityID)
		}
	}
	res.Records = records
	res.Pagination.TotalNum = int(totalNum)
	return nil
}

// ------------- 下载单个活动的所有报名人员 -------------
type ActivitySignUpListCSVReq struct {
	ID base.ID `validate:"required" json:"id" trans:"活动ID"`
}

type ActivitySignUpListCSVRes struct {
}

func Structs2StringArr(records []models.ActivitySignUp) [][]string {
	var userArr = make([][]string, 0)
	var record = models.ActivitySignUp{}

	for i := 0; i < len(records); i++ {
		record = records[i]
		userArr = append(userArr, []string{record.User.UserName.String, record.GetSignUpInfo()["姓名"], record.GetSignUpInfo()["性别"], strconv.FormatInt(record.User.PhoneNumber.Int64, 10),
			record.GetSignUpInfo()["微信号"], record.CreatedAt.Format("2006-01-02 15:04:05"), record.VerifiedAt.Time.Format("2006-01-02 15:04:05")})
	}
	return userArr
}

func (s *SignUpService) ActivitySignUpCSVList(ctx *rpc.Context, req *ActivitySignUpListCSVReq, res *rpc.Empty) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	activity, err := models.FindActivityByID(s.db, req.ID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "活动不存在")
	} else if err != nil {
		ctx.Errorf("find activity %d error: %+v", req.ID, errors.WithStack(err))
		return err
	}

	if !su.IsStaff {
		return base.UserErrorf(nil, "没有权限获取后台信息")
	} else if !su.IsSuper {
		if su.ID != activity.UserID {
			return base.UserErrorf(nil, "没有权限获取不属于自己的后台信息")
		}
	}

	var signUpRecords []models.ActivitySignUp
	err = s.db.Model(&models.ActivitySignUp{}).Preload("User").Where("activity_id = ? and verified_at IS NOT NULL", req.ID).Find(&signUpRecords).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "没有人报名该活动或有人报名但未审核")
	} else if err != nil {
		ctx.Errorf("find activity %d sign up records error: %+v", req.ID, errors.WithStack(err))
		return err
	}

	if len(signUpRecords) > 0 {

		userItemHeader := []string{"用户名", "真实姓名", "性别", "手机号", "微信号", "报名时间", "审核时间"}
		buffer := &bytes.Buffer{}
		writer := csv.NewWriter(buffer)
		userItems := Structs2StringArr(signUpRecords)
		err := writer.Write(userItemHeader)
		if err != nil {
			return err
		}
		for i := 0; i < len(userItems); i++ {
			err := writer.Write(userItems[i])
			if err != nil {
				return err
			}
		}
		var activity models.Activity
		err = s.db.Model(&models.Activity{}).Preload("Profile").Where("id = ?", req.ID).First(&activity).Error
		if err != nil {
			return err
		}
		writer.Flush()
		ctx.Writer.Header().Set("Content-Type", "text/csv")
		fileName := url.QueryEscape(activity.Profile.Title + "_" + activity.BeginTime.Format("2006-01-02 15:04:05"))
		ctx.Writer.Header().Set("Content-Disposition", fmt.Sprintf("attachment;filename=%s", fileName))
		ctx.Writer.Write(buffer.Bytes())
	} else {
		return base.UserErrorf(nil, "没有人报名该活动或有人报名但未审核")
	}
	return nil
}

// ------------- 查找某个用户报名的活动 -------------
type UserSignUpActivityReq struct {
}

type UserSignUpActivityRes struct {
	SignUpRecord []models.ActivitySignUp `json:"signUpRecord"`
}

func (s *SignUpService) UserSignUpActivity(ctx *rpc.Context, req *UserSignUpActivityReq, res *UserSignUpActivityRes) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	var signUpRecords []models.ActivitySignUp
	err = s.db.Model(&models.ActivitySignUp{}).Preload("Activity").Where("user_id = ?", su.ID).Order("created_at desc").Find(&signUpRecords).Error
	if err != nil {
		ctx.Errorf("find user %d sign up activities error: %+v", su.ID, errors.WithStack(err))
		return err
	}

	var records []models.ActivitySignUp
	for _, signUpRecord := range signUpRecords {
		var activity models.Activity
		// 可能很高耗
		err := s.db.Model(&models.Activity{}).Preload("Profile").Where("id = ?", signUpRecord.ActivityID).First(&activity).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.Warnf("can't find activity %d", signUpRecord.ActivityID)
			continue
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", signUpRecord.ActivityID, errors.WithStack(err))
			return err
		}

		if activity.Profile != nil {
			signUpRecord.Activity.Profile = activity.Profile
			records = append(records, signUpRecord)
		} else {
			ctx.Warnf("activity %d don't link profile schema item.", signUpRecord.ActivityID)
		}
	}

	res.SignUpRecord = records
	return nil
}

// ------------- 获取用户所有有待审核信息的活动 -------------
type GetToVerifyActivitiesReq struct {
}

type GetToVerifyActivitiesRes struct {
	Activities []models.ActivityBaseInfo `json:"activities"`
}

func (s *SignUpService) GetToVerifyActivities(ctx *rpc.Context, req *GetToVerifyActivitiesReq, res *GetToVerifyActivitiesRes) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	if !su.IsStaff {
		return base.UserErrorf(nil, "没有权限获取后台信息")
	}

	var activityIDs []base.ID
	err = s.db.Model(&models.ActivitySignUp{}).Select("activity_id").Joins("JOIN activities ON activity_sign_ups.activity_id = activities.id").Where("verified_at IS NULL and activities.user_id = ?", su.ID).Group("activity_id").Find(&activityIDs).Error
	if err != nil {
		ctx.Errorf("find user %d activity sign up records error: %+v", su.ID, err)
		return err
	}

	var activities []models.ActivityBaseInfo
	for _, activityID := range activityIDs {
		activity, err := models.FindActivityByID(s.db, activityID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.Warnf("can't find activity %d", activityID)
			continue
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", activityID, err)
			return err
		}
		activities = append(activities, models.Activity2ActivityBaseInfo(*activity))
	}
	res.Activities = activities
	return nil
}
