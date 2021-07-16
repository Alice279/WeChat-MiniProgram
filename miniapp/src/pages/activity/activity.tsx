import * as React from "react";
import { useState } from "react";
import { Image, View } from "remax/wechat";
import "../../app.css";
import activityStyles from "./activity.css";

const Index = () => {
  const [activeChoiceIndex, setActiveChoiceIndex] = useState(0);
  const choice = ["活动信息", "注意事项"];
  const content = [
    {
      img: "/icons/bussiness-man.png",
      title: "主办方简介",
      value: "简介内容吧啦吧啦",
    },
    { img: "/icons/lights.png", title: "活动主题", value: "活动主题内容" },
    { img: "/icons/clock.png", title: "时间", value: "2021-06-15" },
    { img: "/icons/map.png", title: "地点", value: "address" },
    { img: "/icons/auto.png", title: "活动场地", value: "位置名称" },
    { img: "/icons/set.png", title: "活动类型", value: "类型名称" },
    { img: "/icons/customer.png", title: "人数", value: "11" },
    { img: "/icons/suggest.png", title: "活动详情", value: "活动详情" },
  ];
  const notice = "注意事项注意事项注意事项注意事项注意事项注意事项注意事项";

  function clickChoice(index: number) {
    setActiveChoiceIndex(index);
  }

  function ActivityContent(props: any) {
    if (props.selectedActivity == true) {
      return (
        <View>
          <View className="px-3 py-3 text-green-600 text-sm">
            端午特别出演：活动名称
          </View>
          <View className="flex-col">
            {content.map((item) => {
              return (
                <View className="flex px-3 py-1" key={item.title}>
                  <Image className="h-auto w-4" src={item.img} />
                  <View className="px-1 text-xs">{item.title}: </View>
                  <View className="text-xs">{item.value}</View>
                </View>
              );
            })}
          </View>
        </View>
      );
    } else {
      return (
        <View>
          <View className="px-3 py-3 text-xs">注意事项:</View>
          <View className="px-3 py-1 h-32 text-xs">{notice}</View>
        </View>
      );
    }
  }

  function ActivityButton(props: any) {
    if (props.ended == true) {
      return (
        <View className="flex justify-center text-center">
          <View className="px-3 py-2 text-sm text-white rounded-lg bg-gray-600 w-2-3 ">
            已结束
          </View>
        </View>
      );
    } else {
      return (
        <View className="flex justify-center text-center">
          <View
            className={`${"px-3 py-2 text-sm text-white rounded-lg w-2-3 "} ${
              activityStyles.bg
            }`}
          >
            点击报名
          </View>
        </View>
      );
    }
  }

  return (
    <View className="flex-col h-screen bg-gray-200">
      <View className={activityStyles.picHeader}>
        <Image
          className="h-full w-full"
          src="https://img0.baidu.com/it/u=3767929559,1454290925&fm=26&fmt=auto&gp=0.jpg"
        />
      </View>
      <View className="flex justify-around shadow-md bg-white">
        {choice.map((item, index) => (
          <View
            className="flex-col"
            onClick={() => {
              clickChoice(index);
            }}
            key={index}
          >
            <View
              className={`${"py-3 text-sm text-center"} ${
                activeChoiceIndex == index ? "" : "text-gray-400"
              }`}
            >
              {item}
            </View>
            <View
              className={
                activeChoiceIndex == index ? "h-1 w-8 bg-green-600 mx-3" : ""
              }
            ></View>
          </View>
        ))}
      </View>
      <View className="flex-col mx-2 my-3 bg-white rounded-md">
        <ActivityContent
          selectedActivity={activeChoiceIndex == 0 ? true : false}
        />
        <ActivityButton ended={activeChoiceIndex == 0 ? true : false} />
      </View>
    </View>
  );
};

export default Index;
