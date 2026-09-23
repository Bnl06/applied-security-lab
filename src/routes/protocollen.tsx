import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/protocollen")({
  component: () => <Outlet />,
});
