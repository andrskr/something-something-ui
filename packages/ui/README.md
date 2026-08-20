# @acme/ui

The workspace's design-system boundary. Wraps `@astryxdesign/core` and `@astryxdesign/theme-neutral`
and re-exports the exact primitives apps are allowed to use.

Apps must consume Astryx only through this package, never by importing `@astryxdesign/core`
directly. This keeps the theme, component set, and StyleX bootstrap CSS centralized in one place.

- `src/index.ts` — component and theme re-exports
- `src/styles.css` — the reset + Astryx base + neutral theme cascade layers; import via
  `@acme/ui/styles.css`
