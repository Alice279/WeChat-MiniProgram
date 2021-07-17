import React, { useRef, useState } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { join, useBackend } from "../../lib/shared/backend";
import { useAsync } from "react-use";
import { useRouter } from "next/router";
import Button from "@material-ui/core/Button";
import Editor from "../editor";
import { useSnackbar } from "material-ui-snackbar-provider";

export default function joinUs() {
  const [radioValue, setradioValue] = useState("0");
  const [nameValue, setnameValue] = useState("");
  const [existsJoin, setExistsJoin] = useState([]);
  const { call } = useBackend();
  const [editorValue, setEditorValue] = useState("");
  const editorRef = useRef();
  const router = useRouter();
  const snackbar = useSnackbar();
  useAsync(async () => {
    // @ts-ignore
    const data = await call(join.JoinUsService.JoinUsGet, {});
    setExistsJoin(data.content);
  }, []);
  const handleRadioChange = (a, b) => {
    setnameValue("");
    // @ts-ignore
    editorRef?.current?.setValue("");
    setradioValue(b);
  };

  const handleSelect = (a, b) => {
    setnameValue(a.target.value);
    existsJoin.map((item) => {
      if (item.name == a.target.value) {
        // @ts-ignore
        editorRef?.current?.setValue(item.content);
      }
    });
  };

  const submit = async () => {
    if (radioValue == "0") {
      try {
        const d = await call(join.JoinUsService.JoinUsUpdate, {
          name: nameValue,
          content: editorValue,
        });
        snackbar.showMessage("更新成功");
        router.back();
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    } else {
      try {
        const d = await call(join.JoinUsService.JoinUsCreate, {
          name: nameValue,
          content: editorValue,
        });
        snackbar.showMessage("创建成功");
        router.back();
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    }
  };
  return (
    <>
      <FormControl component="fieldset">
        <RadioGroup
          row
          aria-label="position"
          name="position"
          value={radioValue}
          onChange={handleRadioChange}
        >
          <FormControlLabel
            value="0"
            control={<Radio color="primary" />}
            label="更新现有招聘信息"
            labelPlacement="start"
          />
          <FormControlLabel
            value="1"
            control={<Radio color="primary" />}
            label="新建招聘信息"
            labelPlacement="start"
          />
        </RadioGroup>
      </FormControl>
      {radioValue == "0" ? (
        <div>
          <InputLabel id="demo-simple-select-label">
            请选择招聘信息地点
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={nameValue}
            onChange={handleSelect}
          >
            {existsJoin.map((item) => (
              <MenuItem value={item.name} key={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </div>
      ) : (
        <div>
          <TextField
            value={nameValue}
            onChange={(event) => setnameValue(event.target.value)}
            required
            id="filled-required"
            label="请输入名称"
          />
        </div>
      )}

      <Editor
        // @ts-ignore
        ref={editorRef}
        value={editorValue}
        onChange={(newValue) => {
          setEditorValue(newValue);
        }}
      />

      <Button onClick={submit} color="primary" variant="contained">
        提交
      </Button>
    </>
  );
}
