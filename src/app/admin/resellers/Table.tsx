"use client";
import { ResellersTableRow } from "./TableRow";

export default function ResellersTable({
  rows,
}: {
  rows: Array<{ id: string } & Record<string, any>>;
}) {
  return (
    <table className="w-full">
      <tbody>
        {rows.map((r) => (
          <ResellersTableRow key={r.id} {...r} />
        ))}
      </tbody>
    </table>
  );
}
