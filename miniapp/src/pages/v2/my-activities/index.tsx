import Large from "@/components/large";
import { View } from "remax/wechat";
import React, { useState } from "react";
import { useAsync } from "react-use";
import { activity, useBackend } from "@/lib/shared/backend";
import dayjs from "dayjs";

const MyActivitiesPage = () => {
  const { call } = useBackend();
  const [isHistory, setIsHistory] = useState(false);

  const state = useAsync(async () => {
    try {
      return await call(activity.SignUpService.UserSignUpActivity, {});
    } catch (e) {
      wx.showModal({
        title: "发生一些错误",
        content: JSON.stringify(e),
        showCancel: false,
      });
    }
  });

  const records = (state.value?.signUpRecord || []).filter((act) => {
    if (isHistory) {
      return new Date() > new Date(act.activity.endTime);
    } else {
      return new Date() < new Date(act.activity.endTime);
    }
  });
  wx.setNavigationBarTitle({
    title: "我的活动",
  });
  console.log(records);
  return (
    <Large className="">
      <View className="text-base bg-white p-1 flex justify-around">
        <View
          className={`${!isHistory ? "border-bottom-green" : ""}`}
          onClick={() => setIsHistory(false)}
        >
          已报名
        </View>
        <View
          className={isHistory ? "border-bottom-green" : ""}
          onClick={() => setIsHistory(true)}
        >
          历史报名
        </View>
      </View>
      <View className="flex flex-col">
        {records.map((record) => (
          <View
            className="flex m-2 bg-white rounded p-3 items-center justify-around"
            onClick={() => {
              wx.navigateTo({
                url: `/pages/v2/activity/index?id=${record.activity.id}`,
              });
            }}
          >
            <View className="flex flex-col">
              <View>{record.activity.profile.title}</View>
              <View className="font-light">
                {" "}
                时间:
                {dayjs(record.activity.beginTime).format(
                  "YYYY-MM-DD HH:mm"
                )} ~ {dayjs(record.activity.endTime).format("HH:mm")}{" "}
              </View>
            </View>
            <View>{record.verifiedAt ? "报名成功" : "待审核"}</View>
          </View>
        ))}
      </View>
    </Large>
  );
};

export default MyActivitiesPage;
