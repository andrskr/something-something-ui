/**
 * Photograph a route from a prepared worktree.
 *
 * One camera, used for every Arm and for the Ideal: same viewport, same theme, same wait. A
 * comparison is only fair if the pictures were taken the same way.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

import { chromium } from 'playwright';

/** The camera. Change it here and every picture changes together. */
export const CAMERA = { width: 1440, height: 900, theme: 'light' } as const;

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const a = s.address();
      if (a === null || typeof a === 'string') {
        reject(new Error('could not take a port'));
        return;
      }
      const { port } = a;
      s.close(() => {
        resolve(port);
      });
    });
  });
}

const sleep = async (ms: number) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

/** Polling is the point here: the server comes up when it comes up, so these await in order. */
async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop -- sequential by design; the next probe depends on the last failing
    const up = await fetch(url).then(
      (r) => r.ok,
      () => false,
    );
    if (up) return;
    // eslint-disable-next-line no-await-in-loop -- back off between probes
    await sleep(300);
  }
  throw new Error(`dev server never answered on ${url}`);
}

export async function shoot(worktree: string, route: string, outFile: string): Promise<void> {
  const port = await freePort();
  // vp dev binds ::1 by default, so a probe on 127.0.0.1 hangs against a server that is up.
  // Bind it explicitly rather than trusting localhost DNS ordering.
  const dev = spawn('vp', ['dev', '--host', '127.0.0.1', '--port', String(port)], {
    cwd: `${worktree}/apps/web`,
    stdio: 'ignore',
    detached: true,
  });

  try {
    const base = `http://127.0.0.1:${port}`;
    await waitForServer(base, 90_000);

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: CAMERA.width, height: CAMERA.height },
        colorScheme: CAMERA.theme,
      });
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
      // Charts animate in. Settle before the shutter.
      await page.waitForTimeout(1200);
      await page.screenshot({ path: outFile, fullPage: true });
    } finally {
      await browser.close();
    }
  } finally {
    if (dev.pid !== undefined) {
      try {
        process.kill(-dev.pid, 'SIGTERM');
      } catch {
        dev.kill('SIGTERM');
      }
    }
  }
}
