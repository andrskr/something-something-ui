import { describe, expect, it, vi } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

import { Drawer } from './Drawer.tsx';

const filtersTrigger = <button type="button">Open filters</button>;
const accountTrigger = <button type="button">Open account</button>;

async function clickOutside() {
  await page.elementLocator(document.body).click({ position: { x: 2, y: 2 } });
}

describe('drawer', () => {
  it('renders nothing when closed', async () => {
    const screen = await render(
      <Drawer isOpen={false} onOpenChange={() => {}} title="Filters">
        Content
      </Drawer>,
    );
    await expect.element(screen.getByText('Filters')).not.toBeInTheDocument();
  });

  it('renders the title and description when open', async () => {
    const screen = await render(
      <Drawer isOpen onOpenChange={() => {}} title="Filters" description="Narrow the results">
        Content
      </Drawer>,
    );
    await expect.element(screen.getByText('Filters')).toBeVisible();
    await expect.element(screen.getByText('Narrow the results')).toBeVisible();
  });

  it('names the dialog from the title', async () => {
    await render(
      <Drawer isOpen onOpenChange={() => {}} title="Filters">
        Content
      </Drawer>,
    );
    await expect.element(page.getByRole('dialog')).toHaveAccessibleName('Filters');
  });

  it('closes on Escape by default', async () => {
    const handleOpenChange = vi.fn<(isOpen: boolean) => void>();
    await render(
      <Drawer isOpen onOpenChange={handleOpenChange} title="Filters">
        Content
      </Drawer>,
    );
    await userEvent.keyboard('{Escape}');
    expect(handleOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.any(Object));
  });

  it('ignores Escape when purpose is required', async () => {
    const handleOpenChange = vi.fn<(isOpen: boolean) => void>();
    await render(
      <Drawer isOpen onOpenChange={handleOpenChange} title="Setup" purpose="required">
        Content
      </Drawer>,
    );
    await userEvent.keyboard('{Escape}');
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('closes on outside press when purpose is info', async () => {
    const handleOpenChange = vi.fn<(isOpen: boolean) => void>();
    await render(
      <Drawer isOpen onOpenChange={handleOpenChange} title="Filters">
        Content
      </Drawer>,
    );
    await clickOutside();
    expect(handleOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.any(Object));
  });

  it('ignores outside press when purpose is form', async () => {
    const handleOpenChange = vi.fn<(isOpen: boolean) => void>();
    await render(
      <Drawer isOpen onOpenChange={handleOpenChange} title="Edit profile" purpose="form">
        Content
      </Drawer>,
    );
    await clickOutside();
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('sizes the popup along the sliding axis', async () => {
    await render(
      <Drawer isOpen onOpenChange={() => {}} title="Filters" side="right" size={320}>
        Content
      </Drawer>,
    );
    await expect.element(page.getByRole('dialog')).toHaveStyle({ width: '320px' });
  });

  it('forwards className and data-* attributes to the popup', async () => {
    const screen = await render(
      <Drawer
        isOpen
        onOpenChange={() => {}}
        title="Filters"
        className="my-drawer"
        data-testid="drawer"
      >
        Content
      </Drawer>,
    );
    const popup = screen.getByTestId('drawer');
    await expect.element(popup).toHaveClass('my-drawer');
  });

  it('renders an uncontrolled drawer with a trigger, starting closed', async () => {
    const screen = await render(
      <Drawer trigger={filtersTrigger} title="Filters">
        Content
      </Drawer>,
    );
    await expect.element(screen.getByText('Open filters')).toBeVisible();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the uncontrolled drawer when its trigger is activated', async () => {
    const screen = await render(
      <Drawer trigger={filtersTrigger} title="Filters">
        Content
      </Drawer>,
    );
    await screen.getByText('Open filters').click();
    await expect.element(page.getByRole('dialog')).toHaveAccessibleName('Filters');
  });

  it('starts open when defaultOpen is set on an uncontrolled drawer', async () => {
    await render(
      <Drawer trigger={filtersTrigger} title="Filters" defaultOpen>
        Content
      </Drawer>,
    );
    await expect.element(page.getByRole('dialog')).toBeVisible();
  });

  it('closes the uncontrolled drawer on Escape', async () => {
    await render(
      <Drawer trigger={filtersTrigger} title="Filters" defaultOpen>
        Content
      </Drawer>,
    );
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('marks outside content inert while modal (the default)', async () => {
    await render(
      <>
        <button type="button">Outside button</button>
        <Drawer isOpen onOpenChange={() => {}} title="Filters">
          Content
        </Drawer>
      </>,
    );
    const outsideButton = document.querySelector('button');
    await expect.poll(() => outsideButton?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('leaves outside content interactive when modal is false', async () => {
    await render(
      <>
        <button type="button">Outside button</button>
        <Drawer isOpen onOpenChange={() => {}} title="Filters" modal={false}>
          Content
        </Drawer>
      </>,
    );
    const outsideButton = document.querySelector('button');
    await expect.poll(() => outsideButton?.closest('[aria-hidden="true"]')).toBeNull();
  });

  it('accepts snap points without error and stays visible', async () => {
    await render(
      <Drawer
        isOpen
        onOpenChange={() => {}}
        title="Filters"
        side="bottom"
        snapPoints={[0.3, 0.9]}
        defaultSnapPoint={0.3}
      >
        Content
      </Drawer>,
    );
    await expect.element(page.getByRole('dialog')).toBeVisible();
  });

  it('renders a swipe area without breaking the normal open flow', async () => {
    const screen = await render(
      <Drawer trigger={filtersTrigger} title="Filters" hasSwipeArea>
        Content
      </Drawer>,
    );
    await screen.getByText('Open filters').click();
    await expect.element(page.getByRole('dialog')).toBeVisible();
  });

  it('lets a consumer cancel a dismissal via eventDetails.cancel()', async () => {
    const handleOpenChange = vi.fn<(isOpen: boolean, eventDetails: { cancel: () => void }) => void>(
      (_isOpen, eventDetails) => {
        eventDetails.cancel();
      },
    );
    await render(
      <Drawer isOpen onOpenChange={handleOpenChange} title="Filters">
        Content
      </Drawer>,
    );
    await userEvent.keyboard('{Escape}');
    expect(handleOpenChange).toHaveBeenCalledExactlyOnceWith(false, expect.any(Object));
    await expect.element(page.getByRole('dialog')).toBeVisible();
  });

  it('supports nested drawers, closing only the topmost on Escape', async () => {
    await render(
      <Drawer trigger={filtersTrigger} title="Filters">
        <Drawer trigger={accountTrigger} title="Account">
          Nested content
        </Drawer>
      </Drawer>,
    );
    await page.getByText('Open filters').click();
    await page.getByText('Open account').click();
    // The outer drawer's content stays in the DOM but is legitimately aria-hidden while the
    // nested one is topmost — only one dialog should be exposed to assistive tech at a time.
    await expect.element(page.getByRole('dialog', { name: 'Account' })).toBeVisible();
    await expect.element(page.getByText('Filters', { exact: true })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog', { name: 'Account' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  });
});
