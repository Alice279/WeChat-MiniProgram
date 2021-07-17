import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { Button, FormLabel } from "@material-ui/core";
import { useRouter } from "next/router";
import { activity, useBackend } from "../../lib/shared/backend";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  isOverflown,
} from "@material-ui/data-grid";
import DynamicKV from "../dynamic_kv";
import { useSnackbar } from "material-ui-snackbar-provider";
import Popper from "@material-ui/core/Popper";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useAsync } from "react-use";

interface GridCellExpandProps {
  value: string;
  width: number;
}

const GridCellExpand = React.memo(function GridCellExpand(
  props: GridCellExpandProps
) {
  const { width, value } = props;
  const wrapper = React.useRef<HTMLDivElement | null>(null);
  const cellDiv = React.useRef(null);
  const cellValue = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const classes = useStyles();
  const [showFullCell, setShowFullCell] = React.useState(false);
  const [showPopper, setShowPopper] = React.useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current!);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  React.useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === "Escape" || nativeEvent.key === "Esc") {
        setShowFullCell(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <div
      ref={wrapper}
      className={classes.root}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cellDiv}
        style={{
          height: 1,
          width,
          display: "block",
          position: "absolute",
          top: 0,
        }}
      />
      <div ref={cellValue} className="cellValue">
        {value}
      </div>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{ width, marginLeft: -17 }}
        >
          <Paper
            elevation={1}
            style={{ minHeight: wrapper.current!.offsetHeight - 3 }}
          >
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </div>
  );
});

function renderCellExpand(params: GridCellParams) {
  return (
    <GridCellExpand
      value={params.value ? params.value.toString() : ""}
      width={params.colDef.width}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: "center",
    lineHeight: "24px",
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    "& .cellValue": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  rootPage: {
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

export default function activityDetail() {
  const snackbar = useSnackbar();
  const classes = useStyles();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    field: "",
    location: "",
    coverPicUrl: "",
    totalQuota: 0,
    applyQuota: 0,
    points: 0,
    begin: "",
    end: "",
    signUpBegin: "",
    signUpEnd: "",
    labels: [],
    labelsText: "",
    sponsor: "",
    origanizerNumber: "",
    introduction: "",
    fakeQuota: 0,
    pictureUrls: [],
  });
  const { call, context } = useBackend();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [dynamicKV, setDynamicKV] = useState([]);
  const [unVerifyPerson, setUnVerifyPerson] = React.useState([]);
  const [verifyPerson, setVerifyPerson] = React.useState([]);

  const personVerify: GridColDef[] = [
    {
      field: "id",
      headerName: "userID",
      width: 150,
      renderCell: renderCellExpand,
    },
    ...(verifyPerson && verifyPerson.length > 0
      ? Object.keys(verifyPerson[0].info).map((key) => ({
          field: key,
          headerName: key,
          width: 150,
          renderCell: renderCellExpand,
        }))
      : []),
    {
      field: "score",
      headerName: "获取积分",
      width: 150,
      renderCell: (params) => (
        <>
          {!params.row.pointedTime && (
            <Button
              onClick={async () => {
                try {
                  await call(activity.ActivityService.GrantPoints, {
                    uID: params.id,
                    activityID: router.query.id,
                  });
                  const signUpList = await call(
                    activity.SignUpService.GetActivitySignUpList,
                    {
                      // @ts-ignore
                      id: router.query.id,
                    }
                  );
                  setVerifyPerson(signUpList.userInfos);
                } catch (e) {
                  snackbar.showMessage(e.message);
                }
              }}
            >
              授予积分
            </Button>
          )}
        </>
      ),
    },
  ];

  const personUnVerify: GridColDef[] = [
    {
      field: "id",
      headerName: "userID",
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: "signUpTime",
      headerName: "报名时间",
      width: 150,
      renderCell: renderCellExpand,
    },
    ...(unVerifyPerson && unVerifyPerson.length > 0
      ? Object.keys(unVerifyPerson[0].userInfo).map((key) => ({
          field: key,
          headerName: key,
          width: 150,
          renderCell: renderCellExpand,
        }))
      : []),
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
                  await call(activity.SignUpService.VerifySignUp, {
                    // @ts-ignore
                    userID: params.id,
                    // @ts-ignore
                    activityID: router.query.id,
                  });
                  const signUpList = await call(
                    activity.SignUpService.GetActivitySignUpList,
                    {
                      // @ts-ignore
                      id: router.query.id,
                    }
                  );
                  setVerifyPerson(signUpList.userInfos);
                  const d = await call(
                    activity.SignUpService.ToVerifiedSignUpRecordList,
                    {
                      // @ts-ignore
                      activityID: router.query.id,
                    }
                  );
                  const tp = [];
                  if (d.records) {
                    d.records.map((item) => {
                      tp.push({ ...item, id: item.userID });
                    });
                  }
                  setUnVerifyPerson(tp);
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
                  await call(activity.SignUpService.CancelToVerifySignUp, {
                    userID: params.id,
                    activityID: router.query.id,
                  });
                  const d = await call(
                    activity.SignUpService.ToVerifiedSignUpRecordList,
                    {
                      // @ts-ignore
                      activityID: router.query.id,
                    }
                  );
                  const tp = [];
                  if (d.records) {
                    d.records.map((item) => {
                      tp.push({ ...item, id: item.userID });
                    });
                  }
                  setUnVerifyPerson(tp);
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
  // 进入页面时加载
  useAsync(async () => {
    if (router.query.id) {
      try {
        const d = await call(activity.ActivityService.GetActivityDetail, {
          id: router.query.id,
        });
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
        let labelsText = "";
        d.activity.labels.map((item) => {
          labelsText = labelsText + item.name + "/";
        });
        d.activity.labelsText = labelsText.slice(0, labelsText.length - 1);
        // @ts-ignore
        setForm(d.activity);
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    } else {
      snackbar.showMessage("Invalid ID");
      setTimeout(() => {
        router.push("/main/activity/index");
      }, 2000);
    }
  });
  useAsync(async () => {
    if (router.query.id) {
      try {
        const d = await call(
          activity.SignUpService.ToVerifiedSignUpRecordList,
          {
            // @ts-ignore
            ActivityID: router.query.id,
          }
        );
        const tp = [];
        if (d.records) {
          d.records.map((item) => {
            tp.push({ ...item, id: item.userID });
          });
        }
        setUnVerifyPerson(tp);
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    }
  });
  useAsync(async () => {
    if (router.query.id) {
      try {
        const d = await call(activity.SignUpService.GetActivitySignUpList, {
          // @ts-ignore
          id: router.query.id,
        });
        setVerifyPerson(d.userInfos);
      } catch (e) {
        snackbar.showMessage(e.message);
      }
    }
  });
  const handleUpdate = () => {
    if (router.query.id) {
      router.push("/main/activity/au?id=" + router.query.id);
    }
  };

  const handleClose = () => {
    setDeleteOpen(false);
  };

  const handleDelete = async () => {
    try {
      await call(activity.ActivityService.DeleteActivity, {
        id: router.query.id,
      });
      snackbar.showMessage("删除成功");
      router.push("/main/activity/index");
    } catch (e) {
      snackbar.showMessage(e.message);
    }
  };
  return (
    <div className={classes.rootPage}>
      <Dialog
        open={deleteOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"是否确定删除该活动"}
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
          onClick={() => {
            setDeleteOpen(true);
          }}
          className={classes.button}
        >
          删除活动
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          className={classes.button}
          style={{ marginRight: "10px" }}
        >
          修改活动
        </Button>
      </div>
      <div>
        <TextField
          disabled={true}
          required
          label="活动名称"
          id="margin-none"
          value={form.title}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动场地"
          id="margin-dense"
          value={form.field}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动地点"
          id="margin-dense"
          value={form.location}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动人数"
          id="margin-normal"
          type={"number"}
          value={form.totalQuota}
          className={classes.textField}
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
          label="活动开始时间"
          value={form.begin}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动结束时间"
          value={form.end}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="报名开始时间"
          value={form.signUpBegin}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="报名结束时间"
          value={form.signUpEnd}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动标签"
          id="margin-dense"
          value={form.labelsText}
          className={classes.textField}
          helperText="请输入活动标签，'/'分割，如: 亲子/少儿"
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="赞助商"
          id="margin-dense"
          value={form.sponsor}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="主办方电话"
          id="margin-dense"
          value={form.origanizerNumber}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动介绍"
          id="margin-dense"
          value={form.introduction}
          className={classes.textField}
          margin="normal"
        />
        <TextField
          required
          disabled={true}
          label="虚拟人数"
          type={"number"}
          value={form.fakeQuota}
          className={classes.textField}
          helperText="0代表使用真实人数"
          margin="normal"
        />
        <TextField
          disabled={true}
          required
          label="活动积分"
          id="margin-normal"
          type={"number"}
          value={form.points}
          className={classes.textField}
          margin="normal"
        />
        <FormLabel component="legend" className={classes.marginNormal}>
          附加字段
        </FormLabel>
        <DynamicKV value={dynamicKV} onChange={setDynamicKV} />
        <FormLabel component="legend" className={classes.marginNormal}>
          活动介绍图片
        </FormLabel>
        {form.pictureUrls.map((item, index) => (
          <div className={classes.dropArea} key={index}>
            <img src={item} className={classes.dropAreaImg} />
          </div>
        ))}
      </div>
      <FormLabel component="legend" className={classes.marginNormal}>
        审核通过人员
      </FormLabel>
      <div className={classes.buttonContainer}>
        <Button
          variant="contained"
          color="secondary"
          onClick={async () => {
            const session = await context.getSession();
            fetch(
              "/api/activity/SignUpService.ActivitySignUpCSVList?id=" +
                router.query.id,
              {
                headers: {
                  authorization: session,
                },
              }
            ).then((res) =>
              res.blob().then((blob) => {
                let a = document.createElement("a");
                let url = window.URL.createObjectURL(blob);
                let filename = decodeURIComponent(
                  res.headers.get("Content-Disposition")
                );
                if (filename) {
                  filename = filename.split("=")[1];
                  a.href = url;
                  a.download = filename;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  a = null;
                }
              })
            );
            call(activity.SignUpService.ActivitySignUpCSVList, {
              id: router.query.id,
            });
          }}
          className={classes.button}
        >
          导出人员名单
        </Button>
      </div>
      <div style={{ width: "100%", height: "300px" }}>
        {!loading && (
          <DataGrid
            columns={personVerify}
            rows={
              verifyPerson &&
              verifyPerson.map((x) => ({
                ...x,
                ...x.info,
                id: x.user.id,
              }))
            }
          />
        )}
      </div>

      <FormLabel component="legend" className={classes.marginNormal}>
        待审核人员
      </FormLabel>

      <div style={{ width: "100%", height: "300px" }}>
        {!loading && (
          <DataGrid
            columns={personUnVerify}
            rows={
              unVerifyPerson &&
              unVerifyPerson.map((x) => ({ ...x, ...x.userInfo }))
            }
          />
        )}
      </div>
    </div>
  );
}
