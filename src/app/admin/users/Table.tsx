"use client";
import { UsersTableRow } from "./TableRow";

export default function UsersTable({
  rows,
}: {
  rows: Array<{ id: string } & Record<string, any>>;
}) {
  return (
    <table className="w-full">
      <tbody>
        {rows.map((r) => (
          <UsersTableRow key={r.id} {...r} />
        ))}
      </tbody>
    </table>
  );
}
