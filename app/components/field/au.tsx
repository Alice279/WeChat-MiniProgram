import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { DropzoneArea } from "material-ui-dropzone";
import { Button, FormLabel } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAsync } from "react-use";
import { field, useBackend } from "../../lib/shared/backend";
import DynamicKV from "../dynamic_kv";
import { useSnackbar } from "material-ui-snackbar-provider";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "40ch",
  },
  buttonContainer: {
    width: "80%",
  },
  button: {
    float: "right",
  },
  input: {
    display: "none",
  },
  dropArea: {
    width: "80%",
    height: "250px",
    marginTop: "16px",
    marginBottom: "8px",
  },
  dropAreaImg: {
    width: "100%",
    height: "100%",
  },
  marginNormal: {
    marginTop: "16px",
    marginBottom: "8px",
  },
}));

export default function fieldAU() {
  const classes = useStyles();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    location: "",
    coverPicUrl: "",
    address: "",
    capacity: 0,
    description: "",
    contactInfo: "",
    pictureUrls: [],
    openSlotText: "8:00-12:00/14:00-18:00",
    labelsText: "场馆A/场馆B",
    labels: [],
    equipmentsText: "投影仪/灯光/音响/舞台",
    equipments: [],
    openSlots: [],
    extra: {},
  });
  const [uploadMulti, setUploadMulti] = useState(true);
  const { call } = useBackend();
  const { context } = useBackend();
  const snackbar = useSnackbar();
  const [dynamicKV, setDynamicKV] = useState([]);
  const padNumber = (num, fill) => {
    const len = ("" + num).length;
    return Array(fill > len ? fill - len + 1 || 0 : 0).join("0") + num;
  };
  // 进入页面时加载
  useAsync(async () => {
    if (router.query.id) {
      const d = await call(field.FieldService.QueryProfile, {
        // @ts-ignore
        fieldID: router.query.id,
      });
      const td = {
        name: d.field.name,
        location: d.field.location,
        address: d.field.address,
        capacity: d.field.capacity,
        description: d.fieldProfile.description,
        contactInfo: d.fieldProfile.contactInfo,
        openSlotText: "",
        labelsText: "",
        equipmentsText: "",
        coverPicUrl: d.field.coverPicUrl,
        openSlots: [],
        pictureUrls: d.fieldProfile.pictureUrls,
      };

      let equipments = "";
      d.field.equipments.map((item) => {
        equipments = equipments + item.name + "/";
      });
      td.equipmentsText = equipments.substr(0, equipments.length - 1);

      let labels = "";
      d.field.labels.map((item) => {
        labels = labels + item.name + "/";
      });
      td.labelsText = labels.substr(0, labels.length - 1);

      let openSlotText = "";
      d.field.openSlots.map((item) => {
        openSlotText =
          openSlotText +
          padNumber(item.beginHour, 2) +
          ":" +
          padNumber(item.beginMinute, 2) +
          "-" +
          padNumber(item.endHour, 2) +
          ":" +
          padNumber(item.endMinute, 2) +
          "/";
      });
      td.openSlotText = openSlotText.substr(0, openSlotText.length - 1);
      if (d.fieldProfile.extra) {
        const extra = [];
        // @ts-ignore
        for (const key in d.fieldProfile.extra) {
          extra.push({
            key: key,
            // @ts-ignore
            value: d.fieldProfile.extra[key],
          });
        }
        setDynamicKV(extra);
      }
      // @ts-ignore
      setForm(td);
      setUploadMulti(false);
    }
  });

  const submit = async () => {
    if (!form.openSlotText) {
      snackbar.showMessage("开放时间不能为空");
      return;
    }
    const f = form;
    f.equipments = form.equipmentsText.split("/");
    f.labels = form.labelsText.split("/");
    let timeVerify = true;
    const timeArray = f.openSlotText.split("/");
    if (timeArray.length == 0) {
      timeVerify = false;
    }
    for (const item of timeArray) {
      const [begin, end] = item.split("-");
      if (!begin || !end) {
        timeVerify = false;
        break;
      }
      const [beginHour, beginMinute] = begin.split(":");
      if (!begin || !end) {
        timeVerify = false;
        break;
      }
      const [endHour, endMinute] = end.split(":");
      if (!begin || !end) {
        timeVerify = false;
        break;
      }
      f.openSlots.push({
        beginHour: parseInt(beginHour),
        beginMinute: parseInt(beginMinute),
        endHour: parseInt(endHour),
        endMinute: parseInt(endMinute),
      });
    }
    if (!timeVerify) {
      snackbar.showMessage("场地开放时间不合法");
      return;
    }
    f.extra = Object.assign(
      {},
      ...dynamicKV.map((x) => ({ [x.key]: x.value }))
    );
    if (router.query.id) {
      try {
        await call(field.FieldService.Update, {
          ...f,
          // @ts-ignore
          id: router.query.id,
        });
        snackbar.showMessage("更新成功");
        router.back();
      } catch (e) {
        setForm({
          ...form,
          openSlots: [],
        });
        snackbar.showMessage(e.message);
      }
      return;
    }
    try {
      // @ts-ignore
      await call(field.FieldService.Create, { ...f });
      snackbar.showMessage("创建成功");
      router.back();
    } catch (e) {
      setForm({
        ...form,
        openSlots: [],
      });
      snackbar.showMessage(e.message);
    }
  };

  const handleUpload = async (a) => {
    if (a.length == 0) {
      return;
    }
    const { prefix } = context;
    const body = new FormData();
    body.set("file", a[0]);
    const resp = await fetch(`${prefix}upload`, {
      method: "POST",
      body: body,
    });

    if (!resp.ok) {
      const errMsg = `${resp.status}:${resp.statusText}`;
      snackbar.showMessage(errMsg);
      throw errMsg;
    }

    const data = await resp.json();
    if (data.ok) {
      setForm({ ...form, coverPicUrl: `/static/${data.data.fileName}` });
    }
  };

  const handleUploadMulti = async (a) => {
    if (a.length == 0) {
      return;
    }
    const { prefix } = context;
    const body = new FormData();
    body.set("file", a[a.length - 1]);
    const resp = await fetch(`${prefix}upload`, {
      method: "POST",
      body: body,
    });

    if (!resp.ok) {
      const errMsg = `${resp.status}:${resp.statusText}`;
      snackbar.showMessage(errMsg);
      throw errMsg;
    }

    const data = await resp.json();
    if (data.ok) {
      const tmp = form.pictureUrls;
      tmp.push(`/static/${data.data.fileName}`);
      setForm({ ...form, pictureUrls: tmp });
    }
  };

  return (
    <div className={classes.root}>
      <div>
        <form>
          <TextField
            required
            label="场地名称"
            id="margin-none"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
            }}
            className={classes.textField}
            margin="normal"
          />
          <TextField
            required
            label="场地位置"
            id="margin-dense"
            value={form.location}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, location: e.target.value });
            }}
            margin="normal"
          />
          <TextField
            required
            label="场地地址"
            id="margin-dense"
            value={form.address}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, address: e.target.value });
            }}
            // helperText="Some important text"
            margin="normal"
          />
          <TextField
            required
            label="场地容纳人数"
            id="margin-normal"
            type={"number"}
            value={form.capacity}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, capacity: parseInt(e.target.value) });
            }}
            // helperText="Some important text"
            margin="normal"
          />
          <FormLabel component="legend" className={classes.marginNormal}>
            上传封面图片
            {router.query.id && form.coverPicUrl && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setForm({ ...form, coverPicUrl: "" });
                }}
              >
                点击清空图片
              </Button>
            )}
          </FormLabel>
          <input
            accept="image/*"
            className={classes.input}
            id="contained-button-file"
            multiple
            type="file"
          />
          <div className={classes.dropArea}>
            {!form.coverPicUrl ? (
              <DropzoneArea
                // showPreviews={true}
                filesLimit={1}
                onChange={handleUpload}
                acceptedFiles={[
                  "image/png",
                  "image/gif",
                  "image/jpeg",
                  "image/bmp",
                  "image/x-icon",
                ]}
              />
            ) : (
              <img src={form.coverPicUrl} className={classes.dropAreaImg} />
            )}
          </div>
          <TextField
            required
            label="场地描述"
            id="margin-dense"
            value={form.description}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
            }}
            margin="normal"
          />
          <TextField
            required
            label="场地电话"
            id="margin-dense"
            value={form.contactInfo}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, contactInfo: e.target.value });
            }}
            margin="normal"
          />
          <FormLabel component="legend" className={classes.marginNormal}>
            动态字段
          </FormLabel>
          <DynamicKV
            value={dynamicKV}
            onChange={setDynamicKV}
            canModify={true}
          />
          <FormLabel component="legend" className={classes.marginNormal}>
            场地介绍图片(如没有请上传封面)
            {!uploadMulti && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setForm({ ...form, pictureUrls: [] });
                  setUploadMulti(true);
                }}
              >
                点击清空场地介绍图片
              </Button>
            )}
          </FormLabel>
          <input
            accept="image/*"
            className={classes.input}
            id="contained-button-file"
            multiple
            type="file"
          />
          {uploadMulti ? (
            <div className={classes.dropArea}>
              <DropzoneArea
                filesLimit={3}
                onChange={handleUploadMulti}
                acceptedFiles={[
                  "image/png",
                  "image/gif",
                  "image/jpeg",
                  "image/bmp",
                  "image/x-icon",
                ]}
              />
            </div>
          ) : (
            <div>
              {form.pictureUrls.map((item, index) => (
                <div className={classes.dropArea} key={index}>
                  <img src={item} className={classes.dropAreaImg} />
                </div>
              ))}
            </div>
          )}
          <TextField
            required
            label="场地标签"
            id="margin-dense"
            value={form.labelsText}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, labelsText: e.target.value });
            }}
            helperText="请输入场地标签，'/'分割，如: 青年场馆/老年场馆"
            margin="normal"
          />
          <TextField
            required
            label="场地开放时间"
            id="margin-dense"
            value={form.openSlotText}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, openSlotText: e.target.value });
            }}
            helperText="请输入开放时间段，'/'分割，保证时间段有序不重叠，如: 8:00-12:00/14:00-18:00"
            margin="normal"
          />
          <TextField
            required
            label="场地设备"
            id="margin-dense"
            value={form.equipmentsText}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, equipmentsText: e.target.value });
            }}
            helperText="请输入场地设备，'/'分割，如: 投影仪/灯光/音响/舞台"
            margin="normal"
          />
        </form>
      </div>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={submit}
          className={classes.button}
          style={{ marginTop: "20px" }}
        >
          提交
        </Button>
      </div>
    </div>
  );
}
