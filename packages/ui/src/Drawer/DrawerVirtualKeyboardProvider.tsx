'use client';

import { Drawer as BaseDrawer } from '@base-ui/react/drawer';

/**
 * Keeps form fields visible above the software keyboard inside a bottom-sheet `Drawer` (typically
 * `side="bottom"` with `snapPoints`). Wrap the drawer's children with it — it needs to be inside a
 * `Drawer`, not standalone at the app root.
 *
 * @example
 *   ```
 *   <Drawer trigger={<Button label="Add note" />} title="Add note" side="bottom" snapPoints={[0.5, 1]}>
 *   <DrawerVirtualKeyboardProvider>
 *   <TextArea label="Note" />
 *   </DrawerVirtualKeyboardProvider>
 *   </Drawer>
 *   ```;
 */
export const DrawerVirtualKeyboardProvider = BaseDrawer.VirtualKeyboardProvider;
