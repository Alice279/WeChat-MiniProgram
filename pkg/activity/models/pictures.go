package models

import (
	"database/sql/driver"
	"github.com/pkg/errors"
	"strings"
)

type Pictures []string

func (s *Pictures) Scan(src interface{}) error {
	str, ok := src.(string)
	if !ok {
		return errors.New("failed to scan Pictures field - source is not a string")
	}
	*s = strings.Split(str, ",")
	return nil
}

func (s Pictures) Value() (driver.Value, error) {
	if s == nil || len(s) == 0 {
		return nil, nil
	}
	return strings.Join(s, ","), nil
}
