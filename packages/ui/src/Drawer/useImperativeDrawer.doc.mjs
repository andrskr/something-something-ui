/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'useImperativeDrawer',
  subComponentOf: 'Drawer',
  displayName: 'useImperativeDrawer',
  description:
    'Hook for showing a drawer without managing isOpen state. Call drawer.show(content, options) to open and drawer.hide() to close. Render drawer.element in your JSX tree.',
  props: [
    {
      name: 'show',
      type: '(content: ReactNode, options: DrawerOptions) => void',
      description:
        'Show the drawer with the given content. Options are the same as Drawer props minus isOpen/onOpenChange/children, so title is required.',
    },
    {
      name: 'hide',
      type: '() => void',
      description: 'Hide the drawer.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the drawer is currently open.',
    },
    {
      name: 'element',
      type: 'ReactNode',
      description: 'The drawer element: render this in your JSX tree.',
    },
  ],
};

export const docsDense = {
  name: 'useImperativeDrawer',
  description:
    'hook to show a drawer w/o managing isOpen state; call drawer.show(content, options) to open + drawer.hide() to close; render drawer.element in your JSX tree',
  propDescriptions: {
    show: 'show the drawer with given content; options = Drawer props minus isOpen/onOpenChange/children (title required)',
    hide: 'hide the drawer',
    isOpen: 'whether the drawer is currently open',
    element: 'the drawer element: render this in your JSX tree',
  },
};
