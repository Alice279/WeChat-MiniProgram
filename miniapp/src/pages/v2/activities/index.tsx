import React, { useState } from "react";
import Large from "@/components/large";
import { useAsync } from "react-use";
import { activity, useBackend } from "@/lib/backend";
import { getLocation } from "@/lib/location";
import { frontierItems } from "@/lib/common";
import { View, Image } from "remax/wechat";
import dayjs from "dayjs";
import { TabBar } from "@/pages/v2/index";
const ActivitiesPage = () => {
  const { call, context } = useBackend();
  wx.setNavigationBarTitle({
    title: "近期活动",
  });
  const state = useAsync(async () => {
    const current = new Date();
    const recent = await call(activity.ActivityService.ActivityList, {
      begin: current,
    } as any);
    const old = await call(activity.ActivityService.ActivityList, {
      end: current,
    } as any);

    const location = await getLocation();
    console.log(
      "ActivitiesPage",
      "location",
      location,
      "recent",
      recent.activities,
      "old",
      old.activities
    );
    return [
      ...frontierItems(
        recent.activities || [],
        (item) => item.location === location
      ),
      ...frontierItems(
        old.activities || [],
        (item) => item.location === location
      ),
    ];
  });

  if (state.error) {
    console.error(state.error);
    wx.showModal({
      title: "发生了一些错误",
      content: JSON.stringify(state.error),
    });
  }

  console.log(state.value);

  const acts = state.value || [];
  //
  const labelsUnFlat =
    acts.map((info) => info.labels.map((label) => label.name)) || [];
  const labels: Array<string> = [
    "全部",
    ...Array.from(new Set([].concat.apply([], labelsUnFlat as any))),
  ];
  const [currentLabel, setCurrentLabel] = useState(labels[0]);

  const currentLabelActs = () => {
    if (currentLabel === "全部") {
      return acts;
    } else {
      return acts.filter(
        (act) =>
          act.labels.filter((label) => label.name === currentLabel).length > 0
      );
    }
  };

  return (
    <Large className="flex flex-col bg-gray-100">
      <View className="flex bg-white flex-nowrap overflow-x-scroll py-1">
        {labels.map((label) => (
          <View
            key={label}
            className={`px-1 m-1 text-sm font-light whitespace-nowrap ${
              currentLabel === label ? "font-normal" : ""
            }`}
            style={{
              borderBottom:
                currentLabel === label ? "4px solid rgb(4,211,105)" : "",
            }}
            onClick={() => setCurrentLabel(label)}
          >
            {label}
          </View>
        ))}
      </View>
      <View style={{ minHeight: "100vh", marginBottom: "20vw" }}>
        {currentLabelActs().map((act) => (
          <View className="mx-5 my-6 bg-white rounded">
            <Image
              src={context.host + act.coverPicUrl}
              className="w-full"
              style={{ height: "50vw" }}
            />
            <View className="px-2 py-1 flex">
              <View className="flex-grow">
                <View className={"text-base"}>{act.title}</View>
                <View className={"text-sm font-light"}>位置：{act.field}</View>
                <View className={"text-sm font-light"}>
                  活动时间：{dayjs(act.begin).format("YYYY-MM-DD HH:mm")} -{" "}
                  {dayjs(act.end).format("HH:mm")}
                </View>
                <View className={"text-sm font-light"}>
                  报名人数：{act.fakeQuota > 0 ? act.fakeQuota : act.applyQuota}{" "}
                  / {act.totalQuota}
                </View>
              </View>
              <View className="w-1-5 flex flex-col items-center justify-center flex-shrink-0">
                <View
                  className="px-3 py-1 m-1 bg-green-400 text-white rounded text-base"
                  onClick={() => {
                    wx.navigateTo({
                      url: `/pages/v2/activity/index?id=${act.id}`,
                    });
                  }}
                >
                  立即报名
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
      <TabBar selected={"list"} />
    </Large>
  );
};

export default ActivitiesPage;
