import { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables';
import { BreadcrumbItem } from '@/types';
import ToggleTabs from '@/components/toggle-tabs';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Manajemen Pemesanan', href: route('bookings.index') },
];

export default function BookingIndex({ filter: initialFilter, success }: { filter?: string; success?: string }) {
  const dtRef = useRef<DataTableWrapperRef>(null);
  const [filter, setFilter] = useState(initialFilter || 'active');

  const columns = [
    { data: 'id', title: 'ID' },
    {
      data: 'user',
      title: 'Pengguna',
      render: (data: any) => data ? data.name : '-',
    },
    {
      data: 'schedule',
      title: 'Jadwal',
      render: (data: any) =>
        data
          ? `${data.departure_time} | ${data.vehicle?.plate_number ?? '-'} (${data.vehicle?.brand ?? '-'})`
          : '-',
    },
    {
      data: 'schedule',
      title: 'Rute',
      render: (data: any) =>
        data && data.route
          ? `${data.route.origin} - ${data.route.destination}`
          : '-',
    },
    { data: 'seats_booked', title: 'Kursi Dipesan' },
    { data: 'status', title: 'Status' },
    { data: 'booking_time', title: 'Waktu Pemesanan' },
    { data: 'created_at', title: 'Dibuat Pada' },
    { data: 'updated_at', title: 'Diperbarui Pada' },
    {
      data: null,
      title: 'Aksi',
      orderable: false,
      searchable: false,
      render: (_: null, __: string, booking: any) => {
        let html = '';
        if (booking.trashed) {
          html += `<button class="btn-restore ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 border border-green-700" data-id="${booking.id}">Pulihkan</button>`;
          html += `<button class="btn-force-delete ml-2 px-2 py-1 bg-destructive text-white rounded hover:bg-destructive/80 border border-destructive" data-id="${booking.id}">Hapus Permanen</button>`;
        } else {
          html += `<span class="inertia-link-cell" data-id="${booking.id}"></span>`;
          html += `<button data-id="${booking.id}" class="ml-2 px-2 py-1 bg-destructive text-white rounded hover:bg-destructive/80 border border-destructive btn-delete">
            Hapus
          </button>`;
        }
        return html;
      },
    },
  ];

  const drawCallback = () => {
    document.querySelectorAll('.inertia-link-cell').forEach((cell) => {
      const id = cell.getAttribute('data-id');
      if (id) {
        const root = ReactDOM.createRoot(cell);
        root.render(
          <Link
            href={route('bookings.edit', id)}
            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Ubah
          </Link>
        );
      }
    });

    const table = dtRef.current?.dt();
    if (table) {
      document.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (id) router.delete(route('bookings.destroy', Number(id)), {
            onSuccess: () => dtRef.current?.reload(),
          });
        });
      });
      document.querySelectorAll('.btn-restore').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (id) router.post(route('bookings.restore', Number(id)), {}, {
            onSuccess: () => dtRef.current?.reload(),
          });
        });
      });
      document.querySelectorAll('.btn-force-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (id) router.delete(route('bookings.force-delete', Number(id)), {
            onSuccess: () => dtRef.current?.reload(),
          });
        });
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pemesanan" />
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Manajemen Pemesanan</h1>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full flex-grow">
            <HeadingSmall title="Pemesanan" description="Kelola pemesanan untuk aplikasi Anda" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Daftar Pemesanan</h2>
              <Link href={route('bookings.create')}>
                <Button>Buat Pemesanan</Button>
              </Link>
            </div>
            <ToggleTabs tabs={['active', 'trashed', 'all']} active={filter} onChange={setFilter} />
            {success && (
              <div className="p-2 bg-green-100 text-green-800 rounded border border-green-300">{success}</div>
            )}
            <DataTableWrapper
              key={filter}
              ref={dtRef}
              ajax={{
                url: route('bookings.json') + '?filter=' + filter,
                type: 'POST',
                data: function (d: any) {
                  d._token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                  return d;
                },
              }}
              columns={columns}
              options={{ drawCallback }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
