import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Document({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-astryx-theme="neutral" lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
