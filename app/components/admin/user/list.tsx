import React, { useState } from "react";
import { useAsync } from "react-use";
import { auth, useBackend } from "../../../lib/shared/backend";
import { DataGrid, GridColDef } from "@material-ui/data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 150 },
  { field: "nickName", headerName: "昵称", width: 150 },
  { field: "isStaff", headerName: "管理员", width: 150 },
];

function UserListView() {
  const { call } = useBackend();
  const [pagination, SetPagination] = useState({ pageSize: 50, pageNum: 0 });

  const { value: data, loading } = useAsync(async () => {
    try {
      console.log(123);
      return await call(auth.UserService.List, { pagination });
    } catch (e) {
      console.error(e);
    }
  }, [pagination]);

  return (
    <>
      {!loading && (
        <DataGrid
          columns={columns}
          rows={data.users}
          onCellDoubleClick={async (params) => {
            if (params.field === "isStaff") {
              try {
                await call(auth.UserService.UserSetAsStaff, { id: params.id });
                alert("授予管理员权限成功");
              } catch (e) {
                alert(JSON.stringify(e));
              }
            }
          }}
        />
      )}
    </>
  );
}

export default UserListView;
