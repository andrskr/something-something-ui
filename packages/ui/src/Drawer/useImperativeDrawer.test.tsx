import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-react';

import { useImperativeDrawer } from './useImperativeDrawer.tsx';

function TestHarness() {
  const drawer = useImperativeDrawer({ className: 'default-drawer' });

  const content = (
    <div>
      <p>Drawer content</p>
      <button type="button" onClick={drawer.hide}>
        Close
      </button>
    </div>
  );

  const handleOpen = () => {
    drawer.show(content, { title: 'Filters' });
  };

  return (
    <div>
      <button type="button" onClick={handleOpen}>
        Open
      </button>
      <span data-testid="status">{drawer.isOpen ? 'open' : 'closed'}</span>
      {drawer.element}
    </div>
  );
}

describe('useImperativeDrawer', () => {
  it('starts closed', async () => {
    const screen = await render(<TestHarness />);
    await expect.element(screen.getByTestId('status')).toHaveTextContent('closed');
  });

  it('opens on show() and renders the given content and title', async () => {
    const screen = await render(<TestHarness />);
    await screen.getByText('Open').click();
    await expect.element(screen.getByTestId('status')).toHaveTextContent('open');
    await expect.element(screen.getByText('Drawer content')).toBeVisible();
    await expect.element(screen.getByRole('dialog')).toHaveAccessibleName('Filters');
  });

  it('closes on hide()', async () => {
    const screen = await render(<TestHarness />);
    await screen.getByText('Open').click();
    await expect.element(screen.getByTestId('status')).toHaveTextContent('open');
    await screen.getByText('Close').click();
    await expect.element(screen.getByTestId('status')).toHaveTextContent('closed');
  });

  it('applies default options passed to the hook', async () => {
    const screen = await render(<TestHarness />);
    await screen.getByText('Open').click();
    await expect.element(screen.getByRole('dialog')).toHaveClass('default-drawer');
  });
});
