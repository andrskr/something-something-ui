import * as stylex from '@stylexjs/stylex';
import { HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

const styles = stylex.create({
  // Base UI portals popups (Drawer, Dialog, Popover, ...) to the end of <body>. Without an
  // isolated stacking context here, an app descendant with its own z-index (e.g. Astryx's
  // shared input wrapper styles, which use z-index for focus/hover layering between adjacent
  // inputs) can out-rank a portaled popup even though the popup is later in the DOM — z-index
  // only competes within the nearest shared stacking context, so this root needs its own.
  // https://base-ui.com/react/overview/quick-start#portals
  root: {
    isolation: 'isolate',
  },
});

export function Document({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-astryx-theme="neutral" lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div {...stylex.props(styles.root)}>{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
