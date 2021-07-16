import * as React from "react";
import { useState } from "react";
import { Image, View } from "remax/wechat";
import "../../app.css";
import activityStyles from "../activity/activity.css";
import modeStyles from "./mode_select.css";

const Index = () => {
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const mode = ["普通模式", "老年人模式"];
  const modeIcon = ["/icons/lights.png", "/icons/set.png"];

  function setMode(index: number) {
    setActiveModeIndex(index);
  }

  return (
    <View className="h-screen px-8 text-sm">
      <View className="pb-2">请选择使用模式:</View>
      <View
        className={`${"pb-5 w-full flex justify-between"} ${
          modeStyles.modeContent
        }`}
      >
        {mode.map((item, index) => {
          const checked =
            activeModeIndex == index
              ? "border-green-400 border-5 border-solid"
              : "";

          return (
            <View
              onClick={() => {
                setMode(index);
              }}
              key={index}
              className={`${"flex justify-center items-center px-3 shadow-xl text-center rounded-xl"} ${
                modeStyles.modeItem
              } ${checked}`}
            >
              <View>
                <View className="py-2">{item}</View>
                <Image
                  className="w-10 h-10"
                  src={activeModeIndex == index ? modeIcon[0] : modeIcon[1]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View className="flex justify-center">
        <View
          className={`${
            activityStyles.bg
          } ${"flex justify-center items-center h-8 w-32 text-white text-xs text-center rounded-2xl"}`}
        >
          确 定
        </View>
      </View>
    </View>
  );
};

export default Index;
