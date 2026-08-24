'use client';

import type { BaseProps } from '@astryxdesign/core/BaseProps';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';

const styles = stylex.create({
  background: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colorVars['--color-background-body'],
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-medium-max'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '[data-active]': { opacity: 1 },
    '@media (prefers-reduced-motion: reduce)': { transitionDuration: '0ms' },
  },
  indent: {
    transitionProperty: 'transform, border-radius',
    transitionDuration: durationVars['--duration-medium-max'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transform: 'scale(1)',
    borderRadius: 0,
    overflow: 'visible',
    '[data-active]': {
      transform: 'scale(0.95)',
      borderRadius: radiusVars['--radius-container'],
      overflow: 'hidden',
    },
    '@media (prefers-reduced-motion: reduce)': { transitionDuration: '0ms' },
  },
});

/**
 * Provides a shared context for coordinating the indent effect (`DrawerIndent`,
 * `DrawerIndentBackground`) across every `Drawer` beneath it. Wrap your app once, near the root.
 */
export const DrawerProvider = BaseDrawer.Provider;

export interface DrawerIndentBackgroundProps extends Omit<BaseProps<HTMLDivElement>, 'children'> {
  /** Ref forwarded to the root element */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A background layer revealed behind `DrawerIndent` while any drawer within the nearest
 * `DrawerProvider` is open. Render it once, immediately before `DrawerIndent`.
 */
export function DrawerIndentBackground({
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DrawerIndentBackgroundProps) {
  // @astryxdesign/core's mergeProps type-checks under tsc. oxlint's type-aware pass cannot resolve
  // it here. This is an upstream tooling gap, not a bug in this call.
  // oxlint-disable-next-line no-unsafe-assignment, no-unsafe-call
  const merged = mergeProps(stylex.props(styles.background, xstyle), className, style);
  return <BaseDrawer.IndentBackground ref={ref} {...rest} {...merged} />;
}

DrawerIndentBackground.displayName = 'DrawerIndentBackground';

export interface DrawerIndentProps extends Omit<BaseProps<HTMLDivElement>, 'children'> {
  /** Ref forwarded to the root element */
  ref?: Ref<HTMLDivElement>;
  /** Your app's main UI. */
  children: ReactNode;
}

/**
 * Wraps your app's main UI. While any drawer within the nearest `DrawerProvider` is open, scales
 * down and rounds its corners — the iOS-style "indent" effect — revealing `DrawerIndentBackground`
 * around its edges.
 *
 * @example
 *   ```
 *   <DrawerProvider>
 *   <DrawerIndentBackground />
 *   <DrawerIndent>
 *   <AppShell>...</AppShell>
 *   </DrawerIndent>
 *   </DrawerProvider>
 *   ```;
 */
export function DrawerIndent({
  children,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DrawerIndentProps) {
  // See the note above DrawerIndentBackground's mergeProps call.
  // oxlint-disable-next-line no-unsafe-assignment, no-unsafe-call
  const merged = mergeProps(stylex.props(styles.indent, xstyle), className, style);
  return (
    <BaseDrawer.Indent ref={ref} {...rest} {...merged}>
      {children}
    </BaseDrawer.Indent>
  );
}

DrawerIndent.displayName = 'DrawerIndent';
