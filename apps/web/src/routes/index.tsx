import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@acme/ui";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [count, setCount] = useState(0);

  return (
    <Button label={`Clicked ${count} times`} onClick={() => setCount((current) => current + 1)} />
  );
}
