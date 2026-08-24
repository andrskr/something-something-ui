import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

import { Drawer } from './Drawer.tsx';
import { DrawerClose } from './DrawerClose.tsx';

const filtersTrigger = <button type="button">Open filters</button>;

describe('drawerClose', () => {
  it('closes the drawer when activated', async () => {
    await render(
      <Drawer trigger={filtersTrigger} title="Filters">
        <DrawerClose>Close</DrawerClose>
      </Drawer>,
    );
    await page.getByText('Open filters').click();
    await expect.element(page.getByRole('dialog')).toBeVisible();

    await page.getByText('Close').click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });
});
