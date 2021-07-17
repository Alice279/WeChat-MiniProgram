// 用于配制和初始化 auth 模块
package setup

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/join/models"
	"github.com/heymind/puki/pkg/join/services"
	"gorm.io/gorm"
)

const MOD_NAME = "join"

// 模块初始化
func Setup(reg *rpc.ServiceRegistry, db *gorm.DB, sm *auth.SessionManager) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}

	joinUsService := services.NewJoinUsService(db, sm)
	err = reg.RegisterService(MOD_NAME, joinUsService)
	if err != nil {
		return
	}
	return
}
