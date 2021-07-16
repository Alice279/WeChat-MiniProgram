import { WebView } from "remax/wechat";
import { useQuery } from "remax";
import { useBackend } from "@/lib/shared/backend";
import React from "react";
const WebviewPage = () => {
  const query = useQuery();
  const { context } = useBackend();
  let url = context.host! + query.url;
  url = decodeURIComponent(url);
  console.info("[webview] url = ", url);
  return <WebView src={url} />;
};

export default WebviewPage;
