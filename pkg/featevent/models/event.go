package models

import (
	"github.com/heymind/puki/pkg/base"
	"time"
)

type Event struct {
	base.Model

	Begin            time.Time
	End              time.Time
	SignUpBegin      time.Time
	SignUpEnd        time.Time
	TotalTicketCount int32
	ParticipantCount int32
	Participants     []Participant
	VerifyRequired   bool
	CheckinRequired  bool

	Tags    []EventTag
	Profile *EventProfile
}
