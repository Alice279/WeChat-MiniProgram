import { FC } from "react";
import * as React from "react";
import Link from "next/link";
const UserAdminPerm: FC = () => {
  return (
    <Link href="/main/auto-admin/x/list">
      <div>UserAdminPerm</div>
    </Link>
  );
};

export default UserAdminPerm;
