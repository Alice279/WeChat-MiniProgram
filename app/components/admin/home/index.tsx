import React from "react";
import {
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { auth, useBackend } from "../../../lib/backend";
import { useAsync } from "react-use";
import Head from "next/head";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Link from "next/link";
const Home = () => {
  const { call } = useBackend();
  const state = useAsync(async () => {
    return await call(auth.UserService.UserDetail, {}, { get: true });
  });

  if (state.loading) {
    return <CircularProgress />;
  }

  if (state.error) {
    return <p>{JSON.stringify(state.error)}</p>;
  }

  const { user } = state.value;
  return (
    <>
      <Head>
        <title>个人中心</title>
      </Head>

      <List>
        <ListItem>
          <ListItemAvatar>
            {user.avatarURI && user.avatarURI.length > 0 && (
              <Avatar src={user.avatarURI} />
            )}
          </ListItemAvatar>
          <ListItemText
            primary={user.userName || user.id}
            secondary={
              user.isSuper ? "超级管理员" : user.isStaff ? "管理员" : "用户"
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={"注册时间"} secondary={user.createdAt} />
        </ListItem>
        <Link href="/main/home/set-credential">
          <ListItem>
            <ListItemText
              primary={"设置用户名与密码"}
              secondary={"用于登录 PC 版管理后台"}
            />
            <ListItemIcon>
              <ChevronRightIcon />
            </ListItemIcon>
          </ListItem>
        </Link>
      </List>
    </>
  );
};

export default Home;
