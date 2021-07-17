package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/pkg/errors"
	"github.com/vmihailenco/msgpack/v5"
	"gorm.io/gorm"
	"math"
	"math/big"
	mathrand "math/rand"
	"time"
)

// We need a session store because we should cache all permissions of a single user at login time,
// because permission checking is very high fraq and costy.

type SessionUser struct {
	ID            base.ID   `msgpack:"i"`
	IsStaff       bool      `msgpack:"a"`
	IsSuper       bool      `msgpack:"u"`
	RoleIDs       []base.ID `msgpack:"R"`
	PermissionIDs []base.ID `msgpack:"P"`
}

type DeviceToken struct {
	UserID base.ID `msgpack:"i"`
	Key1   uint64  `msgpack:"1"`
	Key2   uint64  `msgpack:"2"`
}

func (t *DeviceToken) String() (string, error) {
	bytes, err := msgpack.Marshal(t)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

func (t *DeviceToken) Store(tx *gorm.DB, device *models.UserDevice) (base.ID, error) {
	if device == nil {
		device = &models.UserDevice{}
	}
	device.UserID = t.UserID
	device.Key1 = t.Key1
	device.Key2 = t.Key2
	if device.ID != 0 {
		var cnt int64
		err := tx.Model(&models.UserDevice{}).Where("id = ", device.ID).Limit(1).Count(&cnt).Error
		if err != nil {
			return 0, err
		}
		if cnt == 0 {
			device.ID = base.NewID()
		}
	}
	device.ID = base.NewID()

	return device.ID, tx.Create(device).Error
}
func (t *DeviceToken) Check(tx *gorm.DB) (*models.User, error) {
	var device models.UserDevice
	err := tx.Model(&models.UserDevice{}).Preload("User").
		First(&device, &models.UserDevice{UserID: t.UserID, Key1: t.Key1, Key2: t.Key2}).Error
	if err != nil {
		return nil, err
	}
	return device.User, nil
}
func NewDeviceToken(uid base.ID) (tk *DeviceToken) {
	max := big.NewInt(math.MaxInt64)
	tk = &DeviceToken{
		UserID: uid,
	}

	key, err := rand.Int(rand.Reader, max)
	if err != nil {
		tk.Key1 = mathrand.Uint64()
	} else {
		tk.Key1 = key.Uint64()
	}

	key, err = rand.Int(rand.Reader, max)
	if err != nil {
		tk.Key2 = mathrand.Uint64()
	} else {
		tk.Key2 = key.Uint64()
	}
	return
}
func NewDeviceTokenFromString(token string) (*DeviceToken, error) {
	bytes, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		return nil, errors.WithMessage(err, "[DeviceToken]decode base64")
	}
	var tk DeviceToken
	err = msgpack.Unmarshal(bytes, &tk)
	if err != nil {
		return nil, errors.WithMessage(err, "[DeviceToken]decode struct")
	}
	return &tk, nil
}

func NewSessionUser(id base.ID, tx *gorm.DB) (*models.User, *SessionUser, error) {
	var user models.User
	var su SessionUser
	err := tx.Model(models.User{}).
		Preload("Permissions").
		Preload("Roles").
		Preload("Roles.ParentRole").
		Preload("Roles.Permissions").
		First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, errors.WithMessagef(err, "user %d not found", id)
		} else {
			return nil, nil, errors.WithStack(err)
		}
	}
	su.ID = id
	su.IsStaff = user.IsStaff
	su.IsSuper = user.IsSuper
	for _, perm := range user.Permissions {
		su.PermissionIDs = append(su.PermissionIDs, perm.ID)
	}

	for _, role := range user.Roles {
		su.RoleIDs = append(su.RoleIDs, role.ID)
		for _, perm := range role.Permissions {
			su.PermissionIDs = append(su.PermissionIDs, perm.ID)
		}
	}

	return &user, &su, nil
}

type SessionManager struct {
	rds    *redis.Client
	prefix string
}

func NewSessionManager(rds *redis.Client, prefix string) *SessionManager {
	return &SessionManager{rds: rds, prefix: prefix}
}

func (m *SessionManager) keyWithPrefix(sessionKey string) string {
	return m.prefix + sessionKey
}

//func (m *SessionManager) IDFromKeyWithPrefix(sessionKey string) base.ID {
//	if len(sessionKey) > len(m.prefix) {
//		parts := strings.SplitN(sessionKey[len(m.prefix):], "-", 1)
//		if len(parts) > 0 {
//			id, err := strconv.ParseInt(parts[0], 10, 64)
//			if err == nil {
//				return base.ID(id)
//			}
//		}
//	}
//	return base.NullID()
//}

func (m *SessionManager) Extract(ctx *rpc.Context) (*SessionUser, error) {
	if ctx.Request == nil {
		return nil, errors.New("nil request")
	}
	session := ctx.Request.Header.Get("Authorization")
	if session == "" {
		return nil, errors.New("bad authorization")
	}
	return m.Lookup(ctx, session)
}

func (m *SessionManager) Lookup(ctx context.Context, sessionKey string) (*SessionUser, error) {
	bytes, err := m.rds.Get(ctx, m.keyWithPrefix(sessionKey)).Bytes()

	if err != nil {

		return nil, errors.WithMessagef(err, "%s not found", sessionKey)
	}

	var su SessionUser
	err = msgpack.Unmarshal(bytes, &su)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	return &su, nil
}

func (m *SessionManager) Store(ctx context.Context, su *SessionUser) (string, error) {
	bytes, err := msgpack.Marshal(su)
	if err != nil {
		return "", errors.WithStack(err)
	}
	uuid, err := uuid.NewRandom()
	if err != nil {
		return "", errors.WithStack(err)
	}
	key := fmt.Sprintf("%d-%s", su.ID, uuid.String())
	keyWithPrefix := m.keyWithPrefix(key)
	err = m.rds.Set(ctx, keyWithPrefix, bytes, 30*24*time.Hour).Err()
	if err != nil {
		return "", errors.WithStack(err)
	}
	return key, nil
}
