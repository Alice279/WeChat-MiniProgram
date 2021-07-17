import { DropzoneArea } from "material-ui-dropzone";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { home_swiper, useBackend } from "../../lib/shared/backend";
import { useAsync } from "react-use";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import { useRouter } from "next/router";
import { useSnackbar } from "material-ui-snackbar-provider";

const useStyles = makeStyles((theme) => ({
  input: {
    display: "none",
  },
  dropArea: {
    width: "80%",
    height: "250px",
    marginTop: "16px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropAreaImg: {
    width: "90%",
    height: "90%",
  },
}));

export default function swiper() {
  const classes = useStyles();
  const { context } = useBackend();
  const [pictureUrls, setPictureUrls] = useState([]);
  const { call } = useBackend();
  const router = useRouter();
  const snackbar = useSnackbar();
  useAsync(async () => {
    try {
      const d = await call(home_swiper.SwiperService.SwiperGet, {});
      setPictureUrls(d.urls);
    } catch (e) {
      snackbar.showMessage(e.message);
    }
  });

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
      const tmp = pictureUrls;
      tmp.push(`/static/${data.data.fileName}`);
      setPictureUrls(tmp);
    }
  };
  const handleSubmit = async () => {
    try {
      const d = await call(home_swiper.SwiperService.SwiperCreate, {
        urls: pictureUrls,
      });
      snackbar.showMessage("更新成功");
      router.back();
    } catch (e) {
      snackbar.showMessage(e.message);
    }
  };
  const handleRemove = (index) => {
    let t = [...pictureUrls];
    t.splice(index, 1);
    setPictureUrls(t);
  };
  return (
    <>
      <input
        accept="image/*"
        className={classes.input}
        id="contained-button-file"
        multiple
        type="file"
      />
      <div className={classes.dropArea}>
        <DropzoneArea
          filesLimit={5}
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
      <div>
        {pictureUrls.map((item, index) => (
          <div className={classes.dropArea} key={index}>
            <img src={item} className={classes.dropAreaImg} />
            <RemoveCircleOutlineIcon onClick={() => handleRemove(index)} />
          </div>
        ))}
      </div>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        提交
      </Button>
    </>
  );
}
