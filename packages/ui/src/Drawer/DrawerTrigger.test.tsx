import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

import { createDrawerHandle } from './createDrawerHandle.ts';
import { Drawer } from './Drawer.tsx';
import { DrawerTrigger } from './DrawerTrigger.tsx';

const handle = createDrawerHandle();
const detachedTriggerButton = <button type="button">Open from elsewhere</button>;

describe('drawerTrigger', () => {
  it('opens a drawer it does not share a parent with, via a shared handle', async () => {
    await render(
      <>
        <DrawerTrigger handle={handle}>{detachedTriggerButton}</DrawerTrigger>
        <div>
          <Drawer handle={handle} title="Filters">
            Content
          </Drawer>
        </div>
      </>,
    );
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await page.getByText('Open from elsewhere').click();
    await expect.element(page.getByRole('dialog')).toHaveAccessibleName('Filters');
  });
});
