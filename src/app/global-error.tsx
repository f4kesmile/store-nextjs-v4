"use client";

import { MaintenanceScreen } from "@/components/MaintenanceScreen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <MaintenanceScreen isError={true} errorObj={error} reset={reset} />
      </body>
    </html>
  );
}
