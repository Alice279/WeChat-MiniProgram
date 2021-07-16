import { OpenData, View } from "remax/wechat";
import React, { useState } from "react";
import Large, { isLarge, setLarge } from "@/components/large";
import { TabBar } from "@/pages/v2/index";
import { useAsync } from "react-use";
import { auth, points, useBackend } from "@/lib/backend";

const UserHomePage = () => {
  const [_refresh, refresh] = useState(0);
  const { call, context } = useBackend();
  wx.setNavigationBarTitle({
    title: "个人中心",
  });
  const state = useAsync(async () => {
    return call(auth.UserService.UserDetail, {}, { get: true });
  });
  const pointsState = useAsync(async () => {
    const data = await call(
      points.PointsService.GetMyPoints,
      {},
      { get: true }
    );
    return data.points;
  });

  function setIsLarge(large: boolean) {
    setLarge(large);
    refresh(_refresh + 1);
  }

  return (
    <Large className="">
      <View className="w-screen h-20 relative bg-green-400">
        <View
          className="flex w-screen items-center justify-center absolute"
          style={{ bottom: "-65%" }}
        >
          <View className="flex flex-col justify-center items-center">
            <View className="w-20 h-20 rounded-full overflow-hidden">
              <OpenData type="userAvatarUrl" />
            </View>
            <OpenData type="userNickName" className="relative" />
          </View>
        </View>

        <View className="pt-32">
          <View className="border-solid border-2 border-gray-400 rounded m-5 bg-white text-base">
            <View className="p-3 flex border-solid border-0 border-b-2 border-gray-400">
              <View className="font-icon w-4 pr-1  text-green-800">
                {"\ue26b"}
              </View>
              我的积分
              <View className="flex-grow" />
              <View>{pointsState.value || 0}</View>
            </View>

            <View
              className="flex p-3  border-solid border-0 border-b-2 border-gray-400"
              onClick={() =>
                wx.navigateTo({ url: "/pages/v2/my-activities/index" })
              }
            >
              <View className="font-icon w-4 pr-1 text-green-800">
                {"\uf88e"}
              </View>
              我的活动
              <View className="flex-grow" />
              <View className="font-icon" style={{ fontSize: "1.5rem" }}>
                {"\uf105"}
              </View>
            </View>

            {state.value?.user.isStaff && (
              <View
                className="p-3 flex border-solid border-0 border-b-2 border-gray-400"
                onClick={() => {
                  const url = encodeURIComponent(
                    `/?deviceToken=${context.deviceToken}`
                  );
                  wx.navigateTo({ url: `/pages/v2/webview/index?url=${url}` });
                }}
              >
                <View className="font-icon w-4 pr-1 text-center text-green-800">
                  {"\uf993"}
                </View>
                管理后台
                <View className="flex-grow" />
                <View className="font-icon" style={{ fontSize: "1.5rem" }}>
                  {"\uf105"}
                </View>
              </View>
            )}
            <View
              className="p-3 flex items-baseline"
              onClick={() => setIsLarge(!isLarge())}
            >
              <View className="font-icon w-4 pr-1 text-center text-green-800">
                {"\uf763"}
              </View>
              老年模式
              <View className="flex-grow" />
              <View className="font-icon" style={{ fontSize: "1.5rem" }}>
                {isLarge() ? "\uf631" : "\uf630"}
              </View>
            </View>
          </View>
        </View>
      </View>
      <TabBar selected="personal" />
    </Large>
  );
};

export default UserHomePage;
