package services

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/join/models"
	"gorm.io/gorm"
)

type JoinUsService struct {
	db *gorm.DB
	sm *auth.SessionManager
}

type JoinUsReq struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type JoinUsResp struct {
	Msg string `json:"msg"`
}

func NewJoinUsService(db *gorm.DB, sm *auth.SessionManager) *JoinUsService {
	return &JoinUsService{db: db, sm: sm}
}

func (s *JoinUsService) JoinUsUpdate(ctx *rpc.Context, req *JoinUsReq, res *JoinUsResp) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有管理员可以更新'加入我们'")
	}

	if req.Content == "" || req.Name == "" {
		return base.UserErrorf(nil, "字段不能为空")
	}
	var i models.JoinUs
	err = s.db.Where("name = ?", req.Name).First(&i).Error
	if err == gorm.ErrRecordNotFound {
		return base.UserErrorf(nil, "未找到要更新的信息")
	}
	if err != nil {
		ctx.Errorf("find JoinUs error: %+v", err)
		return err
	}

	i.Content = req.Content
	err = s.db.Save(i).Error
	if err != nil {
		ctx.Errorf("update JoinUs error: %+v", err)
		return err
	}
	res.Msg = "更新成功"
	ctx.Infof("[JoinUsUpdate] %s updated: %s", req.Name, req.Content)
	return nil
}

func (s *JoinUsService) JoinUsCreate(ctx *rpc.Context, req *JoinUsReq, res *JoinUsResp) error {
	su, err := s.sm.Extract(ctx)
	if err != nil {
		return base.UserErrorf(nil, "请重新登录")
	}
	if !su.IsStaff {
		return base.UserErrorf(nil, "只有管理员可以创建'加入我们'")
	}

	if req.Content == "" || req.Name == "" {
		return base.UserErrorf(nil, "字段不能为空")
	}

	var existJoinUs models.JoinUs
	findJoinErr := s.db.Where("name = ?", req.Name).Find(&existJoinUs).Error
	if findJoinErr != nil {
		ctx.Errorf("find joinus error: %+v", findJoinErr)
		return findJoinErr
	}
	if existJoinUs.ID != 0 {
		return base.UserErrorf(nil, "该组织的'加入我们'已存在")
	}

	is := &models.JoinUs{
		Model: base.Model{
			ID: base.NewID(),
		},
		Name:    req.Name,
		Content: req.Content,
	}

	err = s.db.Save(is).Error
	if err != nil {
		ctx.Errorf("create JoinUs error: %+v", err)
		return err
	}
	res.Msg = "创建成功"
	ctx.Infof("[JoinUsCreate] %s create: %s", req.Name, req.Content)
	return nil
}

type JoinUsGetResp struct {
	Content []models.JoinUs `json:"content"`
}

func (s *JoinUsService) JoinUsGet(ctx *rpc.Context, req *JoinUsReq, res *JoinUsGetResp) error {
	//_, err := s.sm.Extract(ctx)
	//if err != nil {
	//	return base.UserErrorf(nil, "请重新登录")
	//}
	var err error
	var i []models.JoinUs
	err = s.db.Find(&i).Error
	if err != nil {
		ctx.Errorf("find JoinUs error: %+v", err)
		return err
	}
	res.Content = i
	ctx.Infof("[JoinUsGet] finished")
	return nil
}
