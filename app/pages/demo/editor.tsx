import * as React from "react";
import { useEffect, useState } from "react";
import Editor from "../../components/editor";

const EditorDemo = function () {
  const [value, setValue] = useState("");
  useEffect(() => {
    console.log(value);
  }, [value]);
  return (
    <>
      <Editor value={value} onChange={setValue} />
    </>
  );
};

export default EditorDemo;
