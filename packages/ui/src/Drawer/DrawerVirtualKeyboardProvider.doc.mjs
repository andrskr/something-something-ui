/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'DrawerVirtualKeyboardProvider',
  subComponentOf: 'Drawer',
  displayName: 'Drawer Virtual Keyboard Provider',
  description:
    'Keeps form fields visible above the software keyboard inside a bottom-sheet Drawer (typically side="bottom" with snapPoints). Wrap the Drawer’s children with it — it must be inside a Drawer, not standalone at the app root.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The drawer content containing form fields.',
    },
  ],
};
