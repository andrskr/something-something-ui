'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { Drawer, type DrawerProps } from './Drawer.tsx';

export type DrawerOptions = Omit<DrawerProps, 'isOpen' | 'onOpenChange' | 'children'>;

export interface ImperativeDrawerReturn {
  /** Show the drawer with the given content. */
  show: (content: ReactNode, options: DrawerOptions) => void;
  /** Hide the drawer. */
  hide: () => void;
  /** Whether the drawer is currently open. */
  isOpen: boolean;
  /** Render this in your JSX tree. */
  element: ReactNode;
}

/**
 * Imperative drawer — show/hide without managing isOpen state yourself.
 *
 * @example
 *   ```
 *   const drawer = useImperativeDrawer();
 *   <Button
 *   label="Open filters"
 *   onClick={() => drawer.show(<FiltersForm />, { title: 'Filters' })}
 *   />
 *   return <>{drawer.element}</>;
 *   ```;
 */
export function useImperativeDrawer(
  defaultOptions?: Partial<DrawerOptions>,
): ImperativeDrawerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  // The drawer element must mount closed on the very first render — not only once show() has run
  // — otherwise the first open has no prior closed render to transition from, and it appears
  // instantly instead of sliding in. The placeholder title is never visible: it only reaches the
  // DOM once isOpen is true, and show() always replaces it before that happens.
  const [options, setOptions] = useState<DrawerOptions>(() => ({
    title: '',
    ...defaultOptions,
  }));

  const show = useCallback(
    (newContent: ReactNode, newOptions: DrawerOptions) => {
      setContent(newContent);
      setOptions({ ...defaultOptions, ...newOptions });
      setIsOpen(true);
    },
    [defaultOptions],
  );

  const hide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsOpen(false);
    }
  }, []);

  const element = useMemo(
    () => (
      <Drawer isOpen={isOpen} onOpenChange={handleOpenChange} {...options}>
        {content}
      </Drawer>
    ),
    [isOpen, content, options, handleOpenChange],
  );

  return { show, hide, isOpen, element };
}
