// 用于配制和初始化 auth 模块
package setup

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/introduction/models"
	"github.com/heymind/puki/pkg/introduction/services"
	"gorm.io/gorm"
)

const MOD_NAME = "introduction"

// 模块初始化
func Setup(reg *rpc.ServiceRegistry, db *gorm.DB, sm *auth.SessionManager) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}

	introductionService := services.NewIntroductionService(db, sm)
	err = reg.RegisterService(MOD_NAME, introductionService)
	if err != nil {
		return
	}

	return
}
