import { EmptyState, Link } from "@acme/ui";

export function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
      actions={
        <Link href="/" isStandalone>
          Go to homepage
        </Link>
      }
    />
  );
}
