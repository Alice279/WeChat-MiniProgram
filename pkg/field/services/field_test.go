package services

import (
	"context"
	"fmt"
	authModels "github.com/heymind/puki/pkg/auth/models"
	"github.com/heymind/puki/pkg/base"
	"github.com/heymind/puki/pkg/field/models"
	"github.com/heymind/puki/pkg/testutil"
	"github.com/stretchr/testify/require"
	"gopkg.in/guregu/null.v4"
	"testing"
	"time"
)

func TestFieldService(t *testing.T) {
	services := testutil.Setup(t)
	db := services.Db
	_ = authModels.Setup(db)
	_ = models.Setup(db)
	t.Cleanup(func() {
		// 当测试完成后自动清理数据库
		if err := models.Cleanup(db); err != nil {
			t.Fatal(t)
		}
		authModels.Cleanup(db)
	})
	ctx := context.Background()
	rtx, cleanup := testutil.FakeRpcUserContext(ctx, services, &authModels.User{
		IsStaff: true,
		IsSuper: true,
	})
	// 清空假用户
	t.Cleanup(cleanup)

	ser := NewFieldService(db, services.Sm)

	var fieldId1 base.ID
	{
		// do test create field
		var createRes FieldCreateRes
		err := ser.Create(rtx, &FieldCreateReq{
			Name:          "会议室",
			Location:      "石油大院",
			CoverPicURL:   "http://fakehost.com/fakeimage.png",
			Address:       "石油中路",
			Capacity:      123,
			Description:   "这是个好地方",
			ContactWechat: null.StringFrom("12345"),
			ContactInfo:   "+861122233",
			PictureURLs:   []string{"http://fakehost.com/fakeimage.png", "http://fakehost.com/fakeimage.png"},
			OpenSlots: []OpenSlot{
				{
					BeginHour:   8,
					BeginMinute: 30,
					EndHour:     11,
					EndMinute:   30,
				},
				{
					BeginHour:   13,
					BeginMinute: 30,
					EndHour:     17,
					EndMinute:   00,
				},
			},
			Labels:     []string{"好地方", "真的好"},
			Equipments: []string{"投影仪", "显示器"},
			Extra: map[string]string{
				"邮箱": "123@qq.com",
			},
		}, &createRes)
		if err != nil {
			//panic(err)
			t.Fatalf("create field error %s", err.Error())
		}
		fieldId1 = createRes.FieldID
	}

	var fieldId2 base.ID
	{
		// do test create field
		var createRes FieldCreateRes
		err := ser.Create(rtx, &FieldCreateReq{
			Name:          "报告厅",
			Location:      "石油小院",
			CoverPicURL:   "http://fakehost.com/fakeimage.png",
			Address:       "石油大路",
			Capacity:      123,
			Description:   "这不是个好地方",
			ContactWechat: null.StringFrom("12345"),
			ContactInfo:   "+861122233",
			PictureURLs:   []string{},
			OpenSlots: []OpenSlot{
				{
					BeginHour:   8,
					BeginMinute: 30,
					EndHour:     11,
					EndMinute:   30,
				},
				{
					BeginHour:   13,
					BeginMinute: 30,
					EndHour:     17,
					EndMinute:   00,
				},
			},
			Labels:     []string{"坏地方", "真的好"},
			Equipments: []string{"白班", "显示器"},
		}, &createRes)
		if err == nil {
			t.Fatalf("create field error %+v", err)
		}
		fieldId2 = createRes.FieldID
	}

	var fieldOrderID1 base.ID
	{
		begin, _ := time.Parse(time.RFC3339, "2021-07-08T14:30:00.000+08:00")
		end, _ := time.Parse(time.RFC3339, "2021-07-08T16:00:00.000+08:00")
		var createOrderRes FieldCreateOrderRes
		err := ser.CreateOrder(rtx, &FieldCreateOrderReq{
			FieldID:   fieldId1,
			BeginTime: begin,
			EndTime:   end,
			Name:      "斗地主争霸赛",
			Comment:   "应该通过",
		}, &createOrderRes)
		if err != nil {
			t.Fatalf("create field order error %+v", err)
		}
		fieldOrderID1 = createOrderRes.OrderID
	}
	fmt.Println(fieldOrderID1)

	{
		var fieldOrderID2 base.ID
		begin, _ := time.Parse(time.RFC3339, "2021-07-08T14:00:00.000+08:00")
		end, _ := time.Parse(time.RFC3339, "2021-07-08T16:30:00.000+08:00")
		var createOrderRes FieldCreateOrderRes
		err := ser.CreateOrder(rtx, &FieldCreateOrderReq{
			FieldID:   fieldId1,
			BeginTime: begin,
			EndTime:   end,
			Name:      "斗地主争霸赛",
			Comment:   "应该通过",
		}, &createOrderRes)
		if err == nil {
			t.Fatalf("create field order error %+v", err)
		}
		fmt.Println(err, begin, end)
		fieldOrderID1 = createOrderRes.OrderID
		_ = fieldOrderID2
	}

	{
		var fieldOrderID2 base.ID
		begin, _ := time.Parse(time.RFC3339, "2021-07-08T14:00:00.000+08:00")
		end, _ := time.Parse(time.RFC3339, "2021-07-08T15:30:00.000+08:00")
		var createOrderRes FieldCreateOrderRes
		err := ser.CreateOrder(rtx, &FieldCreateOrderReq{
			FieldID:   fieldId1,
			BeginTime: begin,
			EndTime:   end,
			Name:      "斗地主争霸赛",
			Comment:   "应该通过",
		}, &createOrderRes)
		if err == nil {
			t.Fatalf("create field order error %+v", err)
		}
		fmt.Println(err, begin, end)
		fieldOrderID1 = createOrderRes.OrderID
		_ = fieldOrderID2
	}

	{
		var fieldOrderID2 base.ID
		begin, _ := time.Parse(time.RFC3339, "2021-07-08T15:30:00.000+08:00")
		end, _ := time.Parse(time.RFC3339, "2021-07-08T16:30:00.000+08:00")
		var createOrderRes FieldCreateOrderRes
		err := ser.CreateOrder(rtx, &FieldCreateOrderReq{
			FieldID:   fieldId1,
			BeginTime: begin,
			EndTime:   end,
			Name:      "斗地主争霸赛",
			Comment:   "应该通过",
		}, &createOrderRes)
		if err == nil {
			t.Fatalf("create field order error %+v", err)
		}
		fmt.Println(err, begin, end)
		fieldOrderID1 = createOrderRes.OrderID
		_ = fieldOrderID2
	}

	{
		var fieldOrderID2 base.ID
		begin, _ := time.Parse(time.RFC3339, "2021-07-08T15:00:00.000+08:00")
		end, _ := time.Parse(time.RFC3339, "2021-07-08T15:30:00.000+08:00")
		var createOrderRes FieldCreateOrderRes
		err := ser.CreateOrder(rtx, &FieldCreateOrderReq{
			FieldID:   fieldId1,
			BeginTime: begin,
			EndTime:   end,
			Name:      "斗地主争霸赛",
			Comment:   "应该通过",
		}, &createOrderRes)
		if err == nil {
			t.Fatalf("create field order error %+v", err)
		}
		fmt.Println(err, begin, end)
		fieldOrderID1 = createOrderRes.OrderID
		_ = fieldOrderID2
	}

	{
		var fieldOrderID2 base.ID
		begin, _ := time.Parse(time.RFC3339, "2021-07-10T14:30:00.000+08:00")
		end, _ := time.Parse(time.RFC3339, "2021-07-10T16:00:00.000+08:00")
		var createOrderRes FieldCreateOrderRes
		err := ser.CreateOrder(rtx, &FieldCreateOrderReq{
			FieldID:   fieldId1,
			BeginTime: begin,
			EndTime:   end,
			Name:      "斗地主争霸赛",
			Comment:   "应该通过",
		}, &createOrderRes)
		if err != nil {
			t.Fatalf("create field order error %+v", err)
		}
		fieldOrderID1 = createOrderRes.OrderID
		_ = fieldOrderID2
	}

	{
		// do query the field we create before, only query name eq 会议室
		var queryRes FieldQueryRes
		_ = ser.Query(rtx, &FieldQueryReq{
			Filters: FieldQueryFilters{
				NameEq: null.StringFrom("会议室"),
			},
			// do not set Pagination
			Pagination: base.Pagination{},
		}, &queryRes)

		require.Equal(t, len(queryRes.Fields), 1, "fields number should be 1")

		field := queryRes.Fields[0]
		require.Equal(t, field.ID, fieldId1, "find the wrong field")

		var labelNames []string
		for _, label := range field.Labels {
			labelNames = append(labelNames, label.Name)
		}

		require.Contains(t, labelNames, "好地方")
		require.Contains(t, labelNames, "真的好")

		// do all checks

		_ = fieldId2

	}

}
