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
import { Vehicle } from '@/types/Vehicle';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Vehicle Management', href: '/vehicles' },
];

function formatVehicleDetails(data: any): string {
  if (!data) return '';
  return `
    <div class="p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
      <strong class="block text-gray-800 mb-2">Details:</strong>
      <ul>
        <li class="ml-4 list-disc text-gray-700">Brand: ${data.brand}</li>
        <li class="ml-4 list-disc text-gray-700">Seat Capacity: ${data.seat_capacity}</li>
        <li class="ml-4 list-disc text-gray-700">Driver: ${data.driver ? data.driver.name : '-'}</li>
        <li class="ml-4 list-disc text-gray-700">Route: ${data.route ? data.route.name : '-'}</li>
      </ul>
    </div>
  `;
}

export default function VehicleIndexAccordion({ filter: initialFilter, success }: { filter?: string; success?: string }) {
  const dtRef = useRef<DataTableWrapperRef>(null);
  const [filter, setFilter] = useState(initialFilter || 'active');

  const columns = [
    {
      data: null,
      title: '',
      orderable: false,
      searchable: false,
      className: 'details-control',
      render: () => '<span style="cursor: pointer;">+</span>',
    },
    { data: 'id', title: 'ID' },
    { data: 'plate_number', title: 'Plate Number' },
    { data: 'brand', title: 'Brand' },
    { data: 'seat_capacity', title: 'Seat Capacity' },
    {
      data: 'driver',
      title: 'Driver',
      render: (data: any) => (data ? data.name : '-'),
    },
    {
      data: 'route',
      title: 'Route',
      render: (data: any) => (data ? data.name : '-'),
    },
    { data: 'created_at', title: 'Created At' },
    { data: 'updated_at', title: 'Updated At' },
    {
      data: null,
      title: 'Actions',
      orderable: false,
      searchable: false,
      render: (_: null, __: string, vehicle: any) => {
        let html = '';
        if (vehicle.trashed) {
          html += `<button class="btn-restore ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700" data-id="${vehicle.id}">Restore</button>`;
          html += `<button class="btn-force-delete ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${vehicle.id}">Force Delete</button>`;
        } else {
          html += `<span class="inertia-link-cell" data-id="${vehicle.id}"></span>`;
          html += `<button data-id="${vehicle.id}" class="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 btn-delete">
            Delete
          </button>`;
        }
        return html;
      },
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(route('vehicles.destroy', id), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => dtRef.current?.reload(),
    });
  };

  const handleRestore = (id: number) => {
    router.post(route('vehicles.restore', id), {}, {
      onSuccess: () => dtRef.current?.reload(),
    });
  };

  const handleForceDelete = (id: number) => {
    router.delete(route('vehicles.force-delete', id), {
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
            href={`/vehicles/${id}/edit`}
            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
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
            row.child(formatVehicleDetails(row.data())).show();
            tr.classList.add('shown');
            cell.innerHTML = '<span style="cursor: pointer;">-</span>';
          }
        });
      });
    }

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Vehicles" />
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Vehicle Management</h1>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
          <Separator className="my-6 md:hidden" />
          <div className="col-md-12">
            <HeadingSmall title="Vehicles" description="Manage vehicles for your application" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Vehicle List</h2>
              <Link href={route('vehicles.create')}>
                <Button>Create Vehicle</Button>
              </Link>
            </div>
            <ToggleTabs tabs={['active', 'trashed', 'all']} active={filter} onChange={setFilter} />
            {success && (
              <div className="p-2 bg-green-100 text-green-800 rounded">{success}</div>
            )}
            <DataTableWrapper
              key={filter}
              ref={dtRef}
              ajax={{
                url: route('vehicles.json') + '?filter=' + filter,
                type: 'POST',
                data: function (d: any) {
                  d._token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                  return d;
                },
              }}
              columns={columns}
              options={{ drawCallback }}
              onRowDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
