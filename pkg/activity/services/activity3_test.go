package services

import (
	"context"
	"github.com/davecgh/go-spew/spew"
	"github.com/heymind/puki/pkg/activity/models"
	authModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/testutil"
	"github.com/stretchr/testify/require"
	"gopkg.in/guregu/null.v4"
	"testing"
	"time"
)

func Test3ActivityService(t *testing.T) {
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
	su, err := ser.sm.Extract(rtx)
	if err != nil {
		return
	}
	userId = su.ID

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

	// 添加新活动
	var activityId2 base.ID
	{
		begin, _ := time.Parse(time.RFC3339, "2021-08-29T15:22:58.441Z")
		end, _ := time.Parse(time.RFC3339, "2021-09-01T15:22:58.441Z")
		signUpBegin, _ := time.Parse(time.RFC3339, "2021-07-01T15:22:58.441Z")
		signUpEnd, _ := time.Parse(time.RFC3339, "2021-07-28T15:22:58.441Z")
		labels := []models.ActivityLabel{models.ActivityLabel{Name: "装逼"}, models.ActivityLabel{Name: "扮猪吃老虎"}}
		extraMap := make(map[string]string)
		extraMap["France"] = "巴黎"
		extraMap["Italy"] = "罗马"
		extraMap["Japan"] = "东京"
		extraMap["India "] = "新德里"
		var createRes AddActivityRes
		newActivity := models.ActivityAllInfo{
			ActivityBaseInfo: models.ActivityBaseInfo{
				Title:       "朱一帆大战菊花怪第二部",
				Field:       "女厕所",
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
			Introduction: "朱一帆作为北邮的一份子，大战菊花怪的故事令人潸然泪下。第二部在万众期待中上映了",
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
		activityId2 = createRes.Activity.ID
	}

	// 添加新活动
	var activityId3 base.ID
	{
		begin, _ := time.Parse(time.RFC3339, "2021-08-29T15:22:58.441Z")
		end, _ := time.Parse(time.RFC3339, "2021-09-01T15:22:58.441Z")
		signUpBegin, _ := time.Parse(time.RFC3339, "2021-07-01T15:22:58.441Z")
		signUpEnd, _ := time.Parse(time.RFC3339, "2021-07-28T15:22:58.441Z")
		labels := []models.ActivityLabel{models.ActivityLabel{Name: "装逼"}, models.ActivityLabel{Name: "扮猪吃老虎"}}
		extraMap := make(map[string]string)
		extraMap["France"] = "巴黎"
		extraMap["Italy"] = "罗马"
		extraMap["Japan"] = "东京"
		extraMap["India "] = "新德里"
		var createRes AddActivityRes
		newActivity := models.ActivityAllInfo{
			ActivityBaseInfo: models.ActivityBaseInfo{
				Title:       "朱一帆大战菊花怪第三部",
				Field:       "女厕所",
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
			Introduction: "朱一帆作为北邮的一份子，大战菊花怪的故事令人潸然泪下。第二部在万众期待中上映了",
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
		activityId3 = createRes.Activity.ID
	}

	// 添加新活动
	var activityId4 base.ID
	{
		begin, _ := time.Parse(time.RFC3339, "2021-08-29T15:22:58.441Z")
		end, _ := time.Parse(time.RFC3339, "2021-09-01T15:22:58.441Z")
		signUpBegin, _ := time.Parse(time.RFC3339, "2021-07-01T15:22:58.441Z")
		signUpEnd, _ := time.Parse(time.RFC3339, "2021-07-28T15:22:58.441Z")
		labels := []models.ActivityLabel{models.ActivityLabel{Name: "装逼"}, models.ActivityLabel{Name: "扮猪吃老虎"}}
		extraMap := make(map[string]string)
		extraMap["France"] = "巴黎"
		extraMap["Italy"] = "罗马"
		extraMap["Japan"] = "东京"
		extraMap["India "] = "新德里"
		var createRes AddActivityRes
		newActivity := models.ActivityAllInfo{
			ActivityBaseInfo: models.ActivityBaseInfo{
				Title:       "朱一帆大战菊花怪第四部",
				Field:       "女厕所",
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
			Introduction: "朱一帆作为北邮的一份子，大战菊花怪的故事令人潸然泪下。第二部在万众期待中上映了",
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
		activityId4 = createRes.Activity.ID
	}

	// 添加新活动
	var activityId5 base.ID
	{
		begin, _ := time.Parse(time.RFC3339, "2021-08-29T15:22:58.441Z")
		end, _ := time.Parse(time.RFC3339, "2021-09-01T15:22:58.441Z")
		signUpBegin, _ := time.Parse(time.RFC3339, "2021-07-01T15:22:58.441Z")
		signUpEnd, _ := time.Parse(time.RFC3339, "2021-07-28T15:22:58.441Z")
		labels := []models.ActivityLabel{models.ActivityLabel{Name: "装逼"}, models.ActivityLabel{Name: "扮猪吃老虎"}}
		extraMap := make(map[string]string)
		extraMap["France"] = "巴黎"
		extraMap["Italy"] = "罗马"
		extraMap["Japan"] = "东京"
		extraMap["India "] = "新德里"
		var createRes AddActivityRes
		newActivity := models.ActivityAllInfo{
			ActivityBaseInfo: models.ActivityBaseInfo{
				Title:       "朱一帆大战菊花怪第五部",
				Field:       "女厕所",
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
			Introduction: "朱一帆作为北邮的一份子，大战菊花怪的故事令人潸然泪下。第二部在万众期待中上映了",
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
		activityId5 = createRes.Activity.ID
	}

	// 虚拟用户报名1
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

	// 虚拟用户报名2
	{
		var signUpActivityRes SignUpActivityRes

		err := signUpServer.SignUpActivity(rtx, &SignUpActivityReq{
			ActivityID: activityId2,
			Form:       map[string]string{"姓名": "大菠萝", "微信号": "daboluo", "电话号码": "8868", "性别": "无"},
		}, &signUpActivityRes)
		if err != nil {
			t.Fatalf("sign up activity error %s", err.Error())
		}
	}

	// 虚拟用户报名3
	{
		var signUpActivityRes SignUpActivityRes

		err := signUpServer.SignUpActivity(rtx, &SignUpActivityReq{
			ActivityID: activityId3,
			Form:       map[string]string{"姓名": "大菠萝", "微信号": "daboluo", "电话号码": "8868", "性别": "无"},
		}, &signUpActivityRes)
		if err != nil {
			t.Fatalf("sign up activity error %s", err.Error())
		}
	}

	// 虚拟用户报名4
	{
		var signUpActivityRes SignUpActivityRes

		err := signUpServer.SignUpActivity(rtx, &SignUpActivityReq{
			ActivityID: activityId4,
			Form:       map[string]string{"姓名": "大菠萝", "微信号": "daboluo", "电话号码": "8868", "性别": "无"},
		}, &signUpActivityRes)
		if err != nil {
			t.Fatalf("sign up activity error %s", err.Error())
		}
	}

	// 虚拟用户报名5
	{
		var signUpActivityRes SignUpActivityRes

		err := signUpServer.SignUpActivity(rtx, &SignUpActivityReq{
			ActivityID: activityId5,
			Form:       map[string]string{"姓名": "大菠萝", "微信号": "daboluo", "电话号码": "8868", "性别": "无"},
		}, &signUpActivityRes)
		if err != nil {
			t.Fatalf("sign up activity error %s", err.Error())
		}
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

	// 审核用户报名
	{
		var verifySignUpRes VerifySignUpRes
		err := signUpServer.VerifySignUp(rtx, &VerifySignUpReq{
			UserID:     userId,
			ActivityID: activityId2,
		}, &verifySignUpRes)
		if err != nil {
			t.Fatalf("verify sign up record error: %s", err.Error())
		}
	}

	{
		var toVerifiedSignUpRecordListRes ToVerifiedSignUpRecordListRes
		err := signUpServer.ToVerifiedSignUpRecordList(rtx, &ToVerifiedSignUpRecordListReq{
			ActivityID: activityId3,
		}, &toVerifiedSignUpRecordListRes)
		if err != nil {
			t.Fatalf("get to verify sign up record error: %s", err.Error())
		}

		require.Equal(t, len(toVerifiedSignUpRecordListRes.Records), 1, "record should be 1")
		require.Equal(t, toVerifiedSignUpRecordListRes.Records[0].UserID, userId, "user id is same")
		spew.Dump(toVerifiedSignUpRecordListRes.Records)
	}

	{
		var getToVerifyActivitiesRes GetToVerifyActivitiesRes
		err := signUpServer.GetToVerifyActivities(rtx, &GetToVerifyActivitiesReq{}, &getToVerifyActivitiesRes)
		if err != nil {
			t.Fatalf("get to verify activities: %s", err.Error())
		}
		spew.Dump(getToVerifyActivitiesRes.Activities)
		require.Equal(t, len(getToVerifyActivitiesRes.Activities), 3, "record should be 3")
	}
}
