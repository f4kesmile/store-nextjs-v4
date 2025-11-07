"use client";
import { RolesTableRow } from "./TableRow";

export default function RolesTable({
  rows,
}: {
  rows: Array<{ name: string } & Record<string, any>>;
}) {
  return (
    <table className="w-full">
      <tbody>
        {rows.map((r) => (
          <RolesTableRow key={r.name} {...r} />
        ))}
      </tbody>
    </table>
  );
}
