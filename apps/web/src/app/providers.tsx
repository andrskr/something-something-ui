import { LinkProvider } from '@astryxdesign/core/Link';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ReactNode } from 'react';

import { RouterLink } from './router-link.tsx';

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LinkProvider component={RouterLink}>
      <Theme mode="system" theme={neutralTheme}>
        {children}
      </Theme>
    </LinkProvider>
  );
}
