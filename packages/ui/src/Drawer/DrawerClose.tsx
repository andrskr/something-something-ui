'use client';

import type { BaseProps } from '@astryxdesign/core/BaseProps';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ReactElement, ReactNode, Ref } from 'react';

export interface DrawerCloseProps extends Omit<BaseProps<HTMLButtonElement>, 'children'> {
  /** Ref forwarded to the button element */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Custom element to render as the close control, e.g. an `IconButton`. Defaults to a plain
   * button.
   */
  render?: ReactElement;
  /** Content of the default rendered button. Ignored when `render` is given. */
  children?: ReactNode;
}

/**
 * A button that closes the nearest `Drawer` when activated. Place it inside a `Drawer`'s children.
 *
 * @example
 *   ```
 *   <Drawer trigger={<Button label="Open filters" />} title="Filters">
 *   <DrawerClose render={<IconButton label="Close" icon={<XIcon />} variant="ghost" />} />
 *   </Drawer>
 *   ```;
 */
export function DrawerClose({ render, children, ref, ...rest }: DrawerCloseProps) {
  return (
    <BaseDrawer.Close ref={ref} render={render} {...rest}>
      {children}
    </BaseDrawer.Close>
  );
}

DrawerClose.displayName = 'DrawerClose';
