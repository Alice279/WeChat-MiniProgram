import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAsync } from "react-use";
import { introduction, useBackend } from "../../lib/shared/backend";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Editor from "../../components/editor/index";
import Head from "next/head";
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: any) => {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: "100vw",
  },
  "ql-container": {
    border: "none",
  },
}));

export default function Index() {
  const router = useRouter();
  const { call } = useBackend();

  useAsync(async () => {
    const data = await call(introduction.IntroductionService.IntroductionGet, {
      name: "",
      content: "",
    });
    let index = 0;
    for (let i = 0; i < data.content.length; i++) {
      if (data.content[i].name == "和合社会组织") {
        data.content.splice(
          index,
          1,
          ...data.content.splice(i, 1, data.content[index])
        );
        index++;
        break;
      }
    }
    const query = router.asPath.split("=");
    if (query.length > 1) {
      for (let i = 0; i < data.content.length; i++) {
        if (data.content[i].name.toUpperCase() == query[1].toUpperCase()) {
          data.content.splice(
            index,
            1,
            ...data.content.splice(i, 1, data.content[index])
          );
          break;
        }
      }
    }
    setIntr(data.content);
  });
  const classes = useStyles();
  const theme = useTheme();
  const [intr, setIntr] = React.useState([]);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };
  return (
    <div className={classes.root}>
      <Head>
        <title>我们是谁</title>
      </Head>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          {intr.map((item, index) => (
            <Tab label={item.name} {...a11yProps(index)} key={index} />
          ))}
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {intr.map((item, index) => (
          <TabPanel
            value={value}
            index={index}
            dir={theme.direction}
            key={index}
          >
            <Editor modules={{ toolbar: false }} value={item.content} />
          </TabPanel>
        ))}
      </SwipeableViews>
    </div>
  );
}
