import * as React from "react";
import { FC, useState } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import { Button } from "@material-ui/core";

export interface DynamicKVProps {
  value: { key: string; value: string }[];
  onChange: (items: { key: string; value: string }[]) => void;
  canModify?: boolean;
}

const useStyles = makeStyles((theme) => ({
  margin: {
    marginRight: "10px",
  },
  flex: {
    display: "flex",
    alignItems: "center",
  },
}));

const DynamicKV: FC<DynamicKVProps> = (props) => {
  const classes = useStyles();
  const value = props.value;
  const handleRemove = (index) => {
    let t = [...value];
    t.splice(index, 1);
    props.onChange(t);
  };

  const handleAdd = () => {
    let t = [...value];
    t.push({ key: "", value: "" });
    props.onChange(t);
  };
  return (
    <>
      {value.map((item, index) => (
        <div key={index} className={classes.flex}>
          <TextField
            label="key"
            value={item.key}
            onChange={(e) => {
              let t = [...value];
              t[index]["key"] = e.target.value;
              props.onChange(t);
            }}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            className={classes.margin}
            disabled={!props.canModify}
          />
          <TextField
            label="value"
            value={item.value}
            onChange={(e) => {
              let t = [...value];
              t[index]["value"] = e.target.value;
              props.onChange(t);
            }}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            disabled={!props.canModify}
            className={classes.margin}
          />
          {props.canModify && (
            <RemoveCircleOutlineIcon onClick={() => handleRemove(index)} />
          )}
        </div>
      ))}
      {props.canModify && (
        <Button onClick={handleAdd} variant="contained" color="primary">
          添加动态表单项
        </Button>
      )}
    </>
  );
};

export default DynamicKV;
