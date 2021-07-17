import React from "react";
import { auth, useBackend, UserSetCredentialReq } from "../../../lib/backend";
import { FORM_ERROR } from "final-form";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useRouter } from "next/router";

interface FromValues extends UserSetCredentialReq {
  confirm: string;
}

const SetCredentialView = () => {
  const { call } = useBackend();
  const router = useRouter();

  async function onSubmit(values: FromValues) {
    try {
      await call(auth.UserService.SetCredential, values);
      alert("用户名密码设置成功");
      router.back();
    } catch (e) {
      return { [FORM_ERROR]: e.kind ? e.message : JSON.stringify(e) };
    }
  }

  function validate(values: FromValues) {
    if (values.password !== values.confirm) {
      return { confirm: "密码不一致" };
    }
    return;
  }

  return (
    <Box p={4}>
      <Typography>设置用户名、密码</Typography>
      <Form
        onSubmit={onSubmit}
        initialValues={{ userName: "", password: "", confirm: "" }}
        validate={validate}
        render={({ handleSubmit, submitError, submitting }) => {
          if (submitting) return <CircularProgress />;

          return (
            <form onSubmit={handleSubmit} noValidate>
              <TextField label="用户名" name="userName" required={true} />
              <TextField
                label="密码"
                name="password"
                required={true}
                type="password"
              />
              <TextField
                label="确认密码"
                name="confirm"
                required={true}
                type="password"
              />
              <Box width="full" display="flex" justifyContent="center" mt={3}>
                <Button variant="contained" color="primary" type="submit">
                  保存
                </Button>
              </Box>

              {submitError && (
                <Snackbar open autoHideDuration={6000}>
                  <Alert severity="error">{submitError}</Alert>
                </Snackbar>
              )}
            </form>
          );
        }}
      />
    </Box>
  );
};

export default SetCredentialView;
