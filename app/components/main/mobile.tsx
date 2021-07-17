import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  BottomNavigationAction,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import { IRoute } from ".";
import { makeTitle, match } from "./match";
import Head from "next/head";
import MenuItem from "./menu";

const drawerWidth = 240;

const useStyles = makeStyles({
  root: {
    height: `100vh`,
    display: "flex",
    flexFlow: "column",
  },
  container: {
    position: "relative",
    flexGrow: 1,
    flexShrink: 1,
    overflow: "hidden",
    display: "flex",
  },
  a: {
    display: "flex",
    flexFlow: "column",
    minHeight: "100%",
    flexGrow: 1,
  },
  b: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    background: "white",
    overflow: "scroll",
  },
  aContent: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: "scroll",
  },
  drawerPaper: {
    width: `${drawerWidth}px`,
    overflowX: "hidden",
    flexShrink: 0,
  },
});

export const MainMobile = (props: { routes: IRoute[] }) => {
  const routes = props.routes;
  const router = useRouter();
  const slug: string[] = router.query.slug || ([] as any);

  const [A, B] = match(routes, slug);

  const title = makeTitle(A, B);

  const [drawerOpen, setDrawerOpen] = useState(
    slug.length > 0 && slug[0] === "more"
  );
  const classes = useStyles();

  const go = (slug: string[]) => {
    const path = router.route.split("/");
    path.pop();
    path.push(...slug);
    router.push(path.join("/"));
  };

  let drawerItems = [];

  const currentRoute = routes.filter((route) => route.slug === slug[0])[0];
  if (!currentRoute || !currentRoute.bottom || slug[0] === "more") {
    drawerItems = routes
      .filter((route) => !route.bottom)
      .map((route) => <MenuItem key={route.slug} route={route} slug={slug} />);
  } else {
    drawerItems = (currentRoute?.children || [])
      .filter((route) => route.title && route.title.length > 0 && !route.hidden)
      .map((route) => (
        <ListItem
          selected={slug.length > 1 && slug[1] === route.slug}
          key={route.slug}
          onClick={() => go([slug[0], route.slug])}
        >
          {route.icon && <ListItemIcon>{route.icon}</ListItemIcon>}
          <ListItemText primary={route.title} />
        </ListItem>
      ));
  }

  return (
    <div className={classes.root}>
      <Head>
        <title>{title}</title>
      </Head>
      <AppBar position="static">
        <Toolbar>
          {B ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={router.back}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            drawerItems.length > 0 && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )
          )}

          <Typography variant="h6">{title}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <List>{drawerItems}</List>
      </Drawer>
      <div className={classes.container}>
        <div className={classes.a}>
          <div className={classes.aContent}>{A && <A.component />}</div>

          <BottomNavigation
            showLabels
            value={currentRoute.bottom ? slug[0] : "more"}
          >
            {routes
              .filter((route) => route.bottom)
              .map((route) => (
                <BottomNavigationAction
                  key={route.slug}
                  label={route.title}
                  icon={route.icon}
                  onClick={() => go([route.slug])}
                  value={route.slug}
                />
              ))}
          </BottomNavigation>
        </div>

        {B && (
          <div className={classes.b}>
            <B.component />
          </div>
        )}
      </div>
    </div>
  );
};
