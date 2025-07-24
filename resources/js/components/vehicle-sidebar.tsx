import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function VehicleSidebar() {
  return (
    <aside className="w-full max-w-xl lg:w-48">
      <nav className="flex flex-col space-y-1">
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href={route('vehicles.index')}>Daftar Kendaraan</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href={route('drivers.index')}>Daftar Sopir</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href={route('routes.index')}>Daftar Rute</Link>
        </Button>
      </nav>
    </aside>
  );
}
