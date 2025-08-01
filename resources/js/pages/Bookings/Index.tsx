import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables';
import { BreadcrumbItem } from '@/types';
import ToggleTabs from '@/components/toggle-tabs';
import { Booking } from '@/types/Booking';
import { BookingPassenger } from '@/types/BookingPassenger';
import { ProfileCustomer } from '@/types/ProfileCustomer';
import { Schedule } from '@/types/Schedule';

type BookingTableRow = {
  id: number;
  user?: {
    name?: string;
    profile?: ProfileCustomer;
  };
  schedule?: Schedule;
  seats_booked?: number;
  status?: string;
  trashed?: boolean;
  booking_time?: string;
  created_at?: string;
  updated_at?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Manajemen Pemesanan', href: route('bookings.index') },
];

export default function BookingIndex({ filter: initialFilter, success }: { filter?: string; success?: string }) {
  const dtRef = useRef<DataTableWrapperRef>(null);
  const [filter, setFilter] = useState(initialFilter || 'active');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState('pending');

  const columns = [
    {
      data: null,
      title: '',
      orderable: false,
      searchable: false,
      className: 'details-control',
      render: () => '<span style="cursor: pointer;">+</span>',
    },
    {
      data: 'id',
      title: 'ID',
      render: (data: unknown, _type: string, row: unknown, _meta: unknown) => {
        const booking = row as BookingTableRow;
        const disabled = booking.status === 'confirmed' ? 'disabled' : '';
        return `<input type="checkbox" class="bulk-checkbox" data-id="${booking.id}" ${selectedIds.includes(booking.id) ? 'checked' : ''} ${disabled} /> ${booking.id}`;
      },
    },
    { data: 'reference', title: 'Referensi' },
    {
      data: 'user',
      title: 'Pengguna',
      render: (data: unknown, _type: string, row: unknown, _meta: unknown) => {
        const booking = row as BookingTableRow;
        return booking.user?.name ?? '-';
      },
    },
    {
      data: 'schedule',
      title: 'Jadwal',
      render: (data: unknown, _type: string, row: unknown, _meta: unknown) => {
        const booking = row as BookingTableRow;
        const schedule = booking.schedule;
        return schedule
          ? `${schedule.departure_time ?? '-'} | ${schedule.vehicle?.plate_number ?? '-'} (${schedule.vehicle?.brand ?? '-'})`
          : '-';
      },
    },
    {
      data: 'schedule',
      title: 'Rute',
      render: (data: unknown, _type: string, row: unknown, _meta: unknown) => {
        const booking = row as BookingTableRow;
        const schedule = booking.schedule;
        return schedule && schedule.route
          ? `${schedule.route.origin ?? '-'} - ${schedule.route.destination ?? '-'}`
          : '-';
      },
    },
    { data: 'seats_booked', title: 'Kursi Dipesan' },
    {
      data: 'status',
      title: 'Status',
      render: (data: unknown, _type: string, row: unknown, _meta: unknown) => {
        const booking = row as BookingTableRow;
        const status = booking.status ?? '';
        if (!booking.trashed) {
          const disabled = status === 'confirmed' ? 'disabled' : '';
          return `<select class="booking-status-dropdown bg-blue-100 text-blue-900 font-semibold rounded px-2 py-1" data-id="${booking.id}" ${disabled}>
            <option value="pending"${status === 'pending' ? ' selected' : ''} style="background:#fef3c7;color:#92400e;">Pending</option>
            <option value="confirmed"${status === 'confirmed' ? ' selected' : ''} style="background:#d1fae5;color:#065f46;">Confirmed</option>
            <option value="cancelled"${status === 'cancelled' ? ' selected' : ''} style="background:#fee2e2;color:#991b1b;">Cancelled</option>
          </select>`;
        }
        return status;
      },
    },
    { data: 'booking_time', title: 'Waktu Pemesanan' },
    { data: 'created_at', title: 'Dibuat Pada' },
    {
      data: null,
      title: 'Aksi',
      orderable: false,
      searchable: false,
      render: (_data: unknown, _type: string, row: unknown, _meta: unknown) => {
        const booking = row as BookingTableRow;
        let html = '';
        if (booking.trashed) {
          html += `<button class="btn-restore ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 border border-green-700" data-id="${booking.id}">Pulihkan</button>`;
          html += `<button class="btn-force-delete ml-2 px-2 py-1 bg-destructive text-white rounded hover:bg-destructive/80 border border-destructive" data-id="${booking.id}">Hapus Permanen</button>`;
        } else {
          html += `<button data-id="${booking.id}" class="ml-2 px-2 py-1 bg-destructive text-white rounded hover:bg-destructive/80 border border-destructive btn-delete">
            Hapus
          </button>`;
        }
        return html;
      },
    },
  ];

  const formatBookingDetails = (booking: BookingTableRow) => {
 
    const passengers: BookingPassenger[] = (booking as any).passengers || [];
    return `
      <div class="p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <strong class="block text-gray-800">Detail Penumpang:</strong>
        <button class="btn-copy-passenger px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm" style="margin-left:8px;">Copy</button>
      </div>
      <ul id="passenger-list-${booking.id}">
        ${passengers.length === 0 ? '<li class="ml-4 list-disc text-gray-700">Tidak ada data penumpang</li>' :
        passengers.map((p) => `
          <li class="ml-4 list-disc text-gray-700">
          <b>Nama:</b> ${p.name ?? '-'}<br/>
          <b>No. Telepon:</b> ${p.phone_number ?? '-'}<br/>
          <b>Alamat Penjemputan:</b> ${p.pickup_address ?? '-'}<br/>
          </li>
        `).join('')
        }
      </ul>
      </div>
      <script>
      setTimeout(() => {
        const btn = document.querySelector('.btn-copy-passenger');
        if (btn) {
        btn.onclick = function() {
          const ul = document.getElementById('passenger-list-${booking.id}');
          if (!ul) return;
          let text = '';
          ul.querySelectorAll('li').forEach(li => {
          text += li.innerText + '\\n';
          });
          navigator.clipboard.writeText(text.trim());
          btn.innerText = 'Copied!';
          setTimeout(() => btn.innerText = 'Copy', 1200);
        };
        }
      }, 100);
      </script>
    `;
  };
  const handleDelete = (id: number) => {
    router.delete(route('bookings.destroy', id), {
      onSuccess: () => dtRef.current?.reload(),
    });
  };

  const handleRestore = (id: number) => {
    router.post(route('bookings.restore', id), {}, {
      onSuccess: () => dtRef.current?.reload(),
    });
  };

  const handleForceDelete = (id: number) => {
    router.delete(route('bookings.force-delete', id), {
      onSuccess: () => dtRef.current?.reload(),
    });
  };
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
      document.querySelectorAll('.details-control').forEach((cell) => {
        cell.addEventListener('click', function () {
          const tr = cell.closest('tr');
          if (!tr) return;
          const row = table.row(tr);
          if (row.child.isShown()) {
            row.child.hide();
            tr.classList.remove('shown');
            cell.innerHTML = '<span style="cursor: pointer;">+</span>';
          } else {
            row.child(formatBookingDetails(row.data())).show();
            tr.classList.add('shown');
            cell.innerHTML = '<span style="cursor: pointer;">-</span>';
          }
        });
      });
      document.querySelectorAll('.bulk-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
          const id = Number(checkbox.getAttribute('data-id'));
          if ((e.target as HTMLInputElement).checked) {
            setSelectedIds((prev) => [...prev, id]);
          } else {
            setSelectedIds((prev) => prev.filter((i) => i !== id));
          }
        });
      });
      document.querySelectorAll('.booking-status-dropdown').forEach((dropdown) => {
        dropdown.addEventListener('change', (e) => {
          if ((e.target as HTMLSelectElement).disabled) return;
          const id = dropdown.getAttribute('data-id');
          const value = (e.target as HTMLSelectElement).value;
          if (id && value) {
            router.post(route('bookings.update-status', Number(id)), { status: value }, {
              onSuccess: () => dtRef.current?.reload(),
            });
          }
        });
      });
      document.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (id) handleDelete(Number(id));
        });
      });
      document.querySelectorAll('.btn-restore').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (id) handleRestore(Number(id));
        });
      });
      document.querySelectorAll('.btn-force-delete').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          if (id) handleForceDelete(Number(id));
        });
      });
    };
  }

  const handleBulkUpdate = () => {
    if (selectedIds.length === 0) return;
    const table = dtRef.current?.dt();
    let confirmedSelected = false;
    if (table) {
      const data: BookingTableRow[] = table.rows().data().toArray();
      for (const id of selectedIds) {
        const booking = data.find((row) => row && 'id' in row && row.id === id);
        if (booking && (booking as Booking).status === 'confirmed') {
          confirmedSelected = true;
          break;
        }
      }
    }
    if (confirmedSelected) {
      alert('Tidak bisa bulk update status untuk booking yang sudah confirmed.');
      return;
    }
    router.post(route('bookings.update-status-bulk'), { ids: selectedIds, status: bulkStatus }, {
      onSuccess: () => {
        setSelectedIds([]);
        dtRef.current?.reload();
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pemesanan" />
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Manajemen Pemesanan</h1>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full flex-grow">
            <HeadingSmall title="Pemesanan" description="Kelola pemesanan untuk aplikasi Anda" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daftar Pemesanan</h2>
              <Link href={route('bookings.create')}>
                <Button>Buat Pemesanan</Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-semibold">Bulk Update Status:</span>
              <select
                className="bg-blue-100 text-blue-900 font-semibold rounded px-2 py-1"
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
              >
                <option value="pending" style={{ background: '#fef3c7', color: '#92400e' }}>Pending</option>
                <option value="confirmed" style={{ background: '#d1fae5', color: '#065f46' }}>Confirmed</option>
                <option value="cancelled" style={{ background: '#fee2e2', color: '#991b1b' }}>Cancelled</option>
              </select>
              <Button onClick={handleBulkUpdate} disabled={selectedIds.length === 0} variant="default">
                Update Status ({selectedIds.length})
              </Button>
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
                data: function (d: Record<string, unknown>) {
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
