import * as React from "react";
import { useState } from "react";
import {
  Image,
  login,
  Picker,
  request,
  Swiper,
  SwiperItem,
  Text,
  View,
  Navigator,
} from "remax/wechat";
import styles from "./index.css";
import { useAsync } from "react-use";
import { Button } from "remax/one";
//import { WebView } from "remax/one";
const Index = () => {
  const [activeIndex, setActiceIndex] = useState(0);
  const [uid, setUid] = useState(0);
  const [webviewUrl, setWebViewUrl] = useState("");
  const [session, setSession] = useState("");
  useAsync(async () => {
    console.log(123);
    const loginResult = await login();
    const res = await request({
      method: "POST",
      url: "http://localhost:8001/api/auth/UserService.WechatLogin",
      data: {
        code: loginResult.code,
      },
    });
    const user = res.data.data.user;
    const uid = user.id;
    setUid(uid);
    setSession(res.data.data.session);
    console.log(res.data.data.session);
  });

  const array = ["石油大院", "石油中院", "石油小院"];
  const content = [
    {
      name: "介绍",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "活动报名",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "场地预约",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "商城",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "123",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "456",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
  ];
  const navBottom = [
    {
      name: "测试",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "测试",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
    {
      name: "测试",
      icon: "https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ",
    },
  ];

  function clickNav(index: number) {
    setActiceIndex(index);
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
        <Navigator
          //openType="navigate"
          className={styles.navigate}
          url="../index_select/index"
        >
          <Text>石油大院</Text>
          <Image
            className={styles.naviImg}
            src="https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ"
          />
        </Navigator>

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
            onClick={() => clickNav(index)}
            className={styles.navItem}
            key={index}
          >
            <View
              className={
                activeIndex === index
                  ? styles.navSelected
                  : styles.navImgContainer
              }
            >
              <Image className={styles.navImg} src={item.icon} />
              <View>{item.name}</View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Index;
