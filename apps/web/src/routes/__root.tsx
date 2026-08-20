import { AppShell } from '@acme/ui';
import { createRootRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { Document } from '#/app/document.tsx';
import { NotFound } from '#/app/not-found.tsx';
import { AppProviders } from '#/app/providers.tsx';

import appCss from '#/styles.css?url';

const stylexDevelopmentRuntime = '/@id/virtual:stylex:runtime';
const stylexDevelopmentStylesheet = '/virtual:stylex.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      // eslint-disable-next-line unicorn/text-encoding-identifier-case -- HTML charset attribute, not a Node.js encoding identifier
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Something Something UI' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      ...(import.meta.env.DEV ? [{ rel: 'stylesheet', href: stylexDevelopmentStylesheet }] : []),
    ],
    scripts: import.meta.env.DEV
      ? [{ defer: true, src: stylexDevelopmentRuntime, type: 'module' as const }]
      : [],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootShell,
});

function RootShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Document>
      <AppProviders>
        <AppShell contentPadding={4} height="fill" variant="wash">
          {children}
        </AppShell>
      </AppProviders>
    </Document>
  );
}
