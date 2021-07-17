package setup

import (
	"github.com/heymind/puki/pkg/activity/models"
	"github.com/heymind/puki/pkg/activity/services"
	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/base/rpc"
	"gorm.io/gorm"
)

const MOD_NAME = "activity"

func Setup(reg *rpc.ServiceRegistry, db *gorm.DB, sm *auth.SessionManager) (err error) {
	err = models.Setup(db)
	if err != nil {
		return err
	}
	activityService := services.NewActivityService(db, sm)
	signUpService := services.NewSignUpService(db, sm)
	err = reg.RegisterService(MOD_NAME, activityService)
	if err != nil {
		return
	}
	err = reg.RegisterService(MOD_NAME, signUpService)
	if err != nil {
		return
	}
	return
}
