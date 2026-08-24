'use client';

import type { BaseProps } from '@astryxdesign/core/BaseProps';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { mergeProps } from '@astryxdesign/core/utils';
import {
  Drawer as BaseDrawer,
  type DrawerRoot,
  type DrawerRootChangeEventDetails,
} from '@base-ui/react/drawer';
import * as stylex from '@stylexjs/stylex';
import { useState, type ReactElement, type ReactNode, type Ref } from 'react';

const styles = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colorVars['--color-overlay'],
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-medium-max'],
    transitionTimingFunction: easeVars['--ease-standard'],
    '[data-starting-style]': { opacity: 0 },
    '[data-ending-style]': { opacity: 0 },
  },
  viewport: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
  },
  popup: {
    position: 'fixed',
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: shadowVars['--shadow-high'],
    transform: 'translate(0, 0)',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-medium-max'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    padding: spacingVars['--spacing-4'],
    paddingBottom: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    padding: spacingVars['--spacing-4'],
  },
  swipeArea: {
    position: 'fixed',
  },
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': { transitionDuration: '0ms' },
  },
});

const sideStyles = stylex.create({
  left: {
    insetBlock: 0,
    insetInlineStart: 0,
    borderInlineEnd: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    '[data-starting-style]': { transform: 'translateX(-100%)' },
    '[data-ending-style]': { transform: 'translateX(-100%)' },
  },
  right: {
    insetBlock: 0,
    insetInlineEnd: 0,
    borderInlineStart: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    '[data-starting-style]': { transform: 'translateX(100%)' },
    '[data-ending-style]': { transform: 'translateX(100%)' },
  },
  top: {
    insetInline: 0,
    insetBlockStart: 0,
    borderBlockEnd: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    '[data-starting-style]': { transform: 'translateY(-100%)' },
    '[data-ending-style]': { transform: 'translateY(-100%)' },
  },
  bottom: {
    insetInline: 0,
    insetBlockEnd: 0,
    borderBlockStart: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
    '[data-starting-style]': { transform: 'translateY(100%)' },
    '[data-ending-style]': { transform: 'translateY(100%)' },
  },
});

// A thin edge strip per side, sized across the cross-axis, for swipe-to-open gestures.
const swipeAreaSideStyles = stylex.create({
  left: { insetBlock: 0, insetInlineStart: 0, width: '24px' },
  right: { insetBlock: 0, insetInlineEnd: 0, width: '24px' },
  top: { insetInline: 0, insetBlockStart: 0, height: '24px' },
  bottom: { insetInline: 0, insetBlockEnd: 0, height: '24px' },
});

const dynamicStyles = stylex.create({
  inlineSize: (size: number | string) => ({
    width: typeof size === 'number' ? `${size}px` : size,
    maxWidth: '90vw',
  }),
  blockSize: (size: number | string) => ({
    height: typeof size === 'number' ? `${size}px` : size,
    maxHeight: '90vh',
  }),
});

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * A snap point for the drawer's resting position: a fraction of the viewport (0-1), a pixel value
 * (as a number greater than 1), or a string in `px`/`rem` units.
 */
export type DrawerSnapPoint = number | string;

/**
 * Dismissal behavior, matching Dialog's `purpose` semantics. - required: Mandatory flows - disables
 * all exit methods; close only via onOpenChange - form: User forms/flows - prevents
 * backdrop/outside dismissal, allows Escape - info: Informational flows - allows all exit methods
 */
export type DrawerPurpose = 'required' | 'form' | 'info';

export interface DrawerProps<Payload = unknown> extends Omit<
  BaseProps<HTMLDivElement>,
  'children'
> {
  /** Ref forwarded to the popup element */
  ref?: Ref<HTMLDivElement>;
  /**
   * Whether the drawer is open. Omit this (and `onOpenChange`) to let the drawer manage its own
   * open state internally — pair that with `trigger` or call `element` from `useImperativeDrawer`.
   */
  isOpen?: boolean;
  /**
   * Callback fired when the drawer requests to open or close. `eventDetails.cancel()` aborts the
   * change — call it from your own handler (e.g. before showing a confirmation) to keep the drawer
   * open past the point `purpose` would otherwise have allowed the dismissal.
   */
  onOpenChange?: (isOpen: boolean, eventDetails: DrawerRootChangeEventDetails) => void;
  /**
   * Initial open state when `isOpen` is omitted (uncontrolled mode).
   *
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * An element that opens the drawer when activated, rendered inline wherever the drawer is placed.
   * Optional: omit it to trigger the drawer yourself, e.g. via `useImperativeDrawer`, your own
   * controlled `isOpen`/`onOpenChange`, or a detached `DrawerTrigger` sharing `handle`.
   */
  trigger?: ReactElement;
  /**
   * A handle from `createDrawerHandle()`, shared with one or more detached `DrawerTrigger` elements
   * rendered elsewhere in the tree, so they can open this drawer without lifting state.
   */
  handle?: BaseDrawer.Handle<Payload>;
  /**
   * Whether the drawer is modal: traps focus, locks page scroll, disables pointer interaction with
   * the rest of the page, and dims it with a backdrop. Set `'trap-focus'` to trap focus without
   * locking scroll or disabling outside interaction (no backdrop), or `false` for a fully non-modal
   * drawer (no backdrop, no focus trap).
   *
   * @default true
   */
  modal?: boolean | 'trap-focus';
  /**
   * Prevents the drawer from closing on outside presses. For non-modal drawers, also prevents
   * closing when focus moves outside the drawer.
   *
   * @default false
   */
  disablePointerDismissal?: boolean;
  /**
   * Renders an invisible edge strip that opens the drawer on a swipe gesture from that screen edge.
   * Only affects touch input; has no effect with a mouse.
   *
   * @default false
   */
  hasSwipeArea?: boolean;
  /**
   * Resting heights the drawer can snap to while being swiped, as fractions of the viewport (0-1),
   * pixel values (numbers greater than 1), or `px`/`rem` strings. Meaningful for `top`/ `bottom`
   * drawers; omit for a single fixed `size`.
   */
  snapPoints?: DrawerSnapPoint[];
  /** The currently active snap point. Use with `onSnapPointChange` to control it. */
  snapPoint?: DrawerSnapPoint | null;
  /** The initial snap point when uncontrolled. */
  defaultSnapPoint?: DrawerSnapPoint | null;
  /** Fires when the active snap point changes. */
  onSnapPointChange?: (
    snapPoint: DrawerSnapPoint | null,
    eventDetails: DrawerRoot.SnapPointChangeEventDetails,
  ) => void;
  /**
   * Disables velocity-based snap skipping, so drag distance alone determines the next snap point.
   *
   * @default false
   */
  snapToSequentialPoints?: boolean;
  /**
   * Which viewport edge the drawer slides in from.
   *
   * @default 'right'
   */
  side?: DrawerSide;
  /**
   * Size along the drawer's sliding axis: width for `left`/`right`, height for `top`/`bottom`.
   * Numbers are treated as pixels, strings are used as-is. Ignored while `snapPoints` is set.
   *
   * @default 384
   */
  size?: number | string;
  /** Heading text for the drawer. Always rendered for accessibility. */
  title: string;
  /** Supporting text shown below the title. */
  description?: string;
  /**
   * Configures how the drawer allows dismissal. See `DrawerPurpose`.
   *
   * @default 'info'
   */
  purpose?: DrawerPurpose;
  /** The content of the drawer. */
  children: ReactNode;
}

const DISMISS_REASONS_CASUAL = new Set(['outside-press', 'focus-out', 'swipe']);

const sideToSwipeDirection = {
  left: 'left',
  right: 'right',
  top: 'up',
  bottom: 'down',
} as const;

const swipeAreaOppositeDirection = {
  left: 'right',
  right: 'left',
  top: 'down',
  bottom: 'up',
} as const;

// Hoisted so `render` receives a stable element instead of a new one each render.
const titleRender = <Heading level={2} />;
const descriptionRender = <Text as="p" type="supporting" />;

/**
 * A panel that slides in from a viewport edge, layered above the page.
 *
 * Traps focus, locks page scroll, and restores focus to the previously focused element on close
 * (all configurable via `modal`). Pick one of several ways to drive it: - Uncontrolled: pass
 * `trigger`, drop the whole thing anywhere, and it manages its own open state. - Detached trigger:
 * pass `handle` (from `createDrawerHandle()`), and open it from a `DrawerTrigger` rendered anywhere
 * else in the tree sharing the same handle. - Controlled: pass `isOpen` and `onOpenChange`
 * yourself, e.g. from `useImperativeDrawer`, or when several triggers should open the same drawer.
 *
 * @example
 *   ```
 *   <Drawer trigger={<Button label="Open filters" />} title="Filters" side="right">
 *   <p>Filter controls go here.</p>
 *   </Drawer>
 *   ```;
 */
export function Drawer<Payload = unknown>({
  isOpen,
  onOpenChange,
  defaultOpen = false,
  trigger,
  handle,
  modal = true,
  disablePointerDismissal = false,
  hasSwipeArea = false,
  snapPoints,
  snapPoint,
  defaultSnapPoint,
  onSnapPointChange,
  snapToSequentialPoints = false,
  side = 'right',
  size = 384,
  title,
  description,
  purpose = 'info',
  children,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: DrawerProps<Payload>) {
  const isAxisInline = side === 'left' || side === 'right';
  const isControlled = isOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedOpen = isControlled ? isOpen : internalOpen;

  // Snap points take over sizing the popup; a fixed size only applies without them.
  let sizeStyle;
  if (snapPoints === undefined) {
    sizeStyle = isAxisInline ? dynamicStyles.inlineSize(size) : dynamicStyles.blockSize(size);
  }

  // @astryxdesign/core's mergeProps type-checks under tsc. oxlint's type-aware pass cannot resolve
  // it here. See the same note near DrawerIndent.tsx's mergeProps calls.
  // oxlint-disable-next-line no-unsafe-assignment, no-unsafe-call
  const merged = mergeProps(
    stylex.props(styles.popup, styles.reducedMotion, sideStyles[side], sizeStyle, xstyle),
    className,
    style,
  );

  const handleOpenChange = (open: boolean, eventDetails: DrawerRootChangeEventDetails) => {
    if (open) {
      onOpenChange?.(true, eventDetails);
      if (!isControlled && !eventDetails.isCanceled) {
        setInternalOpen(true);
      }
      return;
    }
    const { reason } = eventDetails;
    if (purpose === 'required' && reason !== 'imperative-action') {
      eventDetails.cancel();
      return;
    }
    if (purpose === 'form' && DISMISS_REASONS_CASUAL.has(reason)) {
      eventDetails.cancel();
      return;
    }
    onOpenChange?.(false, eventDetails);
    if (!isControlled && !eventDetails.isCanceled) {
      setInternalOpen(false);
    }
  };

  return (
    <BaseDrawer.Root
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
      swipeDirection={sideToSwipeDirection[side]}
      handle={handle}
      modal={modal}
      disablePointerDismissal={disablePointerDismissal}
      snapPoints={snapPoints}
      snapPoint={snapPoint}
      defaultSnapPoint={defaultSnapPoint}
      onSnapPointChange={onSnapPointChange}
      snapToSequentialPoints={snapToSequentialPoints}
    >
      {trigger !== undefined && <BaseDrawer.Trigger render={trigger} />}
      {hasSwipeArea && (
        <BaseDrawer.SwipeArea
          swipeDirection={swipeAreaOppositeDirection[side]}
          {...stylex.props(styles.swipeArea, swipeAreaSideStyles[side])}
        />
      )}
      <BaseDrawer.Portal>
        {modal === true && (
          <BaseDrawer.Backdrop {...stylex.props(styles.backdrop, styles.reducedMotion)} />
        )}
        <BaseDrawer.Viewport {...stylex.props(styles.viewport)}>
          <BaseDrawer.Popup ref={ref} {...rest} {...merged}>
            <div {...stylex.props(styles.header)}>
              <BaseDrawer.Title render={titleRender}>{title}</BaseDrawer.Title>
              {description !== undefined && (
                <BaseDrawer.Description render={descriptionRender}>
                  {description}
                </BaseDrawer.Description>
              )}
            </div>
            <BaseDrawer.Content {...stylex.props(styles.content)}>{children}</BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

Drawer.displayName = 'Drawer';
