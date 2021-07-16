import * as React from "react";
import {
  Image,
  login,
  Swiper,
  SwiperItem,
  Text,
  View,
  Navigator,
} from "remax/wechat";
import styles from "./index.css";
import { useAsync } from "react-use";
import { Button } from "remax/one";
import { navigateTo } from "remax/one";

import { useBackend, auth } from "../../lib/backend";
const Index = () => {
  const { call, setSession, setDeviceToken } = useBackend();
  useAsync(async () => {
    try {
      console.log(123);
      const loginResult = await login();
      const data = await call(
        auth.UserService.WechatLogin,
        {
          code: loginResult.code,
        },
        { useSession: false }
      );
      const user = data.user;
      const uid = user.id;
      //setUid(uid);
      setSession(data.session);
      console.log(data.session);
      setDeviceToken(data.deviceToken);
      console.log(data);
    } catch (e) {
      console.error(e);
    }
  });
  const content = [
    {
      name: "介绍",
      icon: "/icons/introduction.png",
    },
    {
      name: "活动报名",
      icon: "/icons/sign-up.png",
    },
    {
      name: "场地预约",
      icon: "/icons/field-book.png",
    },
    {
      name: "商城",
      icon: "/icons/shop-market.png",
    },
    {
      name: "加入我们",
      icon: "/icons/join-us.png",
    },
    {
      name: "更多功能",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
  ];
  const navBottom = [
    {
      name: "首页",
      icon: "/icons/home-selected.png",
    },
    {
      name: "列表",
      icon: "/icons/list.png",
    },
    {
      name: "个人",
      icon: "/icons/personal.png",
    },
  ];

  function clickNav(index: number) {
    switch (index) {
      case 0:
        break;
      case 1:
        wx.redirectTo({
          url: "../activity_list/index",
        });
        break;
      case 2:
        wx.redirectTo({
          url: "../activity_list/index",
        });
        break;
    }
  }

  return (
    <View>
      <View className={styles.container}>
        <View className={styles.content}>
          {content.map((item, index) => (
            <Button className={styles.item}>
              <Image className={styles.contentImg} src={item.icon} />
              <Text className={styles.title}>{item.name}</Text>
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.head}>
        {/*<Navigator*/}
        {/*  //openType="navigate"*/}
        {/*  className={styles.navigate}*/}
        {/*  url="../index_select/index"*/}
        {/*>*/}
        {/*  <Text className="text-xs">石油大院</Text>*/}
        {/*  <Image*/}
        {/*    className={styles.naviImg}*/}
        {/*    src="https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ"*/}
        {/*  />*/}
        {/*</Navigator>*/}

        <Swiper
          indicatorDots={true}
          className={styles.swiper}
          autoplay={true}
          duration={1000}
          interval={4000}
        >
          <SwiperItem>
            <Image src="/bk.png" className={styles.swiperImg} />
          </SwiperItem>
          <SwiperItem>
            <Image src="/bk.png" className={styles.swiperImg} />
          </SwiperItem>
          <SwiperItem>
            <Image src="/bk.png" className={styles.swiperImg} />
          </SwiperItem>
        </Swiper>
      </View>

      <View className={styles.navbar}>
        {navBottom.map((item, index) => (
          <View
            key={index}
            onClick={() => clickNav(index)}
            className={styles.navItem}
          >
            <View
              className={
                0 === index ? styles.navSelected : styles.navImgContainer
              }
            >
              <Image
                className={index === 0 ? "w-6 h-6" : "w-6 h-6"}
                src={item.icon}
              />
              <View
                className={
                  index === 0
                    ? "text-white text-xs mt-1"
                    : "text-green-600 text-xs mt-1"
                }
              >
                {item.name}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Index;
