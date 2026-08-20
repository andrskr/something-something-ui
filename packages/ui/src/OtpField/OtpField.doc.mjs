/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'OtpField',
  displayName: 'OTP Field',
  category: 'Data Input',
  keywords: [
    'otp',
    'one-time-code',
    'one-time-password',
    '2fa',
    'mfa',
    'verification',
    'passcode',
    'pin',
  ],

  usage: {
    description:
      'OtpField collects a short, fixed-length code, like a one-time passcode sent by SMS or email. Use it for verification and 2FA flows. Do not use it for general short text; use TextInput for that.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Set validationType to match what the provider sends: 'numeric' for a digit code, 'alphanumeric' for a mixed code.",
      },
      {
        guidance: true,
        description:
          'Set hasAutoFocus on the field that starts a verification step, so the user can start typing immediately.',
      },
      {
        guidance: true,
        description:
          "Use onComplete to submit as soon as the last slot fills; don't make the user find and press a separate submit button for a fixed-length code.",
      },
      {
        guidance: true,
        description:
          'Use groupSize to split a long code into readable chunks, like 3+3 for a 6-digit code.',
      },
      {
        guidance: false,
        description:
          'Build a code input from separate TextInput components; OtpField already handles paste-a-full-code, backspace navigation, and per-slot focus movement.',
      },
      {
        guidance: false,
        description:
          'Use OtpField for a general short code like a zip code or a product SKU; use TextInput for free-form short text.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: 'Text that identifies the field group. Always rendered for accessibility.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Helper text between the label and the slots, e.g. where the code was sent.',
      },
      {
        name: 'Slot',
        required: true,
        description: 'One single-character input box. There are exactly length slots.',
      },
      {
        name: 'Separator',
        required: false,
        description: 'A visual divider between groups of slots, placed every groupSize slots.',
      },
      {
        name: 'Status message',
        required: false,
        description: 'Message shown below the field when status is set.',
      },
    ],
  },

  props: [
    {
      name: 'length',
      type: 'number',
      description: 'Number of character slots.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the field group (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label and description while keeping them accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and the slots.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Current value. Provide with onChange to control the field.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description: 'Initial value for an uncontrolled field.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Fires whenever the value changes.',
    },
    {
      name: 'onComplete',
      type: '(value: string) => void',
      description: 'Fires once every slot is filled.',
    },
    {
      name: 'validationType',
      type: "'numeric' | 'alpha' | 'alphanumeric' | 'none'",
      description: 'Restricts which characters a slot accepts.',
      default: "'numeric'",
    },
    {
      name: 'isMasked',
      type: 'boolean',
      description: 'Obscures entered characters while typing, like a password field.',
      default: 'false',
    },
    {
      name: 'groupSize',
      type: 'number',
      description:
        'Inserts a visual separator every N slots, e.g. 3 for a 3+3 split of a 6-digit code.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant of the slots.',
      default: "'md'",
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Displays an "Optional" indicator next to the label. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        'Displays a "Required" indicator next to the label. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables all slots, preventing interaction and dimming the field.',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: 'Prevents editing while keeping the field focusable and readable.',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        'Validation status: applies a colored border and shows a message below the field. Error type also sets aria-invalid.',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Automatically focuses the first slot on mount.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: 'The HTML name attribute for the field, useful for form submissions.',
    },
  ],

  playground: {
    defaults: {
      label: 'Verification code',
      length: 6,
      groupSize: 3,
    },
  },
};
