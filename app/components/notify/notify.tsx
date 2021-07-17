import { activity, useBackend } from "../../lib/shared/backend";
import { useAsync } from "react-use";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  isOverflown,
} from "@material-ui/data-grid";
import React from "react";
import { useSnackbar } from "material-ui-snackbar-provider";
import { createStyles, makeStyles } from "@material-ui/styles";
import Popper from "@material-ui/core/Popper";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useRouter } from "next/router";

interface GridCellExpandProps {
  value: string;
  width: number;
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      alignItems: "center",
      lineHeight: "24px",
      width: "100%",
      height: "100%",
      position: "relative",
      display: "flex",
      "& .cellValue": {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
  })
);

const GridCellExpand = React.memo(function GridCellExpand(
  props: GridCellExpandProps
) {
  const { width, value } = props;
  const wrapper = React.useRef<HTMLDivElement | null>(null);
  const cellDiv = React.useRef(null);
  const cellValue = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const classes = useStyles();
  const [showFullCell, setShowFullCell] = React.useState(false);
  const [showPopper, setShowPopper] = React.useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current!);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  React.useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === "Escape" || nativeEvent.key === "Esc") {
        setShowFullCell(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <div
      ref={wrapper}
      className={classes.root}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cellDiv}
        style={{
          height: 1,
          width,
          display: "block",
          position: "absolute",
          top: 0,
        }}
      />
      <div ref={cellValue} className="cellValue">
        {value}
      </div>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{ width, marginLeft: -17 }}
        >
          <Paper
            elevation={1}
            style={{ minHeight: wrapper.current!.offsetHeight - 3 }}
          >
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </div>
  );
});

function renderCellExpand(params: GridCellParams) {
  return (
    <GridCellExpand
      value={params.value ? params.value.toString() : ""}
      width={params.colDef.width}
    />
  );
}
export default function notify() {
  const { call } = useBackend();
  const snackbar = useSnackbar();
  const router = useRouter();
  const { value: data, loading } = useAsync(async () => {
    try {
      return await call(activity.SignUpService.GetToVerifyActivities, {});
    } catch (e) {
      snackbar.showMessage(e.message);
    }
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 150, renderCell: renderCellExpand },
    {
      field: "title",
      headerName: "活动名称",
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: "field",
      headerName: "活动场地",
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: "location",
      headerName: "活动地点",
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: "begin",
      headerName: "活动开始时间",
      width: 150,
      renderCell: renderCellExpand,
    },
    {
      field: "end",
      headerName: "活动结束时间",
      width: 150,
      renderCell: renderCellExpand,
    },
  ];
  const handleClick = (row) => {
    router.push("/main/activity/detail?id=" + row.id);
  };
  return (
    <>
      <div
        style={{
          marginTop: "30px",
          width: "75vw",
          height: "80%",
          marginLeft: "2.5%",
        }}
      >
        {!loading && (
          <DataGrid
            columns={columns}
            rows={data && data.activities ? data.activities : []}
            onRowClick={handleClick}
            loading={loading}
            pagination
          />
        )}
      </div>
    </>
  );
}
