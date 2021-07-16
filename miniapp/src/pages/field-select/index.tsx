import * as React from "react";
import { useState } from "react";
import { Image, View } from "remax/wechat";
import "../../app.css";
import activityStyles from "../activity/activity.css";
import fieldStyles from "./field_select.css";
import indexStyles from "../index/index.css";
import { useBackend, field } from "../../lib/backend";
import { useAsync } from "react-use";

const Index = () => {
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);
  const [activeNavIndex, setActiceNavIndex] = useState(1);
  const { call } = useBackend();
  const state = useAsync(() =>
    call(field.FieldService.Query, {
      filters: {} as any,
      pagination: { pageSize: 1000 },
    })
  );
  if (state.loading) {
    return <View>loading</View>;
  }
  if (state.error) {
    return <View>{JSON.stringify(state.error)}</View>;
  }

  console.log(state.value);

  const fieldNav = [
    "全部",
    "导航一",
    "导航二",
    "导航三",
    "导航四",
    "导航五",
    "导航六",
  ];
  const fieldInfo = [
    {
      img: "/bk.png",
      fieldName: "会议室",
      time: "7:00-17:00",
      position: "是有共生大院西北角",
      people: 66,
    },
    {
      img: "/bk.png",
      fieldName: "会议室",
      time: "7:00-17:00",
      position: "是有共生大院西北角",
      people: 25,
    },
  ];
  const navBottom = [
    { name: "首页", icon: "/icons/set.png" },
    { name: "列表", icon: "/icons/set.png" },
    { name: "个人", icon: "/icons/set.png" },
  ];

  function clickField(index: number) {
    setActiveFieldIndex(index);
  }

  function clickNav(index: number) {
    setActiceNavIndex(index);
  }

  return (
    <View className="h-screen">
      <View className="flex justify-start items-center h-5">
        {fieldNav.map((item, index) => {
          const hideUnderline = activeFieldIndex == index ? false : true;
          return (
            <View
              className="flex justify-center w-auto py-1 px-1 text-center text-xs"
              onClick={() => {
                clickField(index);
              }}
              key={index}
            >
              <View
                className={activeFieldIndex == index ? "font-bold text-sm" : ""}
              >
                <View>{item}</View>
                <View
                  className={`${activityStyles.bg} ${"w-8 h-1"}`}
                  hidden={hideUnderline}
                ></View>
              </View>
            </View>
          );
        })}
      </View>
      <View className="flex justify-center">
        <View className="flex-col">
          {fieldInfo.map((item, index) => (
            <View
              className={`${"flex justify-start items-end my-5 mx-5 rounded-md shadow-xl"} ${
                fieldStyles.fieldItem
              }`}
              style={{ backgroundImage: `url(${item.img})` }}
              key={index}
            >
              <View
                className={`${"flex justify-around w-full rounded-md"} ${
                  fieldStyles.bg
                }`}
              >
                <View className="w-2-3 py-2 px-3 text-white">
                  <View className="text-sm">{item.fieldName}</View>
                  <View className="text-xs">开放时间: {item.time}</View>
                  <View className="text-xs">位置: {item.position}</View>
                  <View className="text-xs">可预约人数: {item.people}</View>
                </View>
                <View className="flex justify-center items-center w-1-3 text-center">
                  <View className={`${fieldStyles.fieldItem_btn}`}>报名</View>
                </View>
              </View>
            </View>
          ))}
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
