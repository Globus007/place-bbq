import { createFileRoute } from "@tanstack/react-router";
import { StoveApp } from "@/components/stove-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StoveApp />;
}
