import * as React from "react";
import { FC, useState } from "react";
import Link from "next/link";
const UserAdmin: FC = () => {
  const [a, setA] = useState(0);
  return (
    <>
      <div
        onClick={() => setA(a + 1)}
        style={{ height: "200vh", background: "red" }}
      >
        {a} useradmin
      </div>
      <Link href="/main/auto-admin/perm">
        <div>go perm</div>
      </Link>
    </>
  );
};

export default UserAdmin;
