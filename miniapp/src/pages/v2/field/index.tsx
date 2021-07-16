import * as React from "react";
import { useState } from "react";
import { Image, View } from "remax/wechat";
import { useQuery } from "remax";
// import activityStyles from "../activity/activity.css";
// import singleFieldStyle from "./field.css";
import {
  field as fieldBackend,
  FieldQueryOrdersRes,
  FieldQueryProfileRes,
  OpenSlot,
  useBackend,
} from "../../../lib/backend";
import { useAsync } from "react-use";
import Large from "@/components/large";
import dayjs from "dayjs";
import { DayAvailableTime, TimePeriodSelect } from "@/pages/period-select";

function formatTwoDigits(digit: number) {
  return digit.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

const Index = () => {
  const { call, context } = useBackend();
  const query = useQuery();
  if (!query.id) {
    wx.navigateBack();
  }
  wx.setNavigationBarTitle({
    title: "场地详情",
  });
  const state = useAsync(async () => {
    const data = await call(fieldBackend.FieldService.QueryProfile, {
      fieldID: query.id!,
    });
    return data;
  });
  const periodState = useAsync(async () => {
    if (state.value) {
      const data = await call(fieldBackend.FieldService.QueryOrders, {
        filters: {
          fieldID: query.id!,
          isVerifiedEq: true,
          beginTime: dayjs().subtract(1, "day").toDate(),
          endTime: dayjs().add(8, "day").toDate(),
        },
        pagination: {},
      });
      const days = convert(7, state.value!.field.openSlots, data);
      console.log("days", days);
      return days;
    }
    return {};
  }, [state]);
  const [isShowPics, setIsShowPics] = useState(false);

  if (state.loading) {
    return <View>loading</View>;
  }
  if (state.error) {
    return <View>{JSON.stringify(state.error)}</View>;
  }
  const { field, fieldProfile: profile } = state.value as FieldQueryProfileRes;

  const fieldContents = {
    场地: field.location,
    位置: field.address,
    容纳人数: field.capacity,
    标签: field.labels.map((label) => label.name).join(","),
    "微信号(点击复制)": profile.contactWechat,
    开放时间: field.openSlots
      .map(
        (slot) =>
          `${dayjs({
            hour: slot.beginHour,
            minute: slot.beginMinute,
          }).format("HH:mm")} ~ ${dayjs({
            hour: slot.endHour,
            minute: slot.endMinute,
          }).format("HH:mm")}`
      )
      .join(";"),
    ...profile.extra,
  };

  const fieldIcons = {
    场地: "\uf450",
    位置: "\uf124",
    容纳人数: "\uf415",
    标签: "\uf74a",
    开放时间: "\ufa1a",
    "微信号(点击复制)": "\uf1d7",
  };
  const fields = [
    "场地",
    "位置",
    "容纳人数",
    "标签",
    "开放时间",
    ...Object.keys(profile.extra),
  ];

  return (
    <Large className={"flex flex-col"}>
      <Image
        src={context.host + field.coverPicUrl}
        className="w-full"
        style={{ height: "60vw" }}
      />
      <View className="flex justify-around items-center text-base pt-2">
        <View
          className={`${!isShowPics ? "border-bottom-green" : ""}`}
          onClick={() => setIsShowPics(false)}
        >
          场地详情
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
          <View className="flex flex-col mt-5 mx-3">
            {fields
              .filter(
                (name) =>
                  (fieldContents as any)[name] &&
                  ((fieldContents as any)[name] + "").length > 0
              )
              .map((name) => (
                <View
                  onClick={() => {
                    wx.setClipboardData({ data: (fieldContents as any)[name] });
                    wx.showToast({ title: "复制成功" });
                  }}
                  key={name}
                  className="flex  text-base leading-3 items-baseline font-light"
                >
                  <View className="font-icon text-green-600 w-5 h-5">
                    {name in fieldIcons ? (fieldIcons as any)[name] : "\uf16e"}
                  </View>
                  <View className="h-8 flex-shrink-0">{name}: </View>
                  <View className="font-normal text-base">
                    {(fieldContents as any)[name]}
                  </View>
                </View>
              ))}
            <View className="flex items-baseline mb-2">
              <View className="font-icon text-green-600 w-5 h-5">
                {"\uf9ea"}
              </View>
              <View className="text-base font-light">场地预约表 </View>
            </View>
            {periodState.value && <TimePeriodSelect days={periodState.value} />}
            <View
              className="mt-3 mb-5 flex flex-col rounded bg-green-400 w-1-2 shadow-green text-white self-center p-1 items-center justify-center"
              onClick={async () => {
                // const result = await wx.showModal({
                //   title: "联系方式",
                //   content: profile.contactInfo,
                //   cancelText: "复制",
                //   confirmText: "拨打",
                // });
                // if (result.confirm) {
                wx.makePhoneCall({ phoneNumber: profile.contactInfo });
                // }
                // if (result.cancel) {
                //   wx.setClipboardData({ data: profile.contactInfo });
                // }
              }}
            >
              <View className="text-base">立即预约</View>{" "}
            </View>
          </View>
        )}
        {isShowPics && (
          <View className="flex-col flex justify-center items-center mt-5">
            {profile.pictureUrls.map((url) => (
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

  // return (
  //   <View className="h-screen px-5">
  //     <View className="text-lg pb-2">{field.name}</View>
  //     <View className="text-xs pb-3">{profile.description}</View>
  //     <View className="">
  //       {profile.pictureUrls.length > 0 && (
  //         <Image
  //           className="h-full w-32 shadow-2xl rounded-md"
  //           src={profile.pictureUrls[0]}
  //         />
  //       )}
  //       <View className="flex text-xs h-full justify-center items-center pl-6">
  //         <View>
  //           <View className="py-1">
  //             开放时间:{" "}
  //             {}
  //           </View>
  //           <View className="py-1">地点: {field.address}</View>
  //           <View className="py-1">
  //             类别: {field.labels.map((label) => `${label.name}`).join(" ")}
  //           </View>
  //           <View className="py-1">容纳人数: {field.capacity}人</View>
  //           <View className="py-1">主办方: {[profile.contactInfo]}</View>
  //         </View>
  //       </View>
  //     </View>
  //     <View className="text-lg pb-2">设备</View>
  //     <View className="flex justify-around h-16 pb-3">
  //       {field.equipments.map((equi) => (
  //         <View
  //           className="flex-col justify-center items-center text-center"
  //           key={equi.id}
  //         >
  //           <View>
  //             <Image className="h-12 w-12" src={equi.iconPicUrl} />
  //           </View>
  //           <View className="text-xs">{equi.name}</View>
  //         </View>
  //       ))}
  //     </View>
  //     {profile.pictureUrls.length > 1 && (
  //       <>
  //         <View className="text-sm pb-2">更多图片:</View>
  //         <View className="flex justify-center items-center w-full">
  //           <View className="flex-col">
  //             {profile.pictureUrls.slice(1).map((item) => (
  //               <View className="pb-3" key={item}>
  //                 <Image className={`${"rounded-md shadow-md"} `} src={item} />
  //               </View>
  //             ))}
  //           </View>
  //         </View>
  //       </>
  //     )}
  //
  //     <View
  //       className={`${"h-10 flex justify-around items-center rounded-2xl text-lg text-white"} `}
  //     >
  //       <Image className="h-10 w-10" src={"/icons/lights.png"} />
  //       <View>预约热线</View>
  //       <View>|</View>
  //       <View>立刻预约</View>
  //     </View>
  //   </View>
  // );
};

function convert(
  daylen: number,
  openSlots: OpenSlot[],
  orders: FieldQueryOrdersRes
): Record<string, DayAvailableTime> {
  const now = dayjs(new Date());
  let days: Record<string, DayAvailableTime> = {};
  console.log("orders", orders);
  for (let i = 0; i < daylen; i++) {
    const d = now.add(i, "day");
    days[`${d.month() + 1}.${d.date()}`] = {
      availablePeriods: openSlots.map((slot) => ({
        startHour: slot.beginHour,
        endHour: slot.endHour,
        startMinute: slot.beginMinute,
        endMinute: slot.endMinute,
      })),
      unavailablePeriods: orders.fieldOrders
        .filter((order) => {
          const dd = dayjs(order.beginTime);
          console.log(123, dd.date(), d.date(), dd.month(), d.month());
          return dd.date() === d.date() && dd.month() === d.month();
        })
        .map((order) => {
          const start = dayjs(order.beginTime);
          const end = dayjs(order.endTime);
          return {
            startHour: start.hour(),
            endHour: end.hour(),
            startMinute: start.minute(),
            endMinute: end.minute(),
          };
        }),
    };
  }
  return days;
}

export default Index;
