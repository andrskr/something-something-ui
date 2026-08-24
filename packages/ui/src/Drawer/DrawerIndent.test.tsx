import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

import { Drawer } from './Drawer.tsx';
import { DrawerIndent, DrawerIndentBackground, DrawerProvider } from './DrawerIndent.tsx';

const filtersTrigger = <button type="button">Open filters</button>;

describe('drawerIndent', () => {
  it('scales down while a drawer within the same provider is open', async () => {
    const screen = await render(
      <DrawerProvider>
        <DrawerIndentBackground />
        <DrawerIndent data-testid="indent">
          <Drawer trigger={filtersTrigger} title="Filters">
            Content
          </Drawer>
        </DrawerIndent>
      </DrawerProvider>,
    );
    const indent = screen.getByTestId('indent');
    await expect.element(indent).not.toHaveStyle({ transform: 'scale(0.95)' });

    await page.getByText('Open filters').click();
    await expect.element(indent).toHaveStyle({ transform: 'scale(0.95)' });
  });
});
