import * as React from "react";
import { useState } from "react";
import { Image, login, request, Text, View, Navigator } from "remax/wechat";
import styles from "./index.css";
import { useAsync } from "react-use";
import { Button, navigateTo } from "remax/one";
//import { Tabs } from "@miniprogram-component-plus/tabs"

const Index = () => {
  Date.prototype.format = function (fmt) {
    const o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      S: this.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (const k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };
  const convert = (d) => {
    const t = new Date(d).format("yyyy-MM-dd hh:mm");
    return t;
  };
  const [activeIndex, setActiceIndex] = useState(1);
  const [activetopIndex, setActicetopIndex] = useState(0);
  const [activities, setActivities] = useState([]);
  const [uid, setUid] = useState(0);
  const [webviewUrl, setWebViewUrl] = useState("");
  const [session, setSession] = useState("");
  useAsync(async () => {
    console.log(123);
    const loginResult = await login();
    const res = await request({
      method: "GET",
      url: "http://127.0.0.1:8001/api/activity/ActivityService.ActivityList",
      // data: {
      //   filters: {
      //     locationEq: "石油大院",
      //   },
      //   pagination: {},
      // },
    });
    if (res.statusCode == 200) {
      setActivities(res.data.data.activities);
    }
    // if(res.)
    // setFields(res.data.data.fields);
    // const user = res.data.data.user;
    // const uid = user.id;
    // setUid(uid);
    // setSession(res.data.data.session);
    // console.log(res.data.data.session);
  });

  const array = ["石油大院", "石油中院", "石油小院"];
  const navBottom = [
    {
      name: "首页",
      icon: "/icons/home.png",
    },
    {
      name: "列表",
      icon: "/icons/list-selected.png",
    },
    {
      name: "个人",
      icon: "/icons/personal.png",
    },
  ];
  const cardContent = [
    {
      img: "/bk.png",
      name: "古琴教学",
      time: "6月1日",
      place: "多功能厅",
    },
    {
      img: "/bk.png",
      name: "古琴教学1",
      time: "6月1日1",
      place: "多功能厅1",
    },
    {
      img: "/bk.png",
      name: "古琴教学",
      time: "6月1日",
      place: "多功能厅",
    },
    {
      img: "/bk.png",
      name: "古琴教学1",
      time: "6月1日1",
      place: "多功能厅1",
    },
    {
      img: "/bk.png",
      name: "古琴教学",
      time: "6月1日",
      place: "多功能厅",
    },
    {
      img: "/bk.png",
      name: "古琴教学1",
      time: "6月1日1",
      place: "多功能厅1",
    },
  ];
  const topnavBottom = [
    {
      name: "全部",
    },
    {
      name: "导航一",
    },
    {
      name: "导航二",
    },
  ];

  function clickNav(index: number) {
    switch (index) {
      case 0:
        wx.redirectTo({
          url: "../index/index",
        });
        break;
      case 1:
        break;
      case 2:
        wx.redirectTo({
          url: "../index/index",
        });
        break;
    }
  }
  function clicktopNav(index: number) {
    setActicetopIndex(index);
  }

  return (
    <View>
      <View className={styles.head}>
        <Navigator
          //openType="navigate"
          className={styles.navigate}
        >
          <Text className="text-xs">活动列表</Text>
        </Navigator>
      </View>

      <View className={styles.topnav}>
        {topnavBottom.map((item, index) => (
          <View
            onClick={() => clicktopNav(index)}
            className={styles.topnavItem}
          >
            <View
              className={
                activetopIndex === index
                  ? styles.topnavSelected
                  : styles.topnavUsual
              }
            >
              {item.name}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {activities.map((item, index) => (
          <View key={index} className={styles.card}>
            <Image
              className={styles.cardImg}
              src={"http://127.0.0.1:8001/" + item.coverPicUrl}
            />
            <View className={styles.cardContent}>
              <View className={styles.cardText}>
                <Text className={styles.cardTitle}>{item.title}</Text>
                <Text className={styles.cardSub}>
                  时间：{convert(item.begin)}
                </Text>
                <Text className={styles.cardSub}>地点：{item.field}</Text>
              </View>
              <View>
                <Button className={styles.cardButton}>
                  <Text className="text-white text-sm self-center">报名</Text>
                </Button>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.navbar}>
        {navBottom.map((item, index) => (
          <View onClick={() => clickNav(index)} className={styles.navItem}>
            <View
              className={
                1 === index ? styles.navSelected : styles.navImgContainer
              }
            >
              <Image
                className={index === 1 ? "w-6 h-6" : "w-6 h-6"}
                src={item.icon}
              />
              <View
                className={
                  index === 1
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
