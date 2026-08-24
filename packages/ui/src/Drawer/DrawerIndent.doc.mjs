/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'DrawerIndent',
  subComponentOf: 'Drawer',
  displayName: 'Drawer Indent',
  description:
    'The iOS-style "indent" effect: DrawerProvider, DrawerIndentBackground, and DrawerIndent work together to scale down and round the corners of your app while any Drawer within the same provider is open, revealing a background layer around its edges. Wrap your app once: DrawerProvider > DrawerIndentBackground + DrawerIndent(children).',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: "Your app's main UI.",
      required: true,
    },
  ],
};
