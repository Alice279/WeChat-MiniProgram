import * as React from "react";
import { useState } from "react";
import { Image, View } from "remax/wechat";
import "../../app.css";
import indexStyles from "../index/index.css";
import activityStyles from "../activity/activity.css";

const Index = () => {
  const [activeChoiceIndex, setActiceChoiceIndex] = useState(0);
  const [activeNavIndex, setActiceNavIndex] = useState(0);

  const activityPoints = 20;
  const choiceBottom = [{ name: "我的活动" }, { name: "我的场地" }];
  const activityBottom = [
    { name: "已报名", img: "/icons/set.png" },
    { name: "待付款", img: "/icons/set.png" },
    { name: "历史报名", img: "/icons/set.png" },
  ];
  const navBottom = [
    { name: "首页", icon: "/icons/set.png" },
    { name: "列表", icon: "/icons/set.png" },
    { name: "个人", icon: "/icons/set.png" },
  ];

  function clickNav(index: number) {
    setActiceNavIndex(index);
  }

  function clickChoice(index: number) {
    setActiceChoiceIndex(index);
  }

  return (
    <View className="flex-col h-screen bg-white">
      <View className={`${activityStyles.bg} ${activityStyles.header}`}>
        <View className="mt-10">
          <Image className="h-20 w-20 rounded-full" src="/bk.png" />
        </View>
      </View>
      <View className="flex justify-center mt-12">
        <View className={`${activityStyles.bg} ${activityStyles.item}`}>
          积分：{activityPoints}
        </View>
      </View>
      <View className="flex justify-center h-12 pt-4">
        <View className="flex w-3-4 justify-around">
          {choiceBottom.map((item, index) => (
            <View
              onClick={() => {
                clickChoice(index);
              }}
              className="block text-center"
              key={index}
            >
              <View
                className={
                  activeChoiceIndex === index
                    ? `${activityStyles.bg} ${activityStyles.choiceSelected}`
                    : `${activityStyles.choice}`
                }
              >
                {item.name}
              </View>
            </View>
          ))}
        </View>
      </View>
      <View
        className={`${"flex justify-center items-start mt-4 mb-6 text-xs text-center text-green-400"} ${
          activityStyles.choiceContent
        }`}
      >
        <View className="flex justify-center items-center h-full w-32 mr-2 pb-2 shadow-lg rounded-md">
          <View>
            <Image className="h-10 w-10" src={activityBottom[0].img} />
            <View>{activityBottom[0].name}</View>
          </View>
        </View>
        <View className="flex-col h-full w-32 justify-center">
          {activityBottom.map((item, index) => {
            if (index != 0)
              return (
                <View
                  className="flex justify-center items-center h-1-2 mb-2  shadow-lg rounded-md"
                  key={index}
                >
                  <View>
                    <Image className="h-10 w-10" src={item.img} />
                    <View>{item.name}</View>
                  </View>
                </View>
              );
          })}
        </View>
      </View>
      <View className={indexStyles.navbar}>
        {navBottom.map((item, index) => (
          <View
            className={indexStyles.navItem}
            onClick={() => {
              clickNav(index);
            }}
            key={index}
          >
            <View
              className={
                activeNavIndex === index
                  ? indexStyles.navSelected
                  : indexStyles.navImgContainer
              }
            >
              <Image className={indexStyles.navImg} src={item.icon} />
              <View>{item.name}</View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Index;
