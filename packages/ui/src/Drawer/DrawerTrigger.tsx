'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ReactElement } from 'react';

export interface DrawerTriggerProps<Payload = unknown> {
  /** The handle shared with the `Drawer` this trigger opens, from `createDrawerHandle()`. */
  handle: BaseDrawer.Handle<Payload>;
  /** The element that opens the drawer when activated. */
  children: ReactElement;
}

/**
 * Opens a `Drawer` from anywhere in the tree, without being its child or sharing a parent's state.
 * Connect it to a `Drawer` by passing the same `handle` to both.
 *
 * @example
 *   ```
 *   const handle = createDrawerHandle();
 *   // Elsewhere in the tree:
 *   <DrawerTrigger handle={handle}>
 *   <Button label="Open filters" />
 *   </DrawerTrigger>
 *   // And elsewhere again:
 *   <Drawer handle={handle} title="Filters">
 *   <p>Filter controls go here.</p>
 *   </Drawer>
 *   ```;
 */
export function DrawerTrigger<Payload = unknown>({
  handle,
  children,
}: DrawerTriggerProps<Payload>) {
  return <BaseDrawer.Trigger handle={handle} render={children} />;
}

DrawerTrigger.displayName = 'DrawerTrigger';
