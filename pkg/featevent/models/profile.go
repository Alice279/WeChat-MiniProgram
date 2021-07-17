package models

import "github.com/heymind/puki/pkg/base"

type EventProfile struct {
	base.Model
	Event          *Event
	EventID        base.ID
	Title          string
	Location       string
	Organizer      string
	OrganizerPhone string
	Description    string
	Detail         string
}
