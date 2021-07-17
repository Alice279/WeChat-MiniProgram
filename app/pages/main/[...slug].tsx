import React from "react";
import dynamic from "next/dynamic";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import { IRoute } from "../../components/main";
import { MainMobile } from "../../components/main/mobile";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { MainDesktop } from "../../components/main/desktop";
import { SnackbarProvider } from "material-ui-snackbar-provider";

const routes: IRoute[] = [
  {
    slug: "user-admin",
    title: "用户管理",
    icon: <InboxIcon />,
    bottom: false,
    children: [
      {
        slug: "index",
        component: dynamic(() => import("../../components/admin/user/list")),
        children: [
          {
            slug: "perm",
            component: dynamic(
              () => import("../../components/admin/user/perm")
            ),
          },
        ],
      },
    ],
  },
  {
    slug: "activity",
    title: "活动管理",
    bottom: false,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        component: dynamic(() => import("../../components/activity/index")),
        children: [],
      },
      {
        slug: "au",
        component: dynamic(() => import("../../components/activity/au")),
        children: [],
      },
      {
        slug: "detail",
        component: dynamic(() => import("../../components/activity/detail")),
        children: [],
      },
    ],
  },
  {
    slug: "introduction",
    title: "简介管理",
    bottom: false,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        component: dynamic(
          () => import("../../components/introduction/introduction")
        ),
      },
    ],
  },
  {
    slug: "field",
    title: "场地管理",
    bottom: true,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        component: dynamic(() => import("../../components/field/index")),
        children: [],
      },
      {
        slug: "au",
        component: dynamic(() => import("../../components/field/au")),
        children: [],
      },
      {
        slug: "appointment",
        component: dynamic(() => import("../../components/field/appointment")),
        children: [],
      },
      {
        slug: "detail",
        component: dynamic(() => import("../../components/field/detail")),
        children: [],
      },
    ],
  },
  {
    slug: "joinus",
    title: "加入我们",
    bottom: false,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        component: dynamic(() => import("../../components/join/join")),
      },
    ],
  },
  {
    slug: "swiper",
    title: "主页轮播图",
    bottom: false,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        component: dynamic(() => import("../../components/home_swiper/index")),
      },
    ],
  },
  {
    slug: "notify",
    title: "通知",
    bottom: false,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        component: dynamic(() => import("../../components/notify/notify")),
      },
    ],
  },
  {
    slug: "home",
    title: "个人中心",
    bottom: true,
    icon: <InboxIcon />,
    children: [
      {
        slug: "index",
        title: "个人中心",
        hidden: true,
        component: dynamic(() => import("../../components/admin/home")),
        children: [
          {
            slug: "set-credential",
            component: dynamic(
              () => import("../../components/admin/home/set-credential")
            ),
          },
        ],
      },
    ],
  },
  {
    slug: "more",
    title: "更多",
    bottom: true,
    icon: <InboxIcon />,
    component: () => <div></div>,
    children: [],
  },
];

function Main() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <SnackbarProvider
        SnackbarProps={{
          autoHideDuration: 2000,
          anchorOrigin: { vertical: "top", horizontal: "center" },
        }}
      >
        {isMobile ? (
          <MainMobile routes={routes} />
        ) : (
          <MainDesktop routes={routes} />
        )}
      </SnackbarProvider>
    </>
  );
}

export default Main;

export async function getStaticProps() {
  return { props: {} };
}
export async function getStaticPaths() {
  function recur(
    emit: (slug: string[]) => void,
    parents: string[],
    route: IRoute
  ) {
    if (route.component) {
      emit([...parents, route.slug]);
    }
    let here = null;
    if (route.slug === "index") {
      here = parents;
      emit(parents);
    } else {
      here = [...parents, route.slug];
    }
    if (route.children) {
      route.children.map((child) => recur(emit, here, child));
    }
  }

  const paths = [];
  const emit = (slug: string[]) => {
    paths.push({ params: { slug } });
  };
  routes.map((route) => recur(emit, [], route));

  return {
    paths,
    fallback: false,
  };
}
