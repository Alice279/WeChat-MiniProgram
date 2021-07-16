import * as React from "react";
import { View } from "remax/wechat";
import classes from "./index.css";
import dayjs from "dayjs";
export interface Period {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface DayAvailableTime {
  availablePeriods: Period[];
  unavailablePeriods: Period[];
}

export interface TimePeriodSelectProps {
  className?: string;
  days: Record<string, DayAvailableTime>;
  onSelect?: (day: string) => void;
}

function range(size: number, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}
export function formatTwoDigits(digit: number) {
  return digit.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export function TimePeriodSelect(props: TimePeriodSelectProps) {
  let minHour = 24;
  const days = Object.keys(props.days)
    .map((day) => day.split("."))
    .sort(([a0, a1], [b0, b1]) => (a0 > b0 ? true : a1 > b1))
    .map(([a, b]) => `${a}.${b}`);
  console.log(days);
  for (const day of days) {
    console.log("aaa", day, props.days, props.days[`${day}`]);
    const hour = props.days[`${day}`].availablePeriods[0].startHour;
    if (hour < minHour) {
      minHour = hour;
    }
  }
  const leftOffset = `${4 - minHour * 4}rem`;

  function showPeriodModel(title: string, period: Period) {
    wx.showModal({
      title: title,
      content: `${dayjs({
        hour: period.startHour,
        minute: period.startMinute,
      }).format("HH:mm")} ~ ${dayjs({
        hour: period.endHour,
        minute: period.endMinute,
      }).format("HH:mm")}`,
      showCancel: false,
    });
  }
  console.log(leftOffset);

  return (
    <View
      className={`flex flex-col overflow-scroll relative bg-white ${props.className}`}
    >
      <View
        id="hour-header"
        className="sticky flex bg-white overflow-hidden"
        style={{ top: 0, zIndex: 100, width: `${4 * (22 - minHour)}rem` }}
      >
        <View
          className={`underline w-16 flex-shrink-0 text-center bg-white text-gray-800 ${classes.tableBorder} sticky`}
          style={{ left: 0, top: "0", zIndex: 1000 }}
        >
          日期
        </View>
        {range(24 - minHour, minHour).map((hour) => (
          <View
            key={hour}
            className={`${classes.tableBorder}  underline w-16 flex-shrink-0 text-center text-gray-800 h-6`}
          >
            {hour} 时
          </View>
        ))}
      </View>
      <View
        id="day-header"
        className="absolute flex flex-col sticky bg-white w-16"
        style={{ left: 0, top: "1.4rem", zIndex: 9 }}
      >
        {days.map((day) => (
          <View
            key={day}
            className={`${classes.tableBorder} w-16 flex-shrink-0 h-10 pl-2 flex items-center`}
          >
            <Radio />
            <View className="text-gray-800 w-8 text-center inline-block">
              {day}
            </View>
          </View>
        ))}
      </View>

      <View
        className="absolute"
        style={{ left: leftOffset, top: "1.4rem", zIndex: 8 }}
      >
        {days.map((day) => (
          <View className="w-full h-10 flex flex-col justify-center" key={day}>
            <View className="relative h-7">
              {props.days[`${day}`].availablePeriods.map((period, index) => {
                const start = period.startHour + period.startMinute / 60;
                const end = period.endHour + period.endMinute / 60;
                return (
                  <View
                    key={index}
                    className="absolute h-7 rounded bg-gray-200  border  box-border"
                    style={{
                      left: `${4 * start}rem`,
                      width: `${4 * (end - start)}rem`,
                    }}
                    onClick={() => showPeriodModel("可预约", period)}
                  ></View>
                );
              })}
              {props.days[`${day}`].unavailablePeriods.map((period, index) => {
                const start = period.startHour + period.startMinute / 60;
                const end = period.endHour + period.endMinute / 60;
                const showText = end - start > 0.5;
                return (
                  <View
                    key={index}
                    className={`${
                      showText
                        ? " text-center text-gray-100 p-1 overflow-hidden whitespace-nowrap text-sm "
                        : "h-7"
                    } absolute  rounded bg-gray-600  border  box-border`}
                    style={{
                      left: `${4 * start}rem`,
                      width: `${4 * (end - start)}rem`,
                    }}
                    onClick={() => showPeriodModel("已被预约", period)}
                  >
                    {showText && "已被预约"}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Radio(props: { selected?: boolean }) {
  return (
    <View className="rounded-full border-2 border-gray-600 border-solid w-4 h-4 items-center justify-center inline-flex">
      {props.selected && (
        <View className="rounded-full bg-gray-700 w-3 h-3"></View>
      )}
    </View>
  );
}

const PeriodSelectPage = () => {
  const data: TimePeriodSelectProps = {
    days: {
      "3": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 9, startMinute: 30, endHour: 16, endMinute: 30 },
        ],
      },
      "4": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 11, startMinute: 30, endHour: 16, endMinute: 30 },
        ],
      },
      "5": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 15, startMinute: 10, endHour: 16, endMinute: 30 },
        ],
      },
      "6": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 15, startMinute: 30, endHour: 16, endMinute: 30 },
        ],
      },
      "7": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 15, startMinute: 30, endHour: 16, endMinute: 0 },
        ],
      },
      "8": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 15, startMinute: 0, endHour: 17, endMinute: 30 },
        ],
      },
      "9": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 14, startMinute: 11, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 15, startMinute: 30, endHour: 16, endMinute: 30 },
        ],
      },
      "10": {
        availablePeriods: [
          { startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 },
          { startHour: 12, startMinute: 15, endHour: 18, endMinute: 30 },
        ],
        unavailablePeriods: [
          { startHour: 9, startMinute: 30, endHour: 10, endMinute: 30 },
          { startHour: 11, startMinute: 30, endHour: 16, endMinute: 30 },
        ],
      },
    },
  };
  return (
    <View className="h-screen bg-gray-300">
      <TimePeriodSelect days={data.days} className="h-1-4" />
    </View>
  );
};

export default PeriodSelectPage;
