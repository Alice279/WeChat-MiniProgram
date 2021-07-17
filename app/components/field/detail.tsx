import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { Button, FormLabel } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAsync } from "react-use";
import { field, useBackend } from "../../lib/shared/backend";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DataGrid, GridColDef } from "@material-ui/data-grid";
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
  dropAreaImg: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    width: "90%",
    marginTop: "10px",
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
    marginTop: "8px",
    marginBottom: "20px",
  },
  marginNormal: {
    marginTop: "16px",
    marginBottom: "8px",
  },
}));

export default function fieldDetail() {
  const classes = useStyles();
  const router = useRouter();
  const snackbar = useSnackbar();
  const [form, setForm] = useState({
    name: "",
    location: "",
    coverPicUrl: "",
    address: "",
    capacity: 0,
    description: "",
    contactInfo: "",
    pictureUrls: [],
    openSlotText: "",
    labelsText: "",
    labels: [],
    equipmentsText: "",
    equipments: [],
    openSlot: [],
  });
  const { call } = useBackend();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [unVerifyField, setUnVerifyField] = React.useState([]);
  const [verifyField, setVerifyField] = React.useState({
    fieldOrders: [],
    pagination: {
      totalNum: 0,
    },
  });
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
  const nowTimeComponent = () => {
    // @ts-ignore
    const t = new Date().format("yyyy-MM-ddThh:mm");
    return t;
  };
  const endTimeComponent = () => {
    const t = new Date();
    const t_s = t.getTime();
    t.setTime(t_s + 604800000);
    return convert(t);
  };
  const convertGreenwich = (date) => {
    const t = new Date(date);
    // convert to Greenwich
    // const t_s = t.getTime();
    // t.setTime(t_s - 28800000);
    return t.toJSON();
  };
  const [verifyBegin, setVerifyBegin] = React.useState(nowTimeComponent());
  const [verifyEnd, setVerifyEnd] = React.useState(endTimeComponent());
  const [unVerifyBegin, setUnVerifyBegin] = React.useState(nowTimeComponent());
  const [unVerifyEnd, setUnVerifyEnd] = React.useState(endTimeComponent());
  const [verifyPage, setVerifyPage] = React.useState(0);
  const [unVerifyPage, setUnVerifyPage] = React.useState(0);
  const pageSize = 10;
  const [dynamicKV, setDynamicKV] = useState([]);

  const fieldVerify: GridColDef[] = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "name", headerName: "预约名称", width: 150 },
    { field: "comment", headerName: "预约备注", width: 150 },
    {
      field: "beginTime",
      headerName: "预约开始时间",
      width: 180,
      renderCell: (params) => {
        return <div>{params.row && params.row.beginTime.slice(0, 19)}</div>;
      },
    },
    {
      field: "endTime",
      headerName: "预约结束时间",
      width: 180,
      renderCell: (params) => {
        return <div>{params.row && params.row.endTime.slice(0, 19)}</div>;
      },
    },
    {
      field: "delete",
      headerName: "删除预约",
      width: 150,
      renderCell: (params) => {
        return (
          <div>
            <Button
              onClick={async () => {
                try {
                  await call(field.FieldService.DeleteOrder, {
                    fieldID: router.query.id,
                    orderID: params.id,
                  });
                  queryVerify();
                  snackbar.showMessage("删除成功");
                } catch (e) {
                  snackbar.showMessage(e.message);
                }
              }}
            >
              删除
            </Button>
          </div>
        );
      },
    },
  ];
  const fieldUnVerify: GridColDef[] = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "name", headerName: "预约名称", width: 150 },
    { field: "comment", headerName: "预约备注", width: 150 },
    { field: "beginTime", headerName: "预约开始时间", width: 150 },
    { field: "endTime", headerName: "预约创建时间", width: 150 },
    {
      field: "verify",
      headerName: "审核详情",
      width: 150,
      renderCell: (params) => {
        return (
          <div>
            <Button
              onClick={async () => {
                try {
                  await call(field.FieldService.VerifyOrder, {
                    fieldID: router.query.id,
                    orderID: params.id,
                  });
                  queryVerify();
                  // queryUnVerify();
                  snackbar.showMessage("审核通过");
                } catch (e) {
                  snackbar.showMessage(e.message);
                }
              }}
            >
              通过
            </Button>
            <Button
              onClick={async () => {
                try {
                  await call(field.FieldService.RejectOrder, {
                    fieldID: router.query.id,
                    orderID: params.id,
                    reason: "",
                  });
                  queryVerify();
                  // queryUnVerify();
                  snackbar.showMessage("审核未通过");
                } catch (e) {
                  snackbar.showMessage(e.message);
                }
              }}
            >
              拒绝
            </Button>
          </div>
        );
      },
    },
  ];

  const loading = false;
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
        coverPicUrl: d.field.coverPicUrl,
        address: d.field.address,
        capacity: d.field.capacity,
        description: d.fieldProfile.description,
        contactInfo: d.fieldProfile.contactInfo,
        pictureUrls: d.fieldProfile.pictureUrls,
        openSlotText: "",
        labelsText: "",
        equipmentsText: "",
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
    } else {
      snackbar.showMessage("Invalid ID");
      setTimeout(() => {
        router.push("index");
      }, 2000);
    }
  });
  useAsync(async () => {
    if (router.query.id) {
      try {
        queryVerify();
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    }
  });

  // useAsync(async () => {
  //   if (router.query.id) {
  //     try {
  //       queryUnVerify();
  //     } catch (e) {
  //       snackbar.showMessage(e.message);
  //     }
  //   }
  // });

  const handleUpdate = () => {
    if (router.query.id) {
      router.push("au?id=" + router.query.id);
    }
  };

  const handleClose = () => {
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    try {
      await call(field.FieldService.Delete, {
        fieldID: router.query.id,
      });
      snackbar.showMessage("删除成功");
      router.push("index");
    } catch (e) {
      snackbar.showMessage(e.message);
      setDeleteOpen(false);
    }
  };
  const queryOrders = (isVerify, pageNum) => {
    return call(field.FieldService.QueryOrders, {
      filters: {
        // @ts-ignore
        fieldID: router.query.id,
        isVerifiedEq: isVerify,
        // @ts-ignore
        beginTime: convertGreenwich(verifyBegin),
        // @ts-ignore
        endTime: convertGreenwich(verifyEnd),
      },
      pagination: {
        pageNum: pageNum + 1,
        pageSize: pageSize,
      },
    });
  };
  const queryVerify = async (pageNum?: number) => {
    if (!pageNum) {
      pageNum = 0;
      setVerifyPage(0);
    }
    const d = await queryOrders(true, pageNum);
    setVerifyField(d);
  };

  const queryUnVerify = async (pageNum?: number) => {
    if (!pageNum) {
      pageNum = 0;
      setUnVerifyPage(0);
    }
    const d = await queryOrders(false, pageNum);
    setUnVerifyField(d.fieldOrders);
  };
  return (
    <div className={classes.root}>
      <Dialog
        open={deleteOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"是否确定删除该场地"}
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            取消
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          // color="secondary"
          onClick={() => {
            setDeleteOpen(true);
          }}
          className={classes.button}
        >
          删除场地
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          className={classes.button}
          style={{ marginRight: "10px" }}
        >
          修改场地
        </Button>
        <Button
          className={classes.button}
          style={{ marginRight: "10px" }}
          variant="contained"
          color="primary"
          href={`/main/field/appointment?id=${router.query.id}`}
        >
          新建场地预约
        </Button>
      </div>
      <div>
        <TextField
          disabled={true}
          required
          label="场地名称"
          id="margin-none"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
          }}
          className={classes.textField}
          margin="normal"
          // helperText="Some important text"
        />
        <TextField
          disabled={true}
          required
          label="场地位置"
          id="margin-dense"
          value={form.location}
          className={classes.textField}
          onChange={(e) => {
            setForm({ ...form, location: e.target.value });
          }}
          // helperText="Some important text"
          margin="normal"
        />
        <TextField
          disabled={true}
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
          disabled={true}
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
          封面图片
        </FormLabel>
        <div className={classes.dropArea}>
          <img src={form.coverPicUrl} className={classes.dropAreaImg} />
        </div>
        <TextField
          disabled={true}
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
          disabled={true}
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
        <TextField
          disabled={true}
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
          disabled={true}
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
          disabled={true}
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
        <FormLabel component="legend" className={classes.marginNormal}>
          动态字段
        </FormLabel>
        <DynamicKV value={dynamicKV} onChange={setDynamicKV} />
        <FormLabel component="legend" className={classes.marginNormal}>
          场地介绍图片
        </FormLabel>
        {form.pictureUrls.map((item) => (
          <div className={classes.dropArea}>
            <img src={item} className={classes.dropAreaImg} />
          </div>
        ))}
      </div>

      <FormLabel
        component="legend"
        className={classes.marginNormal}
        style={{ width: "100%" }}
      >
        审核通过场地预约
      </FormLabel>
      <TextField
        required
        id="datetime-local"
        label="开始时间"
        type="datetime-local"
        value={verifyBegin}
        className={classes.textField}
        onChange={(e) => {
          setVerifyBegin(e.target.value);
        }}
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        required
        id="datetime-local"
        label="结束时间"
        type="datetime-local"
        value={verifyEnd}
        className={classes.textField}
        onChange={(e) => {
          setVerifyEnd(e.target.value);
        }}
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => queryVerify()}
        className={classes.button}
        style={{ height: "36px", marginTop: "24px" }}
      >
        查询
      </Button>
      <div style={{ width: "100%", height: "300px" }}>
        {!loading && (
          <DataGrid
            columns={fieldVerify}
            rows={verifyField.fieldOrders}
            rowCount={
              verifyField && verifyField.pagination
                ? verifyField.pagination.totalNum
                : 0
            }
            pagination
            pageSize={pageSize}
            paginationMode="server"
            page={verifyPage}
            onPageChange={(params) => {
              setVerifyPage(params.page);
              queryVerify(params.page);
            }}
          />
        )}
      </div>

      {/*<FormLabel*/}
      {/*    component="legend"*/}
      {/*    className={classes.marginNormal}*/}
      {/*    style={{width: "100%"}}*/}
      {/*>*/}
      {/*    待审核场地预约*/}
      {/*</FormLabel>*/}
      {/*<TextField*/}
      {/*    required*/}
      {/*    id="datetime-local"*/}
      {/*    label="开始时间"*/}
      {/*    type="datetime-local"*/}
      {/*    value={unVerifyBegin}*/}
      {/*    className={classes.textField}*/}
      {/*    onChange={(e) => {*/}
      {/*        console.log(e.target.value);*/}
      {/*        setUnVerifyBegin(e.target.value);*/}
      {/*    }}*/}
      {/*    margin="normal"*/}
      {/*    InputLabelProps={{*/}
      {/*        shrink: true,*/}
      {/*    }}*/}
      {/*/>*/}
      {/*<TextField*/}
      {/*    required*/}
      {/*    id="datetime-local"*/}
      {/*    label="结束时间"*/}
      {/*    type="datetime-local"*/}
      {/*    value={unVerifyEnd}*/}
      {/*    className={classes.textField}*/}
      {/*    onChange={(e) => {*/}
      {/*        setUnVerifyEnd(e.target.value);*/}
      {/*    }}*/}
      {/*    margin="normal"*/}
      {/*    InputLabelProps={{*/}
      {/*        shrink: true,*/}
      {/*    }}*/}
      {/*/>*/}
      {/*<Button*/}
      {/*    variant="contained"*/}
      {/*    color="primary"*/}
      {/*    onClick={() => queryUnVerify()}*/}
      {/*    className={classes.button}*/}
      {/*    // size={'small'}*/}
      {/*    style={{height: "36px", marginTop: "24px"}}*/}
      {/*>*/}
      {/*    查询*/}
      {/*</Button>*/}
      {/*<div style={{width: "100%", height: "300px"}}>*/}
      {/*    {!loading &&*/}
      {/*    (<DataGrid*/}
      {/*        columns={fieldUnVerify}*/}
      {/*        rows={unVerifyField}*/}
      {/*        pagination*/}
      {/*        pageSize={pageSize}*/}
      {/*        paginationMode="server"*/}
      {/*        page={unVerifyPage}*/}
      {/*        onPageChange={(params) => {*/}
      {/*        setUnVerifyPage(params.page);*/}
      {/*        queryUnVerify(params.page)*/}
      {/*    }}/>)}*/}
      {/*</div>*/}
    </div>
  );
}
