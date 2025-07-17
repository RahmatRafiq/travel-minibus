import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function VehicleSidebar() {
  return (
    <aside className="w-full max-w-xl lg:w-48">
      <nav className="flex flex-col space-y-1">
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/vehicles">Vehicle List</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/drivers">Driver List</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/routes">Route List</Link>
        </Button>
      </nav>
    </aside>
  );
}
