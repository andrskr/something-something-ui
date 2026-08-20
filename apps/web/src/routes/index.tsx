import { Button, OtpField } from '@acme/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button
        label={`Clicked ${count} times`}
        onClick={() => {
          setCount((current) => current + 1);
        }}
      />
      <OtpField label="Verification code" length={6} groupSize={3} hasAutoFocus />
    </>
  );
}
