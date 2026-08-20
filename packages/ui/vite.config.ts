import { LIGHTNINGCSS_TARGETS, astryxStylex } from '@astryxdesign/build/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

export default defineConfig({
  plugins: [
    ...astryxStylex({ rootDir: import.meta.dirname, lightningcssTargets: LIGHTNINGCSS_TARGETS }),
    react(),
  ],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
