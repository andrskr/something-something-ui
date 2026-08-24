import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-react';

import { Drawer } from './Drawer.tsx';
import { DrawerVirtualKeyboardProvider } from './DrawerVirtualKeyboardProvider.tsx';

describe('drawerVirtualKeyboardProvider', () => {
  it('renders its children inside a drawer', async () => {
    const screen = await render(
      <Drawer isOpen onOpenChange={() => {}} title="Add note" side="bottom">
        <DrawerVirtualKeyboardProvider>
          <p>Bottom sheet form</p>
        </DrawerVirtualKeyboardProvider>
      </Drawer>,
    );
    await expect.element(screen.getByText('Bottom sheet form')).toBeVisible();
  });
});
