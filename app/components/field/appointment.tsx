import React from "react";
import { field, FieldCreateOrderReq, useBackend } from "../../lib/backend";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import { Box, Button, CircularProgress, Typography } from "@material-ui/core";
import { useRouter } from "next/router";
import { useSnackbar } from "material-ui-snackbar-provider";

interface FromValues extends FieldCreateOrderReq {
  name: string;
  begin: string;
  end: string;
}
export default function appointment() {
  const { call } = useBackend();
  const router = useRouter();
  const snackbar = useSnackbar();
  const onSubmit = async (values: FromValues) => {
    try {
      const begin = new Date(values.begin);
      const end = new Date(values.end);
      const d = await call(field.FieldService.CreateOrder, {
        fieldID: router.query.id,
        beginTime: begin.toJSON(),
        endTime: end.toJSON(),
        name: values.name,
        comment: values.comment,
      });
      await call(field.FieldService.VerifyOrder, {
        fieldID: router.query.id,
        orderID: d.orderID,
      });
      snackbar.showMessage("场地预约成功");
      router.push("/main/field/detail?id=" + router.query.id);
    } catch (e) {
      snackbar.showMessage(e.message);
    }
  };
  function validate(values: FromValues) {
    if (!values.name || values.name.length < 1) {
      return { name: "预约名称为空" };
    }
    if (!values.begin || values.begin.length < 1) {
      return { begin: "开始时间为空" };
    }
    if (!values.end || values.end.length < 1) {
      return { end: "结束时间为空" };
    }
    return;
  }
  return (
    <>
      <Box p={4}>
        <Typography>新建场地预约</Typography>
        <Form
          onSubmit={onSubmit}
          initialValues={{ name: "", begin: "", end: "", comment: "" }}
          validate={validate}
          render={({ handleSubmit, submitError, submitting }) => {
            if (submitting) return <CircularProgress />;

            return (
              <form onSubmit={handleSubmit} noValidate>
                <TextField
                  label="活动名称"
                  name="name"
                  required={true}
                  margin="normal"
                />
                <TextField
                  label="预约备注"
                  name="comment"
                  required={true}
                  margin="normal"
                />
                <TextField
                  required={true}
                  label="开始时间"
                  type="datetime-local"
                  name="begin"
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  required={true}
                  label="结束时间"
                  type="datetime-local"
                  name="end"
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Box width="full" display="flex" justifyContent="center" mt={3}>
                  <Button variant="contained" color="primary" type="submit">
                    创建
                  </Button>
                </Box>
              </form>
            );
          }}
        />
      </Box>
    </>
  );
}
