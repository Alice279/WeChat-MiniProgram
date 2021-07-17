package services

import (
	"fmt"
	"github.com/heymind/puki/pkg/activity/models"
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	pointsModel "github.com/heymind/puki/pkg/points/models"
	"github.com/pkg/errors"
	"gopkg.in/guregu/null.v4"
	"gorm.io/gorm"
	"time"
)

type ActivityService struct {
	db *gorm.DB
	sm *auth.SessionManager
}

func NewActivityService(db *gorm.DB, sm *auth.SessionManager) *ActivityService {
	return &ActivityService{db, sm}
}

// ------------- 获取所有活动(支持根据location筛选) -------------
type ActivityListReq struct {
	Location   string          `validate:"max=25" json:"location"`
	Begin      null.Time       `json:"begin"`
	End        null.Time       `json:"end"`
	Pagination base.Pagination `json:"pagination"`
}

type ActivityListRes struct {
	Pagination base.Pagination           `json:"pagination"`
	Activities []models.ActivityBaseInfo `json:"activities"`
}

func (s *ActivityService) ActivityList(ctx *rpc.Context, req *ActivityListReq, res *ActivityListRes) error {
	var activities []models.Activity
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	if !req.Begin.IsZero() {
		req.Begin.Time = req.Begin.Time.Local()
	}

	if !req.End.IsZero() {
		req.End.Time = req.End.Time.Local()
	}

	if !req.End.IsZero() && !req.Begin.IsZero() && req.Begin.Time.After(req.End.Time) {
		return base.UserErrorf(nil, "时间段输入错误")
	}

	var err error
	if req.Location == "" {
		if req.Begin.IsZero() {
			if req.End.IsZero() {
				err = s.db.Preload("Labels").Preload("Profile").Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			} else {
				err = s.db.Preload("Labels").Preload("Profile").Where("end_time < ?", req.End).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			}
		} else {
			if req.End.IsZero() {
				err = s.db.Preload("Labels").Preload("Profile").Where("begin_time > ?", req.Begin).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			} else {
				err = s.db.Preload("Labels").Preload("Profile").Where("begin_time between ? and ?", req.Begin, req.End).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			}
		}
	} else {
		if req.Begin.IsZero() {
			if req.End.IsZero() {
				err = s.db.Preload("Labels").Preload("Profile").Where("location = ?", req.Location).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			} else {
				err = s.db.Preload("Labels").Preload("Profile").Where("location = ?", req.Location).Where("end_time < ?", req.End).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			}
		} else {
			if req.End.IsZero() {
				err = s.db.Preload("Labels").Preload("Profile").Where("location = ?", req.Location).Where("begin_time > ?", req.Begin).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			} else {
				err = s.db.Preload("Labels").Preload("Profile").Where("location = ?", req.Location).Where("begin_time between ? and ?", req.Begin, req.End).Order("created_at desc").Scopes(req.Pagination.AsScope()).Find(&activities).Error
			}
		}
	}

	if err != nil {
		ctx.Errorf("query activity list error: %+v", errors.WithStack(err))
		return err
	}

	var activityBaseInfos []models.ActivityBaseInfo
	for _, activity := range activities {
		activityBaseInfo := models.Activity2ActivityBaseInfo(activity)
		activityBaseInfos = append(activityBaseInfos, activityBaseInfo)
	}

	var totalNum int64
	stmt := s.db.Model(&models.Activity{})
	if req.Location == "" {
		if req.Begin.IsZero() {
			if req.End.IsZero() {
				err = stmt.Count(&totalNum).Error
			} else {
				err = stmt.Where("end_time < ?", req.End).Count(&totalNum).Error
			}
		} else {
			if req.End.IsZero() {
				err = stmt.Where("begin_time > ?", req.Begin).Count(&totalNum).Error
			} else {
				err = stmt.Where("begin_time between ? and ?", req.Begin, req.End).Count(&totalNum).Error
			}
		}
	} else {
		if req.Begin.IsZero() {
			if req.End.IsZero() {
				err = stmt.Where("location = ?", req.Location).Count(&totalNum).Error
			} else {
				err = stmt.Where("location = ?", req.Location).Where("end_time < ?", req.End).Count(&totalNum).Error
			}
		} else {
			if req.End.IsZero() {
				err = stmt.Where("location = ?", req.Location).Where("begin_time > ?", req.Begin).Count(&totalNum).Error
			} else {
				err = stmt.Where("location = ?", req.Location).Where("begin_time between ? and ?", req.Begin, req.End).Count(&totalNum).Error
			}
		}
	}

	if err != nil {
		ctx.Errorf("query activity count error: %+v", errors.WithStack(err))
		return err
	}

	res.Activities = activityBaseInfos
	res.Pagination.TotalNum = int(totalNum)
	return nil
}

// ------------- 获取单个活动的详情 -------------
type GetActivityDetailReq struct {
	ID base.ID `validate:"required" json:"id" trans:"活动ID"`
}

type GetActivityDetailRes struct {
	Activity models.ActivityAllInfo `json:"activity"`
	SignUpAt null.Time              `json:"signUpAt"`
}

func (s *ActivityService) GetActivityDetail(ctx *rpc.Context, req *GetActivityDetailReq, res *GetActivityDetailRes) error {

	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	activity, err := models.FindActivityByID(s.db, req.ID)
	if err != nil {
		ctx.Errorf("find activity %d detail error: %+v", req.ID, errors.WithStack(err))
		return err
	}

	res.Activity = models.Activity2ActivityAllInfo(*activity)

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	var record models.ActivitySignUp
	err = models.FindRecordByUserIDAndActivityID(s.db, su.ID, req.ID, &record)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		ctx.Debugf("user don't sign up activity %d", req.ID)
		res.SignUpAt = null.TimeFromPtr(nil)
	} else if err != nil {
		ctx.Errorf("find sign up record error: %+v", err)
		return err
	} else {
		ctx.Debugf("user has signed up activity %d", req.ID)
		res.SignUpAt = null.TimeFrom(record.CreatedAt)
	}
	return nil
}

// ------------- 添加一个新活动 -------------
type AddActivityReq struct {
	Activity models.ActivityAllInfo `validate:"required" json:"activity" trans:"活动"`
}

type AddActivityRes struct {
	Activity models.Activity `json:"activity"`
	Message  string          `json:"message"`
}

func (s *ActivityService) AddActivity(ctx *rpc.Context, req *AddActivityReq, res *AddActivityRes) error {

	err := base.Validator.Struct(req)
	if err != nil {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", err)
	}

	err = base.Validator.Struct(req.Activity)
	if err != nil {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", err)
	}

	// 转化时区
	req.Activity = models.TimeTransformer(req.Activity)

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}
	//userID := base.ID(359565502013671165) // 用于测试
	userID := su.ID

	if req.Activity.Begin.After(req.Activity.End) || req.Activity.SignUpBegin.After(req.Activity.SignUpEnd) ||
		req.Activity.SignUpEnd.After(req.Activity.Begin) {
		return base.UserErrorf(nil, "活动时间设置不合理")
	}

	if len(req.Activity.PictureURLs) == 0 {
		return base.UserErrorf(nil, "添加活动没有附带图片")
	}

	err = s.db.Transaction(func(db *gorm.DB) error {
		// 首先存活动新Label
		tags := req.Activity.Labels
		var newLabels []models.ActivityLabel
		var existLabels []models.ActivityLabel
		for _, tag := range tags {
			var existLabel models.ActivityLabel
			err := s.db.Where("name = ?", tag.Name).First(&existLabel).Error
			// 数据库中没有该Label
			if errors.Is(err, gorm.ErrRecordNotFound) {
				ctx.Debugf("find label '%s' error: %+v", tag, errors.WithStack(err))
				newLabel := models.ActivityLabel{
					Model: base.Model{
						ID: base.NewID(),
					},
					Name: tag.Name,
				}
				newLabels = append(newLabels, newLabel)
			} else if err == nil { // 数据库存在该Label
				existLabels = append(existLabels, existLabel)
			} else {
				ctx.Errorf("find label: '%s' error: %+v", tag, errors.WithStack(err))
				return err
			}
		}
		// 需要添加新Label
		if len(newLabels) > 0 {
			err := s.db.Model(&models.ActivityLabel{}).Create(&newLabels).Error
			if err != nil {
				ctx.Errorf("create new label error: %+v", errors.WithStack(err))
				return err
			}
		}

		// 再存新活动
		newActivity := models.Activity{
			Model: base.Model{
				ID: base.NewID(),
			},
			Location:    req.Activity.Location,
			ApplyQuota:  0,
			TotalQuota:  req.Activity.TotalQuota,
			FakeQuota:   req.Activity.FakeQuota,
			BeginTime:   req.Activity.Begin,
			EndTime:     req.Activity.End,
			SignUpBegin: req.Activity.SignUpBegin,
			SignUpEnd:   req.Activity.SignUpEnd,
			Points:      req.Activity.Points,
			UserID:      userID,
			Labels:      append(existLabels, newLabels...),
		}
		err := s.db.Model(&models.Activity{}).Create(&newActivity).Error
		if err != nil {
			ctx.Errorf("create activity '%d' error: %+v", newActivity.ID, errors.WithStack(err))
			return err
		}

		activityProfile := models.ActivityProfile{
			ActivityID:     newActivity.ID,
			Activity:       &newActivity,
			Title:          req.Activity.Title,
			Field:          req.Activity.Field,
			CoverPicURL:    req.Activity.CoverPicURL,
			Introduction:   req.Activity.Introduction,
			Sponsor:        req.Activity.Sponsor,
			PictureURLs:    req.Activity.PictureURLs,
			OrganizerPhone: req.Activity.OriganizerNumber,
		}
		activityProfile.SetExtra(req.Activity.Extra)
		err = s.db.Model(&models.ActivityProfile{}).Create(&activityProfile).Error
		if err != nil {
			ctx.Errorf("create activity profile '%d' error: %+v", newActivity.ID, errors.WithStack(err))
			return err
		}
		res.Activity = newActivity
		return nil
	})
	if err != nil {
		return err
	}

	ctx.Infof("create activity %d.", req.Activity.ID)
	res.Message = "添加成功"
	return nil
}

// ------------- 删除单个活动 -------------
type DeleteActivityReq struct {
	ID base.ID `validate:"required" json:"id" trans:"活动ID"`
}

type DeleteActivityRes struct {
	Message string `json:"message"`
}

func (s *ActivityService) DeleteActivity(ctx *rpc.Context, req *DeleteActivityReq, res *DeleteActivityRes) error {
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
		var activity models.Activity
		err := db.Model(&models.Activity{}).Where("id = ?", req.ID).First(&activity).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(nil, "待删除活动不存在")
		} else if err != nil {
			ctx.Errorf("find activity '%d' error: %+v", req.ID, errors.WithStack(err))
			return err
		}

		if !su.IsStaff {
			return base.UserErrorf(nil, "没有权限删除活动")
		} else if !su.IsSuper {
			if su.ID != activity.UserID {
				return base.UserErrorf(nil, "没有权限删除不属于自己的活动")
			}
		}

		err = db.Select("Profile").Delete(&models.Activity{}, req.ID).Error
		if err != nil {
			ctx.Errorf("delete activity '%d' error: %+v", req.ID, errors.WithStack(err))
			return err
		}

		err = db.Where("activity_id = ?", req.ID).Delete(&models.ActivitySignUp{}).Error
		if err != nil {
			ctx.Errorf("delete sign up related to activity %s error: %+v", req.ID, err)
			return err
		}

		ctx.Infof("delete activity %d.", req.ID)
		res.Message = "删除成功"
		return nil
	})
	if err != nil {
		return err
	}
	return nil
}

// ------------- 根据Label筛选活动 -------------
type SelectActivityByLabelReq struct {
	Label      string          `validate:"required" json:"label"`
	Pagination base.Pagination `json:"pagination"`
}

type SelectActivityByLabelRes struct {
	Pagination base.Pagination           `json:"pagination"`
	Activities []models.ActivityBaseInfo `json:"activities"`
}

func (s *ActivityService) SelectActivityByLabel(ctx *rpc.Context, req *SelectActivityByLabelReq, res *SelectActivityByLabelRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	err := s.db.Transaction(func(db *gorm.DB) error {
		var label models.ActivityLabel
		err := s.db.Model(&models.ActivityLabel{}).Preload("Activities").Where("name = ?", req.Label).First(&label).Error
		if err != nil {
			ctx.Errorf("find activities by label '%s' error: %+v", req.Label, errors.WithStack(err))
			return err
		}
		activitiesWithoutLabel := label.Activities

		var activityIDs []base.ID
		var activityBaseInfos []models.ActivityBaseInfo
		var totalNum int64
		if activitiesWithoutLabel != nil {
			for _, activity := range activitiesWithoutLabel {
				activityIDs = append(activityIDs, activity.ID)
			}

			err := db.Model(&models.Activity{}).Where("id IN ?", activityIDs).Count(&totalNum).Error
			if err != nil {
				ctx.Errorf("Count activities by IDs error: %+v", errors.WithStack(err))
				return err
			}

			var activities []models.Activity
			err = db.Model(&models.Activity{}).Preload("Labels").Preload("Profile").Where("id IN ?", activityIDs).Scopes(req.Pagination.AsScope()).Find(&activities).Error
			if err != nil {
				ctx.Errorf("find activities by IDs error: %+v", errors.WithStack(err))
				return err
			}

			for _, activity := range activities {
				activityBaseInfo := models.Activity2ActivityBaseInfo(activity)
				activityBaseInfos = append(activityBaseInfos, activityBaseInfo)
			}

			res.Activities = activityBaseInfos
			res.Pagination.TotalNum = int(totalNum)
		}
		return nil
	})
	if err != nil {
		return err
	}
	return nil
}

// ------------- 审核某个添加活动请求 -------------
//type VerifyActivityReq struct {
//	ID base.ID `json:"id"`
//}
//
//type VerifyActivityRes struct {
//	Message string `json:"message"`
//}
//
//func (s *ActivityService) VerifyActivity(ctx *rpc.Context, req *VerifyActivityReq, res *VerifyActivityRes) error {
//	su, err := s.sm.Extract(ctx)
//	if err != nil {
//		return err
//	}
//	if !su.IsStaff {
//		return errors.New("没有权限进行后台操作")
//	}
//
//	var activity models.Activity
//	err = s.db.Model(&models.Activity{}).Where("id = ?", req.ID).First(&activity).Error
//	if errors.Is(err, gorm.ErrRecordNotFound) {
//		return errors.New("待审核活动不存在")
//	} else if err != nil {
//		return err
//	}
//	if !activity.VerifiedAt.IsZero() {
//		return errors.New("该活动已被审核")
//	}
//	activity.VerifiedAt = null.NewTime(time.Now(), true)
//	err = s.db.Save(&activity).Error
//	if err != nil {
//		return err
//	}
//
//	res.Message = "审核成功"
//	return nil
//}

// ------------- 修改某个活动信息 -------------
type UpdateActivityByIDReq struct {
	ID       base.ID                `validate:"required" json:"id" trans:"活动ID"`
	Activity models.ActivityAllInfo `validate:"required" json:"activity" trans:"活动"`
}

type UpdateActivityByIDRes struct {
	Message string `json:"message"`
}

func (s *ActivityService) UpdateActivityByID(ctx *rpc.Context, req *UpdateActivityByIDReq, res *UpdateActivityByIDRes) error {
	err := base.Validator.Struct(req)
	if err != nil {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", err)
	}

	err = base.Validator.Struct(req.Activity)
	if err != nil {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", err)
	}

	// 转化时区
	req.Activity = models.TimeTransformer(req.Activity)

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	if req.Activity.Begin.After(req.Activity.End) || req.Activity.SignUpBegin.After(req.Activity.SignUpEnd) ||
		req.Activity.SignUpEnd.After(req.Activity.Begin) {
		return base.UserErrorf(nil, "活动时间设置不合理")
	}

	if len(req.Activity.PictureURLs) == 0 {
		return base.UserErrorf(nil, "修改活动没有附带图片")
	}

	err = s.db.Transaction(func(db *gorm.DB) error {
		var activity models.Activity
		err := db.Model(&models.Activity{}).Preload("Profile").Preload("Labels").Where("id = ?", req.ID).First(&activity).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return base.UserErrorf(err, "需修改活动不存在")
		} else if err != nil {
			ctx.Errorf("find activity %d error: %+v", req.ID, errors.WithStack(err))
			return err
		}

		if !su.IsStaff {
			return base.UserErrorf(nil, "没有权限修改活动")
		} else if !su.IsSuper {
			if su.ID != activity.UserID {
				return base.UserErrorf(nil, "没有权限修改不属于自己的活动")
			}
		}

		// 活动标签处理
		labels := req.Activity.Labels
		var newLabels []models.ActivityLabel
		var existLabels []models.ActivityLabel
		for _, label := range labels {
			var existLabel models.ActivityLabel
			err := db.Where("name = ?", label.Name).First(&existLabel).Error
			// 数据库中没有该Label
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newLabel := models.ActivityLabel{
					Model: base.Model{
						ID: base.NewID(),
					},
					Name: label.Name,
				}
				newLabels = append(newLabels, newLabel)
				ctx.Debugf("can't find label '%s', add it to schema", label)
			} else if err == nil { // 数据库存在该Label
				existLabels = append(existLabels, existLabel)
			} else {
				ctx.Errorf("find label '%s' error: %+v", errors.WithStack(err))
				return err
			}
		}
		// 需要添加新Label
		if len(newLabels) > 0 {
			err := db.Model(&models.ActivityLabel{}).Create(&newLabels).Error
			if err != nil {
				ctx.Errorf("create labels error: %+v", errors.WithStack(err))
				return err
			}
		}

		// 活动Profile修改
		profile := activity.Profile
		if profile != nil {
			profile.Title = req.Activity.Title
			profile.Field = req.Activity.Field
			profile.Sponsor = req.Activity.Sponsor
			profile.CoverPicURL = req.Activity.CoverPicURL
			profile.Introduction = req.Activity.Introduction
			profile.PictureURLs = req.Activity.PictureURLs
			profile.OrganizerPhone = req.Activity.OriganizerNumber
			profile.SetExtra(req.Activity.Extra)
			err = db.Save(profile).Error
			if err != nil {
				ctx.Errorf("update activity %d profile error: %+v", req.ID, errors.WithStack(err))
				return err
			}
		}

		// 活动修改
		activity.Location = req.Activity.Location
		activity.ApplyQuota = req.Activity.ApplyQuota
		activity.TotalQuota = req.Activity.TotalQuota
		activity.FakeQuota = req.Activity.FakeQuota
		activity.SignUpBegin = req.Activity.SignUpBegin
		activity.SignUpEnd = req.Activity.SignUpEnd
		activity.BeginTime = req.Activity.Begin
		activity.EndTime = req.Activity.End
		activity.Points = req.Activity.Points
		err = db.Save(&activity).Error
		if err != nil {
			ctx.Errorf("update activity %d error: %+v", req.ID, errors.WithStack(err))
			return err
		}

		// 更新活动标签关联模式
		newLabels = append(newLabels, existLabels...)
		err = db.Model(&activity).Association("Labels").Replace(newLabels)
		if err != nil {
			ctx.Errorf("update activity_%d-labels relationship error: %+v", req.ID, errors.WithStack(err))
			return err
		}

		return nil
	})
	if err != nil {
		return err
	}

	ctx.Infof("update activity %d.", req.ID)
	res.Message = "修改成功"
	return nil
}

//// ------------- 获取所有待审核活动 -------------
//type ToVerifyActivityListReq struct {
//}
//
//type ToVerifyActivityListRes struct {
//	TotalNum   int                      `json:"totalNum"`
//	Activities []models.ActivityAllInfo `json:"activities"`
//}
//
//func (s *ActivityService) ToVerifyActivityList(ctx *rpc.Context, req *ToVerifyActivityListReq, res *ToVerifyActivityListRes) error {
//	su, err := s.sm.Extract(ctx)
//	if err != nil {
//		return err
//	}
//	if !su.IsStaff {
//		return errors.New("没有权限获取后台信息")
//	}
//
//	var activities []models.Activity
//	err = s.db.Model(&models.Activity{}).Preload("Labels").Preload("Profile").Where("verified_at IS NULL").Find(&activities).Error
//	if err != nil {
//		return nil
//	}
//
//	var activityAllInfos []models.ActivityAllInfo
//	for _, activity := range activities {
//		activityAllInfo := models.Activity2ActivityAllInfo(activity)
//		activityAllInfos = append(activityAllInfos, activityAllInfo)
//	}
//	res.TotalNum = len(activityAllInfos)
//	res.Activities = activityAllInfos
//	return nil
//}

// ------------- 获取所有标签 -------------
type GetLabelListReq struct {
}

type GetLabelListRes struct {
	TotalNum int      `json:"totalNum"`
	Labels   []string `json:"labels"`
}

func (s *ActivityService) GetLabelList(ctx *rpc.Context, req *GetLabelListReq, res *GetLabelListRes) error {

	var labelList []models.ActivityLabel
	err := s.db.Find(&labelList).Error
	if err != nil {
		ctx.Errorf("find label list error: %+v", errors.WithStack(err))
		return nil
	}

	var labels []string
	for _, label := range labelList {
		labels = append(labels, label.Name)
	}
	res.TotalNum = len(labels)
	res.Labels = labels
	return nil
}

// ------------- 允许加上积分 -------------
type GrantPointsReq struct {
	UID        base.ID `validate:"required" json:"uID" trans:"用户ID"`
	ActivityID base.ID `validate:"required" json:"activityID" trans:"活动ID"`
}

type GrantPointsRes struct {
	Message string `json:"message"`
}

func (s *ActivityService) GrantPoints(ctx *rpc.Context, req *GrantPointsReq, res *GrantPointsRes) error {
	isValid, validMsg := base.ValidateStruct(req)
	if !isValid {
		return base.UserErrorf(nil, "输入内容不满足条件: %s", validMsg)
	}

	su, err := s.sm.Extract(ctx)
	if err != nil {
		ctx.Errorf("user context extract error: %+v", errors.WithStack(err))
		return err
	}

	var activity models.Activity
	err = s.db.Model(&models.Activity{}).Preload("Profile").Where("id = ?", req.ActivityID).First(&activity).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(nil, "活动不存在")
	} else if err != nil {
		ctx.Errorf("find activity '%d' error: %+v", req.ActivityID, errors.WithStack(err))
		return err
	}

	if !su.IsStaff {
		return base.UserErrorf(nil, "没有权限给用户添加积分")
	} else if !su.IsSuper {
		if su.ID != activity.UserID {
			return base.UserErrorf(nil, "没有权限添加不属于自己活动的积分")
		}
	}

	var record models.ActivitySignUp
	err = models.FindRecordByUserIDAndActivityID(s.db, req.UID, req.ActivityID, &record)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return base.UserErrorf(err, "该用户没有报名该活动")
	} else if err != nil {
		ctx.Errorf("find sign up record %d-%d error: %+v", req.UID, req.ActivityID, errors.WithStack(err))
		return err
	}

	if !record.CheckinAt.IsZero() {
		return base.UserErrorf(nil, "不能重复添加积分")
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		chg := pointsModel.NewPointChange(record.UserID, activity.Points)
		chg.Reason = fmt.Sprintf("参加活动 %s(%d) +%d", activity.Profile.Title, activity.ID, activity.Points)
		err, _ := chg.Apply(tx)
		if err != nil {
			ctx.Errorf("apply points change error %+v", err)
		}

		record.CheckinAt = null.NewTime(time.Now(), true)
		err = tx.Save(&record).Error
		if err != nil {
			ctx.Errorf("update sign up record %d-%d error: %+v", req.UID, req.ActivityID, errors.WithStack(err))
			return err
		}

		ctx.Infof("add points to user_%d by activity_%d", req.UID, req.ActivityID)
		return nil
	})

	return err
}
