package models

import (
	userModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"gopkg.in/guregu/null.v4"
)

type Participant struct {
	base.Model
	User       *userModels.User
	UserID     base.ID
	Event      *Event
	EventID    base.ID
	VerifiedAt null.Time
	CheckinAt  null.Time
}
