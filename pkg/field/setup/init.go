package setup

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/heymind/puki/pkg/field/services"
	"gorm.io/gorm"
)

const MOD_NAME = "field"

// 模块初始化
func Setup(reg *rpc.ServiceRegistry, db *gorm.DB, sm *auth.SessionManager) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}

	fieldService := services.NewFieldService(db, sm)
	err = reg.RegisterService(MOD_NAME, fieldService)
	if err != nil {
		return
	}

	return
}
