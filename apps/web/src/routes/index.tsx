import { Button, Drawer, OtpField, useImperativeDrawer } from '@acme/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({ component: Home });

const filtersContent = <p>Filter controls go here.</p>;
const settingsTrigger = <Button label="Open settings" />;

function Home() {
  const [count, setCount] = useState(0);
  const drawer = useImperativeDrawer();

  const handleOpenFilters = () => {
    drawer.show(filtersContent, {
      title: 'Filters',
      description: 'Narrow the results',
    });
  };

  return (
    <>
      <Button
        label={`Clicked ${count} times`}
        onClick={() => {
          setCount((current) => current + 1);
        }}
      />
      <OtpField label="Verification code" length={6} groupSize={3} hasAutoFocus />
      <Button label="Open filters" onClick={handleOpenFilters} />
      {drawer.element}
      <Drawer trigger={settingsTrigger} title="Settings" side="left">
        <p>Settings controls go here.</p>
      </Drawer>
    </>
  );
}
