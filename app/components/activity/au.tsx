import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { Button, FormLabel } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAsync } from "react-use";
import { activity, useBackend } from "../../lib/shared/backend";
import { DropzoneArea } from "material-ui-dropzone";
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

export default function activitySignUp() {
  const classes = useStyles();
  const router = useRouter();
  const [uploadMulti, setUploadMulti] = useState(true);
  const [form, setForm] = useState({
    title: "",
    field: "",
    location: "",
    coverPicUrl: "",
    points: 0,
    totalQuota: 0,
    fakeQuota: 0,
    applyQuota: 0,
    begin: "",
    end: "",
    signUpBegin: "",
    signUpEnd: "",
    labels: [],
    sponsor: "",
    origanizerNumber: "",
    introduction: "",
    pictureUrls: [],
    extra: [],
    labelsText: "",
  });
  const snackbar = useSnackbar();
  const { call } = useBackend();
  const { context } = useBackend();
  const [dynamicKV, setDynamicKV] = useState([]);
  // @ts-ignore
  Date.prototype.format = function (fmt) {
    const o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      S: this.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (const k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  };

  const convert = (d) => {
    // @ts-ignore
    const t = new Date(d).format("yyyy-MM-ddThh:mm");
    return t;
  };
  useAsync(async () => {
    if (router.query.id) {
      try {
        const d = await call(activity.ActivityService.GetActivityDetail, {
          id: router.query.id,
        });
        const td = d.activity;
        td.signUpBegin = convert(d.activity.signUpBegin);
        td.signUpEnd = convert(d.activity.signUpEnd);
        td.begin = convert(d.activity.begin);
        td.end = convert(d.activity.end);
        const extra = [];
        // @ts-ignore
        for (const key in d.activity.extra) {
          extra.push({
            key: key,
            // @ts-ignore
            value: d.activity.extra[key],
          });
        }
        setDynamicKV(extra);
        // @ts-ignore
        let labelsText = "";
        d.activity.labels.map((item) => {
          labelsText = labelsText + item.name + "/";
        });
        td.labelsText = labelsText.slice(0, labelsText.length - 1);
        setUploadMulti(false);
        setForm(td);
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    }
  });
  const translate = (date) => {
    const t = new Date(date);
    // const t_s = t.getTime();
    // t.setTime(t_s - 28800000);
    return t.toJSON();
  };
  const submit = async () => {
    const f = form;
    f.begin = translate(form.begin);
    f.end = translate(form.end);
    f.signUpEnd = translate(form.signUpEnd);
    f.signUpBegin = translate(form.signUpBegin);
    f.extra = Object.assign(
      {},
      ...dynamicKV.map((x) => ({ [x.key]: x.value }))
    );
    f.labels = [];
    const labels = form.labelsText.split("/");
    labels.map((item) => {
      f.labels.push({
        name: item,
      });
    });
    if (router.query.id) {
      try {
        await call(activity.ActivityService.UpdateActivityByID, {
          // @ts-ignore
          id: router.query.id,
          // @ts-ignore
          activity: { ...f },
        });
        snackbar.showMessage("更新成功");
        router.push("/main/activity/index");
      } catch (e) {
        snackbar.showMessage(e.message);
      }
      return;
    }
    try {
      await call(activity.ActivityService.AddActivity, { activity: { ...f } });
      snackbar.showMessage("添加成功");
      router.push("/main/activity/index");
    } catch (e) {
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
            label="活动名称"
            id="margin-none"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
            }}
            className={classes.textField}
            margin="normal"
          />
          <TextField
            required
            label="活动场地"
            id="margin-dense"
            value={form.field}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, field: e.target.value });
            }}
            margin="normal"
          />
          <TextField
            required
            label="活动地点"
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
            label="活动人数"
            id="margin-normal"
            type={"number"}
            value={form.totalQuota}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, totalQuota: parseInt(e.target.value) });
            }}
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
            id="datetime-local"
            label="活动开始时间"
            type="datetime-local"
            value={form.begin}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, begin: e.target.value });
            }}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            required
            id="datetime-local"
            label="活动结束时间"
            type="datetime-local"
            value={form.end}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, end: e.target.value });
            }}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            required
            id="datetime-local"
            label="报名开始时间"
            type="datetime-local"
            value={form.signUpBegin}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, signUpBegin: e.target.value });
            }}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            required
            id="datetime-local"
            label="报名结束时间"
            type="datetime-local"
            value={form.signUpEnd}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, signUpEnd: e.target.value });
            }}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            required
            label="活动标签"
            id="margin-dense"
            value={form.labelsText}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, labelsText: e.target.value });
            }}
            helperText="请输入活动标签，'/'分割，如: 亲子/少儿"
            margin="normal"
          />
          <TextField
            required
            label="赞助商"
            id="margin-dense"
            value={form.sponsor}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, sponsor: e.target.value });
            }}
            margin="normal"
          />
          <TextField
            required
            label="主办方电话"
            id="margin-dense"
            value={form.origanizerNumber}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, origanizerNumber: e.target.value });
            }}
            margin="normal"
          />
          <TextField
            required
            label="活动介绍"
            id="margin-dense"
            value={form.introduction}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, introduction: e.target.value });
            }}
            multiline
            margin="normal"
          />
          <TextField
            required
            label="虚拟人数"
            id="margin-normal"
            type={"number"}
            value={form.fakeQuota}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, fakeQuota: parseInt(e.target.value) });
            }}
            helperText="0代表使用真实人数"
            margin="normal"
          />
          <TextField
            required
            label="活动积分"
            id="margin-normal"
            type={"number"}
            value={form.points}
            className={classes.textField}
            onChange={(e) => {
              setForm({ ...form, points: parseInt(e.target.value) });
            }}
            margin="normal"
          />
          <FormLabel component="legend" className={classes.marginNormal}>
            上传活动介绍图片(如没有请上传封面)
            {router.query.id && form.pictureUrls.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setForm({ ...form, pictureUrls: [] });
                  setUploadMulti(true);
                }}
              >
                点击清空活动介绍图片
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
          <DynamicKV
            value={dynamicKV}
            onChange={setDynamicKV}
            canModify={true}
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
