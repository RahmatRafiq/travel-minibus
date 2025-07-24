import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Car, User, Route as RouteIcon } from 'lucide-react';

export default function VehicleSidebar() {
  return (
    <aside className="w-full max-w-xl lg:w-48">
      <nav className="flex flex-col space-y-1">
        <Button asChild variant="ghost" size="sm" className="justify-start gap-2">
          <Link href={route('vehicles.index')}>
            <Car className="w-4 h-4" />
            Daftar Kendaraan
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="justify-start gap-2">
          <Link href={route('drivers.index')}>
            <User className="w-4 h-4" />
            Daftar Sopir
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="justify-start gap-2">
          <Link href={route('routes.index')}>
            <RouteIcon className="w-4 h-4" />
            Daftar Rute
          </Link>
        </Button>
      </nav>
    </aside>
  );
}
