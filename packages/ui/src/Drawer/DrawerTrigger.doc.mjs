/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'DrawerTrigger',
  subComponentOf: 'Drawer',
  displayName: 'Drawer Trigger',
  description:
    'Opens a Drawer from anywhere in the tree, without being its child or sharing a parent. Connect it to a Drawer by passing the same handle (from createDrawerHandle()) to both.',
  props: [
    {
      name: 'handle',
      type: 'DrawerHandle<Payload>',
      description: 'The handle shared with the Drawer this trigger opens.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactElement',
      description: 'The element that opens the drawer when activated.',
      required: true,
    },
  ],
};
