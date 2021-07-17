package base

import (
	"database/sql/driver"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"github.com/sony/sonyflake"
	"gopkg.in/guregu/null.v4"
	"strconv"
)

var sonyFlake = sonyflake.NewSonyflake(sonyflake.Settings{})

type ID int64

// NewID Generate an unique int64 ID
func NewID() ID {
	id, err := sonyFlake.NextID()
	if err != nil {
		panic(err)
	} else {
		return ID(id)
	}
}

// NullID returns a null id ( value = 0 )
func NullID() ID {
	return ID(0)
}
func (i ID) MarshalJSON() ([]byte, error) {
	return json.Marshal(strconv.FormatInt(int64(i), 10))
}

func (i *ID) UnmarshalJSON(data []byte) error {
	var nullInt null.Int
	err := nullInt.UnmarshalJSON(data)
	if err != nil {
		return err
	}
	*i = ID(nullInt.ValueOrZero())
	return nil
}

// Scan implements the Scanner interface.
func (i *ID) Scan(value interface{}) error {
	n := null.IntFromPtr(nil)
	if err := n.Scan(value); err != nil {
		return err
	}
	*i = ID(n.ValueOrZero())
	return nil
}

// Value implements the driver Valuer interface.
func (i *ID) Value() (driver.Value, error) {
	if *i > 0 {
		return *i, nil
	} else if *i < 0 {
		log.Warnf("ID should always be positive, but here is %d", *i)
	}
	return nil, nil
}
