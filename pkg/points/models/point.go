package models

import (
	auth "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/pkg/errors"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Point struct {
	base.ModelNonPrimary
	UserID base.ID `gorm:"primaryKey"`
	User   *auth.User
	Amount int `gorm:"not null;default:0"`
}

type PointChange struct {
	base.Model
	UserID base.ID
	User   *auth.User
	Change int               `gorm:"not null"`
	Reason string            `gorm:"not null;default:''"`
	Meta   datatypes.JSONMap `gorm:"type:jsonb;not null;"`
}

// NewPointChange create a new `change` that could be apply to User
// If you want to give somebody some points, you can NewPointChange(whichUser,+10).Apply(tx)
func NewPointChange(uid base.ID, chg int) *PointChange {
	pc := &PointChange{
		UserID: uid,
		Change: chg,
		Meta:   make(datatypes.JSONMap),
	}
	pc.ID = base.NewID()
	return pc
}

// Apply this 'change'
func (pc *PointChange) Apply(tx *gorm.DB) (error, *Point) {
	var pt Point
	err := tx.Transaction(func(tx *gorm.DB) error {
		// find the point
		err := tx.Model(&Point{}).First(&pt, pc.UserID).Error
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				// point not found, check the uid
				var cnt int64
				err = tx.Model(&auth.User{}).Where("id", pc.UserID).Count(&cnt).Error
				if err != nil {
					return errors.WithStack(err)
				}
				if cnt == 0 {
					return base.UserErrorf(nil, "user id %d not found", pc.UserID)
				}
				pt.UserID = pc.UserID
				pt.Amount = 0
				err := tx.Create(&pt).Error
				if err != nil {
					return errors.WithStack(err)
				}
			} else {
				return errors.WithStack(err)
			}
		}
		// here we found user's point record
		if pt.Amount+pc.Change < 0 {
			return base.UserErrorf(nil, "Point: (%d) + (%d) < -0 ,changing failed", pt.Amount, pc.Change)
		}

		pt.Amount += pc.Change
		err = tx.Save(&pt).Error
		if err != nil {
			return errors.WithStack(err)
		}
		return nil
	})
	return err, &pt
}
