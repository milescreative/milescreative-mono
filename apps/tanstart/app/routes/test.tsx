import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/test')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="text-6xl">Heading</div>
      <div className="text-6xl font-arial">Heading</div>
    </>
  );
}
