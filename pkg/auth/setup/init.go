// 用于配制和初始化 auth 模块
package setup

import (
	"os"

	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/auth/services"
	"github.com/heymind/puki/pkg/base/rpc"
	"gorm.io/gorm"
)

const MOD_NAME = "auth"

// 模块初始化
func Setup(reg *rpc.ServiceRegistry, db *gorm.DB, sm *auth.SessionManager) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}

	userService := services.NewUserService(db, sm)
	userService.EnableWechatLogin(os.Getenv("MINIAPPID"), os.Getenv("MINIAPPSECRET"), nil)
	err = reg.RegisterService(MOD_NAME, userService)
	if err != nil {
		return
	}

	return
}
