/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'DrawerClose',
  subComponentOf: 'Drawer',
  displayName: 'Drawer Close',
  description:
    'A button that closes the nearest Drawer when activated. Place it inside a Drawer’s children, e.g. next to a title or at the end of an action sheet.',
  props: [
    {
      name: 'render',
      type: 'ReactElement',
      description:
        'Custom element to render as the close control, e.g. an IconButton. Defaults to a plain button.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content of the default rendered button. Ignored when render is given.',
    },
  ],
};
