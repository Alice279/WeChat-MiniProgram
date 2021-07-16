import * as React from "react";
import { useState } from "react";
import { Image, View } from "remax/wechat";
import "../../app.css";
import activityStyles from "../activity/activity.css";
import userFieldStyles from "./index.css";

const Index = () => {
  const userField = [
    {
      activityName: "活动名",
      time: "场地预约时间",
      fieldName: "场地名",
      status: "待审核",
    },
    {
      activityName: "活动名",
      time: "场地预约时间",
      fieldName: "场地名",
      status: "已完成",
    },
  ];

  return (
    <View className="h-screen">
      <View className="flex justify-center items-center">
        <View className="flex-col">
          {userField.map((item, index) => (
            <View
              className={`${"w-full flex justify-around border-solid border-2 my-3"} ${
                userFieldStyles.userFieldItem
              }`}
              key={index}
            >
              <View className="w-2-3 flex justify-start items-center pl-3">
                <View className="flex-col text-xs">
                  <View className="py-1">{item.activityName}</View>
                  <View className="py-1">{item.time}</View>
                  <View className="py-1">{item.fieldName}</View>
                </View>
              </View>
              <View className="w-1-3 flex justify-center items-center">
                <View className="border-solid border-2 py-1 px-1 text-center text-sm">
                  {item.status}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Index;
