import { AppConfig } from "remax/wechat";

const config: AppConfig = {
  pages: [
    "pages/v2/index/index",
    "pages/v2/fields/index",
    "pages/v2/field/index",
    "pages/v2/activities/index",
    "pages/v2/my-activities/index",
    "pages/v2/activity/index",
    "pages/v2/user-home/index",
    "pages/v2/webview/index",
    // "pages/introduction/index",
    // "pages/home/home",
    // "pages/activity_form/index",
    // "pages/index/index",
    // "pages/activity/activity",
    // "pages/mode-select/index",
    // "pages/user/index",
    // "pages/user-field/index",
    // "pages/activity_list/index",
    // "pages/activity/mode_select",
    // "pages/activity/index",
    // "pages/activity/field",
    // "pages/activity/field_select",
    // "pages/why/index",
    // "pages/login/index",
    // "pages/period-select/index",
    // "pages/index_select/index",
  ],
  window: {
    navigationBarTitleText: "石油共生大院 ",
    navigationBarBackgroundColor: "#FFFFFF",
    navigationBarTextStyle: "black",
  },
  /*
  usingComponents: {
    "Tabs": "@miniprogram-component-plus/tabs"
  }*/
};

export default config;
