import * as React from "react";
import "./app.css";
import { Backend } from "./lib/backend";
import WxCaller from "./lib/backend/wx-caller";
import { getStorage, setStorage, View } from "remax/wechat";
import "dayjs/locale/zh-cn";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
dayjs.locale("zh-cn");

dayjs.extend(objectSupport);
const App: React.FC = (props) => (
  <View>
    <Backend
      caller={WxCaller}
      host="https://cdn.miniapp.heheshehuizuzhi.com"
      // prefix="http://localhost:8001/api/"
      storage={{
        get: (key) =>
          getStorage({ key })
            .then((res) => res.data)
            .catch(() => null),
        set: (k, v) => setStorage({ key: k, data: v }),
      }}
    >
      {props.children}
    </Backend>
  </View>
);

export default App;
