import { LinkProvider } from '@astryxdesign/core/Link';
import { Theme } from '@astryxdesign/core/theme';
import type { ReactNode } from 'react';

import { RouterLink } from './router-link.tsx';
import { appTheme } from './theme.tsx';

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LinkProvider component={RouterLink}>
      <Theme mode="system" theme={appTheme}>
        {children}
      </Theme>
    </LinkProvider>
  );
}
