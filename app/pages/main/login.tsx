import React, { useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useBackend, auth } from "../../lib/backend";
import { useAsyncFn } from "react-use";

const LoginPage = () => {
  const { call, setSession, setDeviceToken } = useBackend();
  const userNameRef = useRef();
  const passwordRef = useRef();
  const [loginState, doLogin] = useAsyncFn(async (username, password) => {
    if (!username || !password) {
      throw "username and password should not be empty.";
    }
    const data = await call(auth.UserService.Login, {
      deviceID: "0",
      userName: username,
      password,
    });
    return data;
  });
  if (loginState.loading) {
    return <CircularProgress />;
  }

  if (loginState.error) {
    setTimeout(() => {
      if (loginState.error.message.indexOf("已登录") != -1) {
        window.location.href = "/main/home";
      } else {
        window.location.reload();
      }
    }, 1000);
    return <p>{JSON.stringify(loginState.error)}</p>;
  }

  if (loginState.value) {
    setSession(loginState.value.session);
    setDeviceToken(loginState.value.deviceToken).then(
      console.log,
      console.error
    );
    window.location.href = "/main/home";
    console.log(loginState.value.user);
  }
  return (
    <Container maxWidth="sm">
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Box display="flex" m={2} p={2} justifyContent="center">
          <Typography variant="h4">后台管理</Typography>
        </Box>
        <Paper elevation={1}>
          <Box
            display="flex"
            flexDirection="column"
            p={2}
            height="15rem"
            alignItems="space-around"
            justifyContent="space-around"
          >
            <TextField
              label="用户名"
              autoComplete="username"
              inputRef={userNameRef}
            />
            <TextField
              label="密码"
              type="password"
              autoComplete="current-password"
              inputRef={passwordRef}
            />
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                // @ts-ignore
                const userName = userNameRef.current?.value;
                // @ts-ignore
                const password = passwordRef.current?.value;
                doLogin(userName, password);
              }}
            >
              登录
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
