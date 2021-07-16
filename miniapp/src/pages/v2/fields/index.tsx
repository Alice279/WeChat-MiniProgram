import { Image, View } from "remax/wechat";
import React, { useState } from "react";
import Large from "@/components/large";
import { useAsync } from "react-use";
import { useBackend, field, FieldOpenSlot } from "@/lib/backend";
import { formatTwoDigits } from "@/lib/common";
import dayjs from "dayjs";
export function displayFieldSlots(slots: FieldOpenSlot[]) {
  return slots
    .map(
      (slot) =>
        `${dayjs({ hour: slot.beginHour, minute: slot.beginMinute }).format(
          "HH:mm"
        )} ~ ${dayjs({ hour: slot.endHour, minute: slot.endMinute }).format(
          "HH:mm"
        )}`
      // `${formatTwoDigits(slot.beginHour)}:${formatTwoDigits(
      //   slot.beginMinute
      // )} ~ ${formatTwoDigits(slot.endHour)}:${formatTwoDigits(
      //   slot.endMinute
      // )}`
    )
    .join(" ");
}
const FieldsPage = () => {
  const { call, context } = useBackend();

  const [currentLabel, setCurrentLabel] = useState("");
  const state = useAsync(async () => {
    const { fields } = await call(field.FieldService.Query, {} as any);
    const labelsUnFlat =
      fields.map((info) => info.labels.map((label) => label.name)) || [];
    const labels: Array<string> = [
      "全部",
      ...Array.from(new Set([].concat.apply([], labelsUnFlat as any))),
    ];
    setCurrentLabel(labels[0]);
    return { fields, labels };
  });

  if (state.error) {
    console.error(state.error);
    wx.showModal({
      title: "发生了一些错误",
      content: JSON.stringify(state.error),
    });
  }
  wx.setNavigationBarTitle({
    title: "场地列表",
  });
  const fields = state.value ? state.value.fields : [];
  const labels = state.value ? state.value.labels : [];
  const currentLabelFields = () => {
    if (currentLabel === "全部") {
      return fields;
    } else {
      return fields.filter(
        (field) =>
          field.labels.filter((label) => label.name === currentLabel).length > 0
      );
    }
  };
  console.log(labels, currentLabel, fields, currentLabelFields());
  return (
    <Large className="flex flex-col bg-gray-100">
      <View className="flex bg-white overflow-x-scroll flex-nowrap py-1">
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
      <View style={{ minHeight: "100vh" }}>
        {currentLabelFields().map((field) => (
          <View className="mx-5 my-6 bg-white rounded">
            <Image
              src={context.host + field.coverPicUrl}
              className="w-full"
              style={{ height: "50vw" }}
            />
            <View className="px-2 py-1 flex">
              <View className="flex-grow">
                <View className={"text-base"}>{field.name}</View>
                <View className={"text-sm font-light"}>
                  位置：{field.address}
                </View>
                <View className={"text-sm font-light"}>
                  开放时间：{displayFieldSlots(field.openSlots)}
                </View>
                <View className={"text-sm font-light"}>
                  容纳人数：{field.capacity}
                </View>
              </View>
              <View className="w-1-4 flex flex-col items-center justify-center flex-shrink-0">
                <View
                  className="px-3 py-1 m-1 bg-green-400 text-white rounded text-base"
                  onClick={() => {
                    wx.navigateTo({
                      url: `/pages/v2/field/index?id=${field.id}`,
                    });
                  }}
                >
                  详情
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Large>
  );
};

export default FieldsPage;
