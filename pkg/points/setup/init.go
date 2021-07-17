package setup

import (
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/pkg/points/models"
	"github.com/heymind/puki/pkg/points/services"

	"gorm.io/gorm"
)

const MOD_NAME = "points"

// 模块初始化
func Setup(reg *rpc.ServiceRegistry, db *gorm.DB, sm *auth.SessionManager) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}

	if err := reg.RegisterService(MOD_NAME, services.NewPointsService(db, sm)); err != nil {
		return err
	}
	return
}
