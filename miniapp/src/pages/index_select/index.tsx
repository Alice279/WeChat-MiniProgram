import * as React from "react";
import { useState } from "react";
import { login, request, View } from "remax/wechat";
import styles from "./index.css";
import { useAsync } from "react-use";
import { Button, navigateBack } from "remax/one";
//import { WebView } from "remax/one";
const Index = () => {
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

  const location = ["石油大院", "石油中院", "石油小院"];

  function clickButton(index: number) {
    navigateBack();
  }

  return (
    <View className={styles.options}>
      {location.map((item, index) => (
        <View onClick={() => clickButton(index)}>
          <Button>{item}</Button>
        </View>
      ))}
    </View>
  );
};

export default Index;
