import * as React from "react";
import { View, Text, Image, request, login } from "remax/wechat";
import styles from "./home.css";
import { useAsync } from "react-use";
import { useState } from "react";
import { WebView } from "remax/one";

const Index = () => {
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
    console.log(res);
    const user = res.data.data.user;
    const uid = user.id;
    setUid(uid);
    setSession(res.data.data.session);
    console.log(res.data.data.session);
  });

  return (
    <View className={styles.app}>
      <View className={styles.header}>
        <Image
          src="https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*OGyZSI087zkAAAAAAAAAAABkARQnAQ"
          className={styles.logo}
        />
        {webviewUrl.length > 0 && <WebView src={webviewUrl} />}

        <View className={styles.text}>UID = {uid}</View>
        <View
          onClick={() => {
            console.log(`http://127.0.0.1:3000/?session=${session}`);
            setWebViewUrl(`http://127.0.0.1:3000/?session=${session}`);
          }}
        >
          {" "}
          点击这里加载 WebView 并透传session
        </View>
      </View>
    </View>
  );
};

export default Index;
