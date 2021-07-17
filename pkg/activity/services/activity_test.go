package services

import (
	"context"
	"encoding/json"
	"github.com/heymind/puki/pkg/activity/models"
	authModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/testutil"
	"github.com/stretchr/testify/require"
	"gopkg.in/guregu/null.v4"
	"testing"
	"time"
)

func TestActivityService(t *testing.T) {
	services := testutil.Setup(t)
	db := services.Db
	ctx := context.Background()
	rtx, cleanup := testutil.FakeRpcUserContext(ctx, services, &authModels.User{
		IsStaff: true,
		IsSuper: true,
	})

	_ = cleanup
	//t.Cleanup(cleanup)

	authModels.Setup(db)
	models.Setup(db)
	ser := NewActivityService(db, services.Sm)

	var userId base.ID

	// 添加新活动
	var activityId1 base.ID
	{
		begin, _ := time.Parse(time.RFC3339, "2021-07-29T15:22:58.441Z")
		end, _ := time.Parse(time.RFC3339, "2021-08-01T15:22:58.441Z")
		signUpBegin, _ := time.Parse(time.RFC3339, "2021-07-01T15:22:58.441Z")
		signUpEnd, _ := time.Parse(time.RFC3339, "2021-07-28T15:22:58.441Z")
		labels := []models.ActivityLabel{models.ActivityLabel{Name: "血战"}, models.ActivityLabel{Name: "吹逼"}}
		extraMap := make(map[string]string)
		extraMap["France"] = "巴黎"
		extraMap["Italy"] = "罗马"
		extraMap["Japan"] = "东京"
		extraMap["India "] = "新德里"
		var createRes AddActivityRes
		newActivity := models.ActivityAllInfo{
			ActivityBaseInfo: models.ActivityBaseInfo{
				Title:       "朱一帆大战菊花怪",
				Field:       "厕所",
				Location:    "石油大院",
				CoverPicURL: "/",
				TotalQuota:  200,
				FakeQuota:   1000,
				Begin:       begin,
				End:         end,
				SignUpBegin: signUpBegin,
				SignUpEnd:   signUpEnd,
				Labels:      labels,
			},
			Sponsor:      null.StringFrom("邱吉"),
			Introduction: "朱一帆作为北邮的一份子，大战菊花怪的故事令人潸然泪下。",
			Points:       100,
			PictureURLs: []string{"http://fakehost.com/fakeimage.png",
				"http://fakehost.com/fakeimage.png"},
			OriganizerNumber: "18801383572",
			Extra:            extraMap,
		}

		err := ser.AddActivity(rtx, &AddActivityReq{
			Activity: newActivity,
		}, &createRes)
		if err != nil {
			t.Fatalf("create activity error %s", err.Error())
		}
		activityId1 = createRes.Activity.ID
	}

	// 添加错误活动
	var activityId2 base.ID
	{
		var createRes AddActivityRes

		jsonBody := "{}"
		str := []byte(jsonBody)
		activity := models.ActivityAllInfo{}
		err := json.Unmarshal(str, &activity)
		if err != nil {
			t.Fatalf("unmarshal json error %s", err.Error())
		}
		err = ser.AddActivity(rtx, &AddActivityReq{
			Activity: activity,
		}, &createRes)
		if err == nil {
			t.Fatalf("should create activity error %s", err.Error())
		}
		activityId2 = createRes.Activity.ID
	}

	// 验证添加的活动信息
	{
		var activityListRes ActivityListRes
		err := ser.ActivityList(rtx, &ActivityListReq{
			Location:   "石油大院",
			Pagination: base.Pagination{},
		}, &activityListRes)
		if err != nil {
			return
		}

		activity := activityListRes.Activities[0]
		require.Equal(t, activity.ID, activityId1, "find the wrong activity")

		var labelNames []string
		for _, label := range activity.Labels {
			labelNames = append(labelNames, label.Name)
		}

		require.Contains(t, labelNames, "血战")
		require.Contains(t, labelNames, "吹逼")

		su, err := ser.sm.Extract(rtx)
		if err != nil {
			return
		}
		userId = su.ID
		_ = activityId2
	}

	// 虚拟用户报名
	signUpServer := NewSignUpService(db, services.Sm)
	{
		var signUpActivityRes SignUpActivityRes

		err := signUpServer.SignUpActivity(rtx, &SignUpActivityReq{
			ActivityID: activityId1,
			Form:       map[string]string{"姓名": "大菠萝", "微信号": "daboluo", "电话号码": "8868", "性别": "无"},
		}, &signUpActivityRes)
		if err != nil {
			t.Fatalf("sign up activity error %s", err.Error())
		}
	}

	// 检测用户报名
	{
		var toVerifiedSignUpRecordListRes ToVerifiedSignUpRecordListRes
		err := signUpServer.ToVerifiedSignUpRecordList(rtx, &ToVerifiedSignUpRecordListReq{
			Pagination: base.Pagination{},
		}, &toVerifiedSignUpRecordListRes)
		if err != nil {
			t.Fatalf("get to verify sign up record error: %s", err.Error())
		}
		require.Equal(t, len(toVerifiedSignUpRecordListRes.Records), 1, "fields number should be 1")

		record := toVerifiedSignUpRecordListRes.Records[0]
		require.Equal(t, record.ActivityID, activityId1, "find wrong record")
		require.Equal(t, record.UserID, userId, "find wrong record")
	}

	// 审核用户报名
	{
		var verifySignUpRes VerifySignUpRes
		err := signUpServer.VerifySignUp(rtx, &VerifySignUpReq{
			UserID:     userId,
			ActivityID: activityId1,
		}, &verifySignUpRes)
		if err != nil {
			t.Fatalf("verify sign up record error: %s", err.Error())
		}
	}

	// 获取已经审核完成的名单
	{
		var getActivitySignUpListRes GetActivitySignUpListRes
		err := signUpServer.GetActivitySignUpList(rtx, &GetActivitySignUpListReq{
			ID:         activityId1,
			Pagination: base.Pagination{},
		}, &getActivitySignUpListRes)
		if err != nil {
			t.Fatalf("verify sign up record error: %s", err.Error())
		}

		info := getActivitySignUpListRes.UserInfos[0]
		require.Equal(t, info.User.ID, userId, "sign up Id should be same")
		require.Equal(t, info.PointedTime, null.TimeFromPtr(nil), "pointed time should be nil")
	}

	// 给该报名信息加上积分
	{
		var grantPointsRes GrantPointsRes
		err := ser.GrantPoints(rtx, &GrantPointsReq{
			UID:        userId,
			ActivityID: activityId1,
		}, &grantPointsRes)
		if err != nil {
			t.Fatalf("add point error: %s", err.Error())
		}
	}

	// 获取已经审核完成的名单
	{
		var getActivitySignUpListRes GetActivitySignUpListRes
		err := signUpServer.GetActivitySignUpList(rtx, &GetActivitySignUpListReq{
			ID:         activityId1,
			Pagination: base.Pagination{},
		}, &getActivitySignUpListRes)
		if err != nil {
			t.Fatalf("verify sign up record error: %s", err.Error())
		}

		info := getActivitySignUpListRes.UserInfos[0]
		require.Equal(t, info.User.ID, userId, "sign up Id should be same")
		if info.PointedTime == null.TimeFromPtr(nil) {
			t.Fatalf("add point failed")
		}
	}

	// 删除报名记录
	{
		var cancelSignUpRes CancelSignUpRes
		err := signUpServer.CancelSignUp(rtx, &CancelSignUpReq{
			ActivityID: activityId1,
		}, &cancelSignUpRes)
		if err != nil {
			t.Fatalf("cancel sign up record error: %s", err.Error())
		}
	}

	// 删除活动
	{
		var deleteActivityRes DeleteActivityRes
		err := ser.DeleteActivity(rtx, &DeleteActivityReq{
			ID: activityId1,
		}, &deleteActivityRes)
		if err != nil {
			t.Fatalf("delete activity error: %s", err.Error())
		}
	}
}
