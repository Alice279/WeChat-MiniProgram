package models

import "github.com/heymind/puki/pkg/base"

type EventTag struct {
	base.Model
	Title  string
	Events []Event
}
