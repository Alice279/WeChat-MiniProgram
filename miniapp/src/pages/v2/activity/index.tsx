import React, { useEffect, useState } from "react";
import { Image, Input, Radio, RadioGroup, View } from "remax/wechat";
import { useAsync } from "react-use";
import { activity, auth, useBackend } from "@/lib/shared/backend";
import { useQuery } from "remax";
import Large, { setLarge } from "@/components/large";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { promisify } from "wx-promise-pro";

dayjs.extend(relativeTime);

const ActivityPage = () => {
  const { call, context } = useBackend();
  const query = useQuery();
  wx.setNavigationBarTitle({
    title: "活动详情",
  });
  const [isShowPics, setIsShowPics] = useState(false);
  const [reminds, setReminds] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const state = useAsync(() => {
    return call(activity.ActivityService.GetActivityDetail, { id: query.id! });
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (state.value) {
        setReminds(dayjs(state.value.activity.signUpEnd).fromNow());
      }
    }, 1000);
    return () => clearInterval(intervalId);
  });

  if (!query.id) {
    wx.navigateBack();
  }

  if (state.loading) {
    return <View>loading</View>;
  }
  if (state.error) {
    console.error(state.error);
    wx.showModal({
      title: "发生了一些错误",
      content: JSON.stringify(state.error),
    });
  }

  const act = state.value?.activity!;
  const signUpAt = state.value?.signUpAt;
  const fieldContents = {
    场地: act.location,
    位置: act.field,
    咨询电话: `${act.sponsor} (${act.origanizerNumber})`,
    活动人数: act.totalQuota,
    报名人数: act.fakeQuota > 0 ? act.fakeQuota : act.applyQuota,
    活动起始时间: dayjs(act.begin).format("YYYY-MM-DD HH:mm"),
    活动结束时间: dayjs(act.end).format("YYYY-MM-DD HH:mm"),
    报名截止时间: dayjs(act.signUpEnd).format("YYYY-MM-DD HH:mm"),
    活动类型: act.labels.map((label) => label.name).join(","),
    活动积分: act.points,
    活动介绍: act.introduction,
    ...act.extra,
  };

  const fieldIcons = {
    场地: "\uf450",
    位置: "\uf124",
    咨询电话: "\uf219",
    活动人数: "\uf415",
    报名人数: "\uf415",
    活动起始时间: "\ufa1a",
    活动结束时间: "\ufa1a",
    报名截止时间: "\ufa1a",
    活动类型: "\uf74a",
    活动积分: "\ue26b",
    活动介绍: "\uf67c",
  };
  const fields = [
    "场地",
    "位置",
    "咨询电话",
    "活动人数",
    "报名人数",
    "活动起始时间",
    "活动结束时间",
    "报名截止时间",
    "活动类型",
    "活动积分",
    "活动介绍",
    ...Object.keys(act.extra),
  ];

  return (
    <Large className={"flex flex-col pb-10"}>
      {showSignUp && (
        <SignUp
          id={query.id!}
          onFinish={() => {
            setShowSignUp(false);
            setTimeout(() => wx.navigateBack(), 2000);
          }}
        />
      )}
      <Image
        src={context.host + act.coverPicUrl}
        className="w-full "
        style={{ height: "60vw" }}
      />
      <View className="flex justify-around items-center text-base pt-2">
        <View
          className={`${!isShowPics ? "border-bottom-green" : ""}`}
          onClick={() => setIsShowPics(false)}
        >
          活动详情
        </View>
        <View
          className={`${isShowPics ? "border-bottom-green" : ""}`}
          onClick={() => setIsShowPics(true)}
        >
          图片集
        </View>
      </View>
      <View>
        {!isShowPics && (
          <View className="flex flex-col mx-3 my-5">
            {fields
              .filter(
                (name) =>
                  (fieldContents as any)[name] &&
                  ((fieldContents as any)[name] + "").length > 0
              )
              .map((name) => (
                <View
                  key={name}
                  className="flex  text-base leading-3 items-baseline font-light  "
                >
                  <View className="font-icon text-green-600 w-5 h-5">
                    {name in fieldIcons ? (fieldIcons as any)[name] : "\uf16e"}
                  </View>
                  <View className="flex-shrink-0 h-8">{name}: </View>
                  <View
                    className={`font-normal text-base ${
                      name === "咨询电话" ? "text-green-800" : ""
                    }`}
                  >
                    {(fieldContents as any)[name]}
                  </View>
                </View>
              ))}
            {signUpAt && (
              <View className="mt-2 flex flex-col rounded bg-gray-500 w-1-2 text-white self-center p-1 items-center justify-center">
                <View className="text-base">您已报名</View>
              </View>
            )}
            {!signUpAt && new Date() < new Date(act.signUpBegin) && (
              <View className="mt-2 flex flex-col rounded bg-gray-500 w-1-2 text-white self-center p-1 items-center justify-center">
                <View className="text-base">未开始报名</View>{" "}
                <View className="text-xs">报名日期: {reminds}</View>{" "}
              </View>
            )}
            {!signUpAt &&
              new Date() < new Date(act.signUpEnd) &&
              new Date() > new Date(act.signUpBegin) && (
                <View
                  className="mt-2  flex flex-col rounded bg-green-400 w-1-2 shadow-green text-white self-center p-1 items-center justify-center"
                  onClick={() => setShowSignUp(true)}
                >
                  <View className="text-base">立刻报名</View>{" "}
                  <View className="text-xs">截止日期: {reminds}</View>{" "}
                </View>
              )}
            {!signUpAt && new Date() > new Date(act.signUpEnd) && (
              <View className="mt-2 flex flex-col rounded bg-gray-500 w-1-2 text-white self-center p-1 items-center justify-center">
                <View className="text-base">报名已结束</View>{" "}
                <View className="text-xs">截止日期: {reminds}</View>{" "}
              </View>
            )}
          </View>
        )}
        {isShowPics && (
          <View className="flex-col flex justify-center items-center">
            {act.pictureUrls.map((url) => (
              <Image
                src={context.host + url}
                key={url}
                style={{ width: "80vw", height: "40vw" }}
              />
            ))}
          </View>
        )}
      </View>
    </Large>
  );
};

const SignUp = (props: { id: string; onFinish: () => void }) => {
  const { call } = useBackend();
  const [form, setForm] = useState({
    姓名: "",
    性别: "男",
    电话: "",
    微信号: "",
  });
  const onSignUpClick = async () => {
    try {
      await call(activity.SignUpService.SignUpActivity, {
        activityID: props.id,
        form: form,
      });
      await wx.showToast({
        title: `报名成功`,
        icon: "none",
      });
    } catch (e) {
      await wx.showToast({
        title: `报名失败 ${JSON.stringify(e)}`,
        icon: "none",
      });
    }
    props.onFinish();
  };

  return (
    <View
      className="fixed"
      style={{ height: "100vh", left: 0, right: 0, top: 0, zIndex: 100 }}
    >
      <View
        onClick={() => props.onFinish()}
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
        className="bg-white rounded-t-xl absolute text-base flex flex-col pt-10"
        style={{ zIndex: 200, bottom: 0, left: 0, right: 0, height: "50vh" }}
      >
        {Object.keys(form).map((key) => (
          <View className="flex mx-10 my-1 mb-1 p-1">
            <View className="text-base w-14">{key}</View>
            {key === "性别" ? (
              <View>
                <RadioGroup
                  onChange={(v) => setForm({ ...form, [key]: v.detail.value })}
                >
                  <Radio value={"男"}>男</Radio>
                  <Radio value={"女"}>女</Radio>
                </RadioGroup>
              </View>
            ) : (
              <Input
                className="flex-grow border-0 border-solid border-green-400 border-b-2"
                value={(form as any)[key]}
                onInput={(inp) => setForm({ ...form, [key]: inp.detail.value })}
              ></Input>
            )}
          </View>
        ))}

        <View
          className={`rounded p-3 bg-green-400 text-white w-24 self-center text-center mt-5`}
          onClick={onSignUpClick}
        >
          立刻报名
        </View>
      </View>
    </View>
  );
};

export default ActivityPage;
