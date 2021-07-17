package services

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/introduction/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type IntroductionService struct {
	db *gorm.DB
	sm *auth.SessionManager
}

type IntroductionReq struct {
	Name    string `json:"name" trans:"名称"`
	Content string `json:"content" trans:"介绍"`
}

type IntroductionResp struct {
	Msg string `json:"msg"`
}

func NewIntroductionService(db *gorm.DB, sm *auth.SessionManager) *IntroductionService {
	return &IntroductionService{db: db, sm: sm}
}

func (s *IntroductionService) IntroductionUpdate(ctx *rpc.Context, req *IntroductionReq, res *IntroductionResp) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有管理员可以更新组织介绍")
	}

	if req.Content == "" || req.Name == "" {
		return base.UserErrorf(nil, "字段不能为空")
	}

	var i models.Introduction
	err = s.db.Where("name = ?", req.Name).First(&i).Error
	if err != nil {
		ctx.Errorf("find introduction(%s) error: %+v", req.Name, errors.WithStack(err))
		return err
	}
	i.Content = req.Content
	err = s.db.Save(i).Error
	if err != nil {
		ctx.Errorf("update introduction error: %+v", errors.WithStack(err))
		return err
	}
	res.Msg = "更新成功"
	ctx.Infof("[IntroductionUpdate] introduction(%s) is updated", req.Name)
	return nil
}

func (s *IntroductionService) IntroductionCreate(ctx *rpc.Context, req *IntroductionReq, res *IntroductionResp) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有管理员可以创建组织介绍")
	}
	if req.Content == "" || req.Name == "" {
		return base.UserErrorf(nil, "字段不能为空")
	}

	var existIntro models.Introduction
	findIntroErr := s.db.Where("name = ?", req.Name).Find(&existIntro).Error
	if findIntroErr != nil {
		ctx.Errorf("find introduction error: %+v", findIntroErr)
		return findIntroErr
	}
	if existIntro.ID != 0 {
		return base.UserErrorf(nil, "该组织已存在")
	}

	newIntro := &models.Introduction{
		Model: base.Model{
			ID: base.NewID(),
		},
		Name:    req.Name,
		Content: req.Content,
	}

	err = s.db.Save(newIntro).Error
	if err != nil {
		ctx.Errorf("create introduction error: %+v", err)
		return err
	}
	res.Msg = "创建成功"
	ctx.Infof("[IntroductionCreate] introduction(%s) is created", req.Name)
	return nil
}

type IntroductionGetResp struct {
	Content []models.Introduction `json:"content"`
}

func (s *IntroductionService) IntroductionGet(ctx *rpc.Context, req *IntroductionReq, res *IntroductionGetResp) error {
	//_, err := s.sm.Extract(ctx)
	//if err != nil {
	//	return base.UserErrorf(nil, "请重新登录")
	//}
	var err error
	var i []models.Introduction
	err = s.db.Find(&i).Error
	if err != nil {
		ctx.Errorf("find introduction error: %+v", err)
		return err
	}
	res.Content = i
	ctx.Infof("[IntroductionGet] finished")
	return nil
}
