import {
  Image,
  Swiper,
  SwiperItem,
  View,
  getStorageSync,
  setStorageSync,
} from "remax/wechat";
import React, { useState } from "react";
import Large, { isLarge, setLarge } from "@/components/large";
import { auth, field, home_swiper, useBackend } from "@/lib/shared/backend";
import { promisify } from "wx-promise-pro";
import { useAsync } from "react-use";

const Index = function () {
  const { call, context } = useBackend();
  const [_, refresh] = useState(0);
  const [location, setLocation] = useState(
    getStorageSync("location") || "石油共生大院"
  );
  const items = [
    {
      name: "我们是谁",
      icon: "/icons/introduction.png",
      url: `/pages/v2/webview/index?url=${encodeURIComponent(
        `/introduction?location=${location}`
      )}`,
    },
    {
      name: "活动报名",
      icon: "/icons/sign-up.png",
      url: "/pages/v2/activities/index",
    },
    {
      name: "场地预约",
      icon: "/icons/field-book.png",
      url: "/pages/v2/fields/index",
    },
    {
      name: "线上商城",
      icon: "/icons/shop-market.png",
      appID: "wx054d89176f8ed448",
    },
    {
      name: "加入我们",
      icon: "/icons/join-us.png",
      url: `/pages/v2/webview/index?url=${encodeURIComponent(
        `/joinus?location=${location}`
      )}`,
    },
  ];

  const homeSwiperState = useAsync(async () => {
    return await call(home_swiper.SwiperService.SwiperGet, {}, { get: true });
  });

  const banners = homeSwiperState.value
    ? homeSwiperState.value.urls.map((url) => context.host + url)
    : ["/bk.png#1", "/bk.png#2", "/bk.png#3"];
  const switchLocation = async () => {
    const data = await call(
      field.FieldService.QueryLocations,
      {},
      { get: true }
    );
    const items = data.locations;
    const result = await wx.showActionSheet({
      alertText: "选择地点",
      itemList: items,
    });
    setLocation(items[result.tapIndex]);
    setStorageSync("location", items[result.tapIndex]);
  };
  const safeArea = wx.getSystemInfoSync().safeArea;
  const menuRect = wx.getMenuButtonBoundingClientRect();
  return (
    <View>
      <View
        style={{
          marginTop: `${safeArea.top + menuRect.top}px`,
          height: `calc(${menuRect.height}Px + 0.2rem)`,
          width: `100vw`,
          fontSize: "30px",
        }}
        className="flex justify-center items-center font-bold"
        onClick={switchLocation}
      >
        {location}
        <View className="font-icon pl-1">{"\uf107"}</View>
      </View>
      <Large className="pb-20">
        {isLarge() === null ? (
          <ModeSelectThenLogin onFinish={() => refresh(1)} />
        ) : null}
        <Swiper
          className="w-screen"
          style={{ height: "60vw" }}
          indicatorDots={true}
          autoplay={true}
          duration={1000}
          interval={4000}
        >
          {banners.map((item) => (
            <SwiperItem key={item}>
              <Image src={item} className="w-screen h-full" />
            </SwiperItem>
          ))}
        </Swiper>
        {/* <View className='flex mx-4 my-1 text-gray-700'>
          <View className='text-sm'>当前位置：</View>
          <View className='text-sm'>{location}</View>
          <View className='flex-grow'></View>
          <View className='text-sm underline' onClick={switchLocation}>
            切换位置
          </View>
        </View> */}
        <View className="w-screen flex justify-center items-center mt-3">
          <View
            className="flex-wrap flex justify-start"
            style={{ width: "88vw" }}
          >
            {items.map((item) => (
              <View
                onClick={() => {
                  if (item.appID) {
                    wx.navigateToMiniProgram({
                      appId: item.appID,
                    });
                  }
                  wx.navigateTo({ url: item.url! });
                }}
                key={item.name}
                style={{
                  height: "18vw",
                  width: "18vw",
                  marginLeft: "2vw",
                  marginRight: "2vw",
                }}
                className="flex flex-col justify-center items-center my-2 rounded shadow-green bg-white"
              >
                <Image src={item.icon} className="w-6 h-6 mb-2" />
                <View className="font-light" style={{ fontSize: "0.875rem" }}>
                  {item.name}
                </View>
              </View>
            ))}
          </View>
        </View>
        <TabBar selected="home" />
      </Large>
    </View>
  );
};

const ModeSelectThenLogin = (props: { onFinish: () => void }) => {
  const { call } = useBackend();
  const onLoginClick = async () => {
    try {
      const profile = await promisify(wx.getUserProfile)({
        desc: "获取昵称和头像，用于页面展示。",
      });
      const userInfo = profile.userInfo;
      const data = await call(auth.UserService.WechatUpdateProfile, userInfo);
      wx.showToast({
        title: `登录成功`,
        icon: "success",
      });
    } catch (e) {
      if (e.errMsg && e.errMsg.indexOf("getUserProfile") > -1) {
        wx.showModal({
          title: "敬告",
          content:
            "您拒绝了我们获取您昵称和头像的请求，您可以继续使用本程序。本程序将在必要时重新获取相关信息。",
          showCancel: false,
        });
      } else {
        wx.showToast({
          title: `登录失败 ${JSON.stringify(e)}`,
          icon: "none",
        });
      }
    }
    props.onFinish();
  };
  const [isLarge, setIsLarge] = useState(false);
  const doSetIsLarge = (isLarge: boolean) => {
    setIsLarge(isLarge);
    setLarge(isLarge);
  };

  return (
    <View
      className={`fixed  ${isLarge ? "large" : ""}`}
      style={{ height: "100vh", left: 0, right: 0, top: 0, zIndex: 100 }}
    >
      <View
        className="absolute"
        style={{
          background: "rgba(0,0,0,0.3)",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        }}
      />
      <View
        className="bg-white rounded-t-xl absolute text-base flex flex-col"
        style={{ zIndex: 200, bottom: 0, left: 0, right: 0, height: "60vh" }}
      >
        <View className="px-4 py-4">请选择使用模式:</View>
        <View className={`pb-5 w-full flex items-center justify-around`}>
          <View
            className={`border-gray-400 border border-solid rounded-xl flex flex-col justify-around items-center ${
              !isLarge ? "shadow-green" : ""
            }`}
            style={{ width: "40vw", height: "40vw" }}
            onClick={() => doSetIsLarge(false)}
          >
            <Image src="/icons/list.png" className="w-10 h-10 mt-5" />
            <View>普通模式</View>
          </View>
          <View
            className={`border-gray-400 border border-solid rounded-xl flex flex-col justify-around items-center ${
              isLarge ? "shadow-green" : ""
            }`}
            style={{ width: "40vw", height: "40vw" }}
            onClick={() => doSetIsLarge(true)}
          >
            <Image src="/icons/list.png" className="w-10 h-10 mt-5" />
            <View>老年人模式</View>
          </View>
        </View>
        <View
          className="rounded p-3 bg-green-400 text-white w-24 self-center text-center mt-5"
          onClick={onLoginClick}
        >
          授权登录
        </View>
        <View className="text-sm font-light text-gray-700 p-2 text-center">
          我们需要您的头像和昵称用于活动报名和场地预约的核验，请您理解。
        </View>
      </View>
    </View>
  );
};

export const TabBar = function (props: { selected: string }) {
  const items = [
    {
      name: "首页",
      icon: "home",
      url: "/pages/v2/index/index",
    },
    {
      name: "活动",
      icon: "list",
      url: "/pages/v2/activities/index",
    },
    {
      name: "个人",
      icon: "personal",
      url: "/pages/v2/user-home/index",
    },
  ];

  function iconUrl(name: string, selected: string) {
    return `/icons/${name}${selected === name ? "-selected" : ""}.png`;
  }

  return (
    <View
      className="fixed flex items-center justify-around rounded-3xl bg-white h-16 shadow-green"
      style={{ left: "10vw", right: "10vw", bottom: "4vw" }}
    >
      {items.map((item) => (
        <View
          className={`p-1 m-1`}
          key={item.url}
          onClick={() => wx.redirectTo({ url: item.url })}
        >
          <View
            className={`flex flex-col items-center justify-center  rounded-full w-16 h-16 relative ${
              item.icon === props.selected
                ? "bg-green-400 mb-10 text-white shadow-green"
                : ""
            }`}
          >
            <Image
              className={`w-5 h-5 pb-1`}
              src={iconUrl(item.icon, props.selected)}
            />
            <View className={`text-base`}>{item.name}</View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default Index;
