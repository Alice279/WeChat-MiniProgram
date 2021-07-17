import { useRouter } from "next/router";
import React, { useState } from "react";
import { List, makeStyles, useTheme } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import { IRoute } from ".";
import { makeTitle, match } from "./match";
import Head from "next/head";
import MenuItem from "./menu";

const drawerWidth = 200;

const useStyles = makeStyles((theme) => {
  return {
    root: {
      height: `100vh`,
      display: "flex",
      flexFlow: "column",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    container: {
      paddingLeft: `${drawerWidth}px`,
      position: "relative",
      flexGrow: 1,
      flexShrink: 1,
      overflow: "scroll",
      display: "flex",
    },
    a: {
      minWidth: "45%",
    },
    b: {
      borderLeft: "solid 1px #ccc",
      width: "45%",
    },
    aContent: {
      flexGrow: 1,
      flexShrink: 1,
      overflow: "scroll",
    },
    drawerPaper: {
      cursor: "default",
      paddingTop: "70px",
      width: `${drawerWidth}px`,
      overflowX: "hidden",
      flexShrink: 0,
    },
  };
});

export const MainDesktop = (props: { routes: IRoute[] }) => {
  const routes = props.routes;
  const router = useRouter();
  const theme = useTheme();
  const slug: string[] = router.query.slug || ([] as any);

  const [A, B] = match(routes, slug);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = makeTitle(A, B);
  const classes = useStyles(theme);

  const drawerItems = routes
    .filter(
      (route) =>
        route.title &&
        route.title.length > 0 &&
        !route.hidden &&
        route.slug !== "more"
    )
    .map((route, index) => <MenuItem route={route} slug={slug} key={index} />);
  return (
    <div className={classes.root}>
      <Head>
        <title>{title}</title>
      </Head>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6">{title}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        open
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <List>{drawerItems}</List>
      </Drawer>
      <div className={classes.container}>
        <div className={classes.a}>{A && <A.component />}</div>
        {B && (
          <div className={classes.b}>
            <B.component />
          </div>
        )}
      </div>
    </div>
  );
};
