import { EmptyState, Link } from '@acme/ui';

const homeLink = (
  <Link href="/" isStandalone>
    Go to homepage
  </Link>
);

export function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
      actions={homeLink}
    />
  );
}
