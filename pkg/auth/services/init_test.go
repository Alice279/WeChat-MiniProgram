package services

import (
	"context"

	"github.com/heymind/puki/pkg/auth"
	"github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/testutil"
	"testing"
)

func TestService0(t *testing.T) {
	// 初始化测试脚手架
	services := testutil.Setup(t)
	db := services.Db
	ctx := context.Background()

	t.Cleanup(func() {
		// 当测试完成后自动清理数据库
		if err := models.Cleanup(db); err != nil {
			t.Fatal(t)
		}
	})

	// 运行数据库 migration
	if err := models.Setup(services.Db); err != nil {
		t.Fatal(err)
	}

	// 实例化 UserService
	ser := NewUserService(db, services.Sm)
	if ser == nil {
		t.Fatal("NewUserService failed")
	}

	// 创建一个用户
	user := &models.User{}
	user.ID = base.NewID()

	err := db.Create(user).Error
	if err != nil {
		t.Fatal(err)
	}

	// 获得 user session
	user, su, err := auth.NewSessionUser(user.ID, db)
	if err != nil {
		t.Fatal(err)
	}
	sessionKey, err := services.Sm.Store(ctx, su)
	if err != nil {
		t.Fatal(err)
	}

	// 测试设置用户名密码，由于用户名密码过于简单，所以会失败
	{
		rtx := testutil.FakeRpcContext(ctx, sessionKey)
		var res UserSetCredentialRes
		err := ser.SetCredential(rtx, &UserSetCredentialReq{UserName: "1", Password: "2"}, &res)

		t.Logf("SetCredential %+v", err)
		if err == nil {
			t.Fatal("invalid username & password should failed")
		}
	}
	// 测试设置用户名密码，这次将成功
	{
		rtx := testutil.FakeRpcContext(ctx, sessionKey)
		var res UserSetCredentialRes
		err := ser.SetCredential(rtx, &UserSetCredentialReq{UserName: "helloworld", Password: "helloworld"}, &res)
		t.Logf("SetCredential %+v", err)
		if err != nil {
			t.Fatalf("err %+v", err)
		}
	}
	// 用相同的用户名密码登录，这次依旧成功
	{
		rtx := testutil.FakeRpcContext(ctx, "")
		var res UserLoginRes
		err := ser.Login(rtx, &UserLoginReq{UserName: "helloworld", Password: "helloworld"}, &res)
		t.Logf("Login %+v", res)
		if err != nil {
			t.Fatalf("err %+v", err)
		}

	}

}
