import { IRoute } from "./index";
import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

export function MenuItem(props: { route: IRoute; slug: string[] }) {
  const { route, slug } = props;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const children = route.children.filter(
    (route) => route.title && route.title.length > 0 && !route.hidden
  );
  const go = (slug: string[]) => {
    const path = "/main/" + slug.join("/");
    router.push(path);
  };

  return (
    <>
      <ListItem
        selected={
          (slug.length == 1 && slug[0] === route.slug) ||
          (slug.length == 2 && slug[0] === route.slug && slug[1] === "index")
        }
        onClick={() => {
          if (children && children.length > 0 && !open) setOpen(true);
          go([route.slug]);
        }}
      >
        {route.icon && <ListItemIcon>{route.icon}</ListItemIcon>}
        <ListItemText primary={route.title} />
        {children && children.length > 0 ? (
          open ? (
            <ExpandLess onClick={() => setOpen(false)} />
          ) : (
            <ExpandMore onClick={() => setOpen(true)} />
          )
        ) : null}
      </ListItem>
      <Collapse in={open} timeout="auto">
        {children && (
          <Box pl={3}>
            <List>
              {children.map((child) => (
                <ListItem
                  selected={
                    slug.length > 1 &&
                    slug[1] === child.slug &&
                    slug[0] === route.slug
                  }
                  key={route.slug}
                  onClick={() => go([route.slug, child.slug])}
                >
                  {route.icon && <ListItemIcon>{route.icon}</ListItemIcon>}
                  <ListItemText primary={route.title} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Collapse>
    </>
  );
}

export default MenuItem;
