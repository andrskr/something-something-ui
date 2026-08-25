import { describe, expect, it } from 'vite-plus/test';

import { profile } from './profile.ts';

describe('profile', () => {
  it('collects Foundation components across named and type-only imports', () => {
    const p = profile(
      [
        "import { Card } from '@astryxdesign/core/Card';",
        "import { HStack, VStack } from '@astryxdesign/core/Layout';",
        "import type { TableColumn } from '@astryxdesign/core/Table';",
      ].join('\n'),
    );
    expect(p.components).toStrictEqual(['Card', 'HStack', 'TableColumn', 'VStack']);
  });

  it('records which module each component came from', () => {
    // The real split seen between Arms: same components, different import form.
    const viaLayout = profile("import { HStack, VStack } from '@astryxdesign/core/Layout';");
    const viaOwn = profile(
      [
        "import { HStack } from '@astryxdesign/core/HStack';",
        "import { VStack } from '@astryxdesign/core/VStack';",
      ].join('\n'),
    );
    expect(viaLayout.components).toStrictEqual(viaOwn.components);
    expect(viaLayout.sources.HStack).not.toBe(viaOwn.sources.HStack);
  });

  it('counts a third-party chart library as a stack', () => {
    expect(profile("import { LineChart } from 'recharts';").stacks).toStrictEqual(['recharts']);
  });

  it('leaves StyleX out of stacks, since the Foundation mandates it', () => {
    expect(profile("import * as stylex from '@stylexjs/stylex';").stacks).toStrictEqual([]);
  });

  it('ignores router and runtime imports, which say nothing about design', () => {
    const p = profile(
      [
        "import { createFileRoute } from '@tanstack/react-router';",
        "import { useState } from 'react';",
      ].join('\n'),
    );
    expect(p.stacks).toStrictEqual([]);
  });

  it('ignores relative imports', () => {
    expect(profile("import { Thing } from './thing.ts';").stacks).toStrictEqual([]);
  });

  it('reports no stack for a page that hand-rolls its chart', () => {
    // A real Arm-off Run did exactly this: SVG by hand, no chart dependency at all.
    expect(profile("import { Card } from '@astryxdesign/core/Card';").stacks).toStrictEqual([]);
  });
});
