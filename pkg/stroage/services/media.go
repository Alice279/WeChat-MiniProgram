package services

import (
	"github.com/heymind/puki/pkg/auth"
	"gorm.io/gorm"
)

type MediaService struct {
	db *gorm.DB
	sm *auth.SessionManager
}
