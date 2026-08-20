'use client';

import type { BaseProps } from '@astryxdesign/core/BaseProps';
import {
  Field,
  inputStatusBorderStyles,
  inputStatusFocusWithinStyles,
  inputStatusHoverShadowStyles,
  inputWrapperStyles,
} from '@astryxdesign/core/Field';
import {
  borderVars,
  colorVars,
  spacingVars,
  sizeVars,
  textSizeVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { OTPField } from '@base-ui/react/otp-field';
import * as stylex from '@stylexjs/stylex';
import { Fragment, useId, type Ref } from 'react';

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  input: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 0,
    paddingInline: 0,
    textAlign: 'center',
    fontFamily: typographyVars['--font-family-body'],
    color: colorVars['--color-text-primary'],
  },
  separator: {
    flexShrink: 0,
    width: spacingVars['--spacing-3'],
    height: borderVars['--border-width'],
    backgroundColor: colorVars['--color-border'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    width: sizeVars['--size-element-sm'],
    height: sizeVars['--size-element-sm'],
    fontSize: textSizeVars['--font-size-base'],
  },
  md: {
    width: sizeVars['--size-element-md'],
    height: sizeVars['--size-element-md'],
    fontSize: textSizeVars['--font-size-lg'],
  },
  lg: {
    width: sizeVars['--size-element-lg'],
    height: sizeVars['--size-element-lg'],
    fontSize: textSizeVars['--font-size-xl'],
  },
});

export type OtpFieldValidationType = 'numeric' | 'alpha' | 'alphanumeric' | 'none';
export type OtpFieldSize = 'sm' | 'md' | 'lg';

export interface OtpFieldStatus {
  type: 'error' | 'warning' | 'success';
  message?: string;
}

export interface OtpFieldProps extends Omit<BaseProps<HTMLDivElement>, 'children' | 'onChange'> {
  /** Ref forwarded to the field's root element */
  ref?: Ref<HTMLDivElement>;
  /** Number of character slots. */
  length: number;
  /** Label text for the field group (always rendered for accessibility). */
  label: string;
  /**
   * Whether to visually hide the label and description (still accessible to screen readers).
   *
   * @default false
   */
  isLabelHidden?: boolean;
  /** Description text displayed between the label and the slots. */
  description?: string;
  /** Current value. Provide with onChange to control the field. */
  value?: string;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string;
  /** Fires whenever the value changes. */
  onChange?: (value: string) => void;
  /** Fires once every slot is filled. */
  onComplete?: (value: string) => void;
  /**
   * Restricts which characters a slot accepts.
   *
   * @default 'numeric'
   */
  validationType?: OtpFieldValidationType;
  /**
   * Obscures entered characters while typing, like a password field.
   *
   * @default false
   */
  isMasked?: boolean;
  /** Inserts a visual separator every N slots, e.g. 3 for a 3+3 split of a 6-digit code. */
  groupSize?: number;
  /**
   * Size variant of the slots.
   *
   * @default 'md'
   */
  size?: OtpFieldSize;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   *
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required. Mutually exclusive with isOptional.
   *
   * @default false
   */
  isRequired?: boolean;
  /**
   * Disables all slots, preventing interaction and dimming the field.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Prevents editing while keeping the field focusable and readable.
   *
   * @default false
   */
  isReadOnly?: boolean;
  /** Validation status: applies a colored border and status message below the field. */
  status?: OtpFieldStatus;
  /**
   * Automatically focuses the first slot on mount.
   *
   * @default false
   */
  hasAutoFocus?: boolean;
  /** The HTML name attribute for the field, useful for form submissions. */
  htmlName?: string;
}

/**
 * OtpField collects a short, fixed-length code — a one-time passcode sent by SMS or email, for
 * example. Use it for verification and 2FA flows, not as a general short-text input; use TextInput
 * for that.
 */
export function OtpField({
  length,
  label,
  isLabelHidden = false,
  description,
  value,
  defaultValue,
  onChange,
  onComplete,
  validationType = 'numeric',
  isMasked = false,
  groupSize,
  size = 'md',
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  status,
  hasAutoFocus = false,
  htmlName,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: OtpFieldProps) {
  const inputID = useId();
  const labelID = useId();
  const descriptionID = description === undefined ? undefined : `${inputID}-desc`;
  const messageID = status?.message === undefined ? undefined : `${inputID}-status`;

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={inputID}
      labelID={labelID}
      descriptionID={descriptionID}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={status}
      statusVariant="detached"
      xstyle={xstyle}
      className={className}
      style={style}
      ref={ref}
      {...rest}
    >
      <OTPField.Root
        id={inputID}
        length={length}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        onValueComplete={onComplete}
        validationType={validationType}
        mask={isMasked}
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={isRequired}
        name={htmlName}
        aria-labelledby={labelID}
        aria-describedby={messageID ?? descriptionID}
        aria-invalid={status?.type === 'error' || undefined}
        data-size={size}
        data-status={status?.type}
        {...stylex.props(styles.root)}
      >
        {Array.from({ length }, (_, index) => (
          <Fragment key={index}>
            <OTPField.Input
              /* eslint-disable typescript/no-unsafe-argument, typescript/no-unsafe-member-access -- tsgolint cannot resolve the stylex.create() return types that @astryxdesign/core exports here (same class of cross-package generic-resolution gap as the FieldStatusInput case); plain tsc reports zero errors for this block. */
              {...stylex.props(
                inputWrapperStyles.base,
                sizeStyles[size],
                isDisabled && inputWrapperStyles.disabled,
                status && inputStatusBorderStyles[status.type],
                status && !isDisabled && inputStatusHoverShadowStyles[status.type],
                status && inputStatusFocusWithinStyles[status.type],
                styles.input,
              )}
              /* eslint-enable typescript/no-unsafe-argument, typescript/no-unsafe-member-access */
              // eslint-disable-next-line jsx-a11y/no-autofocus -- opt-in via hasAutoFocus (default false); expected UX for starting a verification step
              autoFocus={hasAutoFocus && index === 0}
            />
            {typeof groupSize === 'number' &&
              index < length - 1 &&
              (index + 1) % groupSize === 0 && (
                <OTPField.Separator {...stylex.props(styles.separator)} />
              )}
          </Fragment>
        ))}
      </OTPField.Root>
    </Field>
  );
}
