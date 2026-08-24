/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Drawer',
  displayName: 'Drawer',
  category: 'Overlay',
  keywords: ['drawer', 'side panel', 'sidebar', 'sheet', 'flyout', 'slide-over', 'filters panel'],

  usage: {
    description:
      'Drawer is a panel that slides in from a viewport edge, layered above the page. Use it for filters, settings, and detail panels that need more room than a Popover but should not take over the whole screen like a fullscreen Dialog. Do not use it for centered, content-sized dialogs; use Dialog for that.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Set purpose to match the flow: 'info' for anything dismissible, 'form' to block accidental outside-click dismissal while a user is mid-edit, 'required' for a mandatory step the user must complete via an explicit action.",
      },
      {
        guidance: true,
        description:
          'Pass trigger for a single, self-contained drawer dropped in one place. Use isOpen/onOpenChange instead when several triggers share one drawer, or when a hook like useImperativeDrawer already owns the open state.',
      },
      {
        guidance: true,
        description:
          'Pick side to match the content: right for filters and detail panels, bottom for mobile-style sheets, left for navigation.',
      },
      {
        guidance: false,
        description:
          'Use Drawer for a small, content-sized confirmation; use Dialog, which centers on screen instead of anchoring to an edge.',
      },
      {
        guidance: false,
        description:
          'Build a slide-in panel from Popover or a hand-rolled fixed div; Drawer already handles focus trapping, scroll locking, and edge-appropriate enter/exit transitions.',
      },
    ],
    anatomy: [
      {
        name: 'Backdrop',
        required: true,
        description:
          'Dimmed overlay behind the panel. Clicking it dismisses the drawer when purpose allows it.',
      },
      {
        name: 'Title',
        required: true,
        description: 'Heading that names the drawer. Always rendered for accessibility.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Supporting text shown below the title.',
      },
      {
        name: 'Content',
        required: true,
        description: 'Scrollable region holding the drawer body.',
      },
    ],
  },

  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Whether the drawer is open. Omit this (and onOpenChange) for an uncontrolled drawer driven by trigger or defaultOpen.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean, eventDetails) => void',
      description:
        'Fires when the drawer requests to open or close. Call eventDetails.cancel() to abort the change, e.g. to show a confirmation before a destructive close.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: 'Initial open state when isOpen is omitted (uncontrolled mode).',
      default: 'false',
    },
    {
      name: 'trigger',
      type: 'ReactElement',
      description:
        'An element that opens the drawer when activated, rendered inline wherever the drawer is placed. Omit it to trigger the drawer yourself.',
    },
    {
      name: 'handle',
      type: 'DrawerHandle<Payload>',
      description:
        'A handle from createDrawerHandle(), shared with one or more detached DrawerTrigger elements rendered elsewhere in the tree.',
    },
    {
      name: 'modal',
      type: "boolean | 'trap-focus'",
      description:
        "Whether the drawer traps focus, locks page scroll, disables outside pointer interaction, and shows a backdrop. 'trap-focus' traps focus only (no scroll lock, no outside-disable, no backdrop); false disables all of it.",
      default: 'true',
    },
    {
      name: 'disablePointerDismissal',
      type: 'boolean',
      description:
        'Prevents closing on outside presses. For non-modal drawers, also prevents closing when focus moves outside.',
      default: 'false',
    },
    {
      name: 'hasSwipeArea',
      type: 'boolean',
      description:
        'Renders an invisible edge strip that opens the drawer on a swipe gesture from that screen edge. Touch input only.',
      default: 'false',
    },
    {
      name: 'snapPoints',
      type: 'Array<number | string>',
      description:
        'Resting heights the drawer can snap to while being swiped: fractions of the viewport (0-1), pixel values (numbers greater than 1), or px/rem strings. Meaningful for top/bottom drawers.',
    },
    {
      name: 'snapPoint',
      type: 'number | string | null',
      description: 'The currently active snap point. Use with onSnapPointChange to control it.',
    },
    {
      name: 'defaultSnapPoint',
      type: 'number | string | null',
      description: 'The initial snap point when uncontrolled.',
    },
    {
      name: 'onSnapPointChange',
      type: '(snapPoint: number | string | null, eventDetails) => void',
      description: 'Fires when the active snap point changes.',
    },
    {
      name: 'snapToSequentialPoints',
      type: 'boolean',
      description:
        'Disables velocity-based snap skipping, so drag distance alone determines the next snap point.',
      default: 'false',
    },
    {
      name: 'title',
      type: 'string',
      description: 'Heading text for the drawer (always rendered for accessibility).',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Supporting text shown below the title.',
    },
    {
      name: 'side',
      type: "'left' | 'right' | 'top' | 'bottom'",
      description: 'Which viewport edge the drawer slides in from.',
      default: "'right'",
    },
    {
      name: 'size',
      type: 'number | string',
      description:
        'Size along the sliding axis: width for left/right, height for top/bottom. Numbers are pixels.',
      default: '384',
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        "Dismissal behavior, matching Dialog's purpose prop. 'required' disables Escape/outside dismissal; 'form' blocks outside-press but allows Escape; 'info' allows both.",
      default: "'info'",
    },
  ],

  playground: {
    defaults: {
      isOpen: true,
      title: 'Filters',
      description: 'Narrow the results',
      side: 'right',
    },
  },
};
