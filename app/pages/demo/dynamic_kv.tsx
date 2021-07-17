import * as React from "react";
import { useEffect, useState } from "react";
import DynamicKV from "../../components/dynamic_kv";
import { Button } from "@material-ui/core";

const DynamicKVDemo = function () {
  const [value, setValue] = useState([
    {
      key: "key1",
      value: "value1",
    },
    {
      key: "key2",
      value: "value2",
    },
  ]);

  return (
    <>
      <DynamicKV value={value} onChange={setValue} />
      <Button
        onClick={() => {
          console.log(value);
        }}
      >
        aaa
      </Button>
    </>
  );
};

export default DynamicKVDemo;
