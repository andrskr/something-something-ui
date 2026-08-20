import { LinkProvider, Theme, neutralTheme } from "@acme/ui";
import type { ReactNode } from "react";

import { RouterLink } from "./router-link.tsx";

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LinkProvider component={RouterLink}>
      <Theme mode="system" theme={neutralTheme}>
        {children}
      </Theme>
    </LinkProvider>
  );
}
