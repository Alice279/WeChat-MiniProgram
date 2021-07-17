package services

import (
	"fmt"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/home_swiper/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
)

type SwiperService struct {
	db *gorm.DB
}

type SwiperReq struct {
	Urls []string `json:"urls"`
}

type SwiperResp struct {
	Msg string `json:"msg"`
}

func NewSwiperService(db *gorm.DB) *SwiperService {
	return &SwiperService{db: db}
}

func (s *SwiperService) SwiperCreate(ctx *rpc.Context, req *SwiperReq, res *SwiperResp) error {
	if req == nil || len(req.Urls) == 0 {
		return errors.New("无轮播图")
	}
	is := &models.Swiper{
		Model: base.Model{
			ID: base.NewID(),
		},
		Urls: req.Urls,
	}

	err := s.db.Save(is).Error
	if err != nil {
		return err
	}
	res.Msg = "创建成功"
	return nil
}

type SwiperGetReq struct {
}
type SwiperGetResp struct {
	Urls []string `json:"urls"`
}

func (s *SwiperService) SwiperGet(ctx *rpc.Context, req *SwiperGetReq, res *SwiperGetResp) error {
	var i models.Swiper
	err := s.db.Last(&i).Error
	if err != nil {
		fmt.Println(err.Error())
		return err
	}
	res.Urls = i.Urls
	return nil
}
