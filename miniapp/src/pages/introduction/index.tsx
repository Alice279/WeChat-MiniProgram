import * as React from "react";
import { WebView } from "remax/one";
import { useBackend } from "@/lib/shared/backend";

const Index = () => {
  const backend = useBackend();
  return (
    <WebView src={new URL("../introduction", backend.context.prefix).href} />
  );
};

export default Index;
