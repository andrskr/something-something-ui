import { LIGHTNINGCSS_TARGETS, astryxStylex } from "@astryxdesign/build/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import type { Plugin } from "vite-plus";

const astryxCorePackage = "@astryxdesign/core";
const astryxThemePackage = "@astryxdesign/theme-neutral";

function configureAstryxSsr(): Plugin {
  return {
    name: "web:configure-astryx-ssr",
    enforce: "post",
    configResolved(config) {
      const existingExcludes = config.environments.ssr.optimizeDeps.exclude ?? [];
      const existingIncludes = config.environments.ssr.optimizeDeps.include ?? [];
      config.environments.ssr.optimizeDeps.exclude = [
        ...new Set([
          ...existingExcludes.filter((packageName) => packageName !== astryxThemePackage),
          astryxCorePackage,
        ]),
      ];
      config.environments.ssr.optimizeDeps.include = [
        ...new Set([...existingIncludes, `${astryxThemePackage}/built`]),
      ];
    },
  };
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    noExternal: [astryxThemePackage],
  },
  plugins: [
    tanstackStart(),
    ...astryxStylex({
      rootDir: import.meta.dirname,
      lightningcssTargets: LIGHTNINGCSS_TARGETS,
    }),
    configureAstryxSsr(),
    viteReact(),
  ],
});
