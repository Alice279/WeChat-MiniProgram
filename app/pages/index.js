import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Button } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAsync } from "react-use";
import { auth, useBackend } from "../lib/backend";
import Editor from "../components/editor";
export default function Index() {
  const [uid, setUid] = useState(0);
  const router = useRouter();
  const { call, setDeviceToken } = useBackend();
  useAsync(async () => {
    if (!router.isReady) return;
    if (!router.query.deviceToken) {
      router.push("/main/login");
      return;
    }
    setDeviceToken(router.query.deviceToken);

    const data = await call(auth.UserService.UserDetail, {}, { get: true });
    console.log(data);
    setUid(data.user.id);
    if (data.user.isSuper) {
      router.push("/main/home");
      return;
    }
    if (data.user.isStaff) {
      router.push("/main/notify");
      return;
    }
  }, [router.isReady]);

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        {/*<Typography variant="h4" component="h1" gutterBottom>*/}
        {/*  UID = {uid}*/}
        {/*</Typography>*/}
        {/*<Button>a button</Button>*/}
      </Box>
      {/*<Editor />*/}
    </Container>
  );
}
