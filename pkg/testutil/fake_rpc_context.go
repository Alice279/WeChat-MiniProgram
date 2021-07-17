package testutil

import (
	"bytes"
	"context"
	"github.com/heymind/puki/pkg/auth"
	userModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/base/rpc"
	log "github.com/sirupsen/logrus"
	"net/http/httptest"
)

// FakeRpcContext use a session string as a context
func FakeRpcContext(ctx context.Context, session string) *rpc.Context {
	rpcCtx := &rpc.Context{Ctx: ctx}
	req := httptest.NewRequest("POST", "/", bytes.NewReader([]byte{}))
	if session != "" {
		req.Header.Set("Authorization", session)
	}
	rpcCtx.Request = req
	return rpcCtx
}

// FakeRpcUserContext creates the user if it is not exist, then set the session in context headers.
func FakeRpcUserContext(ctx context.Context, services *Services, user *userModels.User) (rtx *rpc.Context, cleanup func()) {
	db := services.Db
	if user.ID == 0 {
		user.ID = base.NewID()
	}

	err := db.Model(&userModels.User{}).Create(user).Error
	if err != nil {
		log.Fatalf("create user error %+v", err)
		return nil, nil
	}
	_, su, err := auth.NewSessionUser(user.ID, db)
	if err != nil {
		log.Fatalf("auth.NewSessionUser error %+v", err)
	}
	req := httptest.NewRequest("POST", "/", bytes.NewReader([]byte{}))
	rpcCtx := rpc.Context{Ctx: ctx, Entry: log.WithField("ReqID", "TEST")}
	session, err := services.Sm.Store(ctx, su)
	if err != nil {
		log.Fatalf("services.Sm.Store error %+v", err)
	}

	if session != "" {
		req.Header.Set("Authorization", session)
	}
	rpcCtx.Request = req
	return &rpcCtx, func() {
		err := db.Unscoped().Model(&userModels.User{}).Delete(user).Error
		if err != nil {
			log.Fatalf("clean up FakeRpcUserContext error %+v", err)
		}
	}
}
