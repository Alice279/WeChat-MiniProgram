package services

import (
	"github.com/heymind/puki/pkg/auth"
	"gorm.io/gorm"
)

type PointsService struct {
	db *gorm.DB
	sm *auth.SessionManager
}

func NewPointsService(db *gorm.DB, sm *auth.SessionManager) *PointsService {
	return &PointsService{db: db, sm: sm}
}
