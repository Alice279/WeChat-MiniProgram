// 用于配制和初始化 auth 模块
package setup

import (
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/home_swiper/models"
	"github.com/heymind/puki/pkg/home_swiper/services"
	"gorm.io/gorm"
)

const MOD_NAME = "home_swiper"

// 模块初始化
func Setup(reg *rpc.ServiceRegistry, db *gorm.DB) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}

	swiperService := services.NewSwiperService(db)
	err = reg.RegisterService(MOD_NAME, swiperService)
	if err != nil {
		return
	}

	return
}
