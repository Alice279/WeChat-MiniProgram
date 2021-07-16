import { getStorageSync, setStorageSync, View } from "remax/wechat";
import React from "react";

let _isLarge: boolean | null = null;
const IS_LARGE_KEY = "IS_LARGE";

export function isLarge(): boolean | null {
  if (_isLarge !== null) {
    return !!_isLarge;
  } else {
    const result = getStorageSync(IS_LARGE_KEY);
    _isLarge = result ? result === "true" : null;
    console.info("getStorageSync:IS_LARGE_KEY", result, "_isLarge", _isLarge);
    return _isLarge;
  }
}

export function setLarge(isLarge: boolean) {
  const result = setStorageSync(IS_LARGE_KEY, isLarge.toString());
  console.log("setIsLarge", isLarge);
  _isLarge = isLarge;
}

const Large: React.FC<{ className: string }> = (props) => {
  return (
    <View
      className={`bg-gray-100 ${props.className} ${isLarge() ? "large" : ""}`}
      style={{ minHeight: "100vh" }}
    >
      {props.children}
    </View>
  );
};
export default Large;
