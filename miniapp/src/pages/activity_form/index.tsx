import * as React from "react";
import { useState } from "react";
import {
  Image,
  login,
  Input,
  request,
  Text,
  View,
  Navigator,
  Radio,
  RadioGroup,
  Label,
  Form,
} from "remax/wechat";
import styles from "./index.css";
import { useAsync } from "react-use";
import { Button, WebView } from "remax/one";

const Index = () => {
  const [uid, setUid] = useState(0);
  const [webviewUrl, setWebViewUrl] = useState("");
  const [session, setSession] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });
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

  const details = {
    img: "/bk.png",
    title: "古琴教学",
    time: "时间：6月1日",
    location: "地点：多功能厅",
    number: "人数：11人",
    cost: "费用：免费",
  };
  const require = ["信息3", "信息4"];

  return (
    <View>
      <View className={styles.head}>
        <Navigator
          //openType="navigate"
          className={styles.navigate}
        >
          <Text className="text-xs">活动报名</Text>
        </Navigator>
      </View>

      <View className={styles.container}>
        <Image className={styles.Img} src={details.img} />

        <View className={styles.content}>
          <Text className={styles.title}>{details.title}</Text>
          <Text className={styles.info}>{details.time}</Text>
          <Text className={styles.info}>{details.location}</Text>
          <Text className={styles.info}>{details.number}</Text>
          <Text className={styles.info}>{details.cost}</Text>
        </View>

        <View className={styles.require}>
          <View className={styles.requireTitles}>
            <Text className={styles.requireTitle}>姓名</Text>
            <Text className={styles.requireTitle}>性别</Text>
            {require.map((item, index) => (
              <Text className={styles.requireTitle}>{item}</Text>
            ))}
          </View>

          <View className={styles.requireForm}>
            <Input
              className={styles.requireInput}
              value={form.name}
              onInput={(e) => {
                setForm({ ...form, name: e.detail.value });
              }}
            />
            <View className={styles.requireRadio}>
              <RadioGroup>
                <Radio value="男" className="mr-4">
                  男
                </Radio>
                <Radio value="女">女</Radio>
              </RadioGroup>
            </View>
            {require.map((item, index) => (
              <Input className={styles.requireInput} />
            ))}
          </View>
        </View>

        <View>
          <Button className={styles.button}>提交</Button>
        </View>
      </View>
    </View>
  );
};

export default Index;
