import { describe, expect, it, vi } from 'vite-plus/test';
import { userEvent } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-react';

import { OtpField } from './OtpField.tsx';

describe('otpField', () => {
  it('renders with a label', async () => {
    const screen = await render(<OtpField label="Verification code" length={6} />);
    await expect.element(screen.getByText('Verification code')).toBeVisible();
  });

  it('renders length slots as textboxes', async () => {
    const screen = await render(<OtpField label="Code" length={4} />);
    expect(screen.getByRole('textbox').elements()).toHaveLength(4);
  });

  it('clicking the label focuses the first slot', async () => {
    const screen = await render(<OtpField label="Verification code" length={6} />);
    const slots = screen.getByRole('textbox');
    await screen.getByText('Verification code').click();
    await expect.element(slots.nth(0)).toHaveFocus();
  });

  it('focuses the first slot on mount when hasAutoFocus is set', async () => {
    const screen = await render(<OtpField label="Code" length={4} hasAutoFocus />);
    await expect.element(screen.getByRole('textbox').nth(0)).toHaveFocus();
  });

  it('fills slots left to right and reports each change', async () => {
    const handleChange = vi.fn<(value: string) => void>();
    const screen = await render(<OtpField label="Code" length={4} onChange={handleChange} />);
    await userEvent.type(screen.getByRole('textbox').nth(0), '123');
    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenLastCalledWith('123', expect.any(Object));
  });

  it('calls onComplete once every slot is filled', async () => {
    const handleComplete = vi.fn<(value: string) => void>();
    const screen = await render(<OtpField label="Code" length={4} onComplete={handleComplete} />);
    await userEvent.type(screen.getByRole('textbox').nth(0), '1234');
    expect(handleComplete).toHaveBeenCalledExactlyOnceWith('1234', expect.any(Object));
  });

  it('supports a controlled value', async () => {
    const screen = await render(
      <OtpField label="Code" length={4} value="12" onChange={() => {}} />,
    );
    await expect.element(screen.getByRole('textbox').nth(0)).toHaveValue('1');
    await expect.element(screen.getByRole('textbox').nth(1)).toHaveValue('2');
    await expect.element(screen.getByRole('textbox').nth(2)).toHaveValue('');
  });

  it('disables every slot when isDisabled is set', async () => {
    const screen = await render(<OtpField label="Code" length={4} isDisabled />);
    await expect.element(screen.getByRole('textbox').nth(0)).toBeDisabled();
    await expect.element(screen.getByRole('textbox').nth(3)).toBeDisabled();
  });

  it('marks every slot read-only when isReadOnly is set', async () => {
    const screen = await render(<OtpField label="Code" length={4} isReadOnly />);
    await expect.element(screen.getByRole('textbox').nth(0)).toHaveAttribute('readonly');
  });

  it('renders a status message and marks the group invalid on error', async () => {
    const screen = await render(
      <OtpField label="Code" length={4} status={{ type: 'error', message: 'Invalid code' }} />,
    );
    await expect.element(screen.getByText('Invalid code')).toBeVisible();
    await expect.element(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true');
  });

  it('inserts a separator every groupSize slots', async () => {
    const screen = await render(<OtpField label="Code" length={6} groupSize={3} />);
    expect(screen.getByRole('separator').elements()).toHaveLength(1);
  });

  it('sizes slots from the size scale', async () => {
    const screen = await render(<OtpField label="Code" length={1} size="lg" />);
    await expect.element(screen.getByRole('textbox').nth(0)).toHaveStyle({ height: '36px' });
  });

  it('shows a required indicator next to the label', async () => {
    const screen = await render(<OtpField label="Code" length={4} isRequired />);
    await expect.element(screen.getByText('Required')).toBeVisible();
  });

  it('forwards className and data-* attributes to the field root', async () => {
    const screen = await render(
      <OtpField label="Code" length={4} className="my-otp-field" data-testid="otp-field" />,
    );
    const root = screen.getByTestId('otp-field');
    await expect.element(root).toHaveClass('my-otp-field');
  });
});
