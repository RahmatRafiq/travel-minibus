import { useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables';
import { BreadcrumbItem } from '@/types';
import VehicleSidebar from '@/components/vehicle-sidebar';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Rute', href: route('routes.index') },
];

const columns = [
    { data: 'id', title: 'ID' },
    { data: 'name', title: 'Nama' },
    { data: 'origin', title: 'Asal' },
    { data: 'destination', title: 'Tujuan' },
    { data: 'duration', title: 'Durasi' },
    { data: 'created_at', title: 'Dibuat Pada' },
    { data: 'updated_at', title: 'Diperbarui Pada' },
];

export default function RouteIndex() {
    const dtRef = useRef<DataTableWrapperRef>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rute" />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Manajemen Rute</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <VehicleSidebar />
                    <div className="w-full flex-grow">
                        <HeadingSmall title="Rute" description="Lihat semua rute" />
                        <DataTableWrapper
                            ref={dtRef}
                            ajax={{
                                url: route('routes.json'),
                                type: 'POST',
                                data: function (d: any) {
                                    d._token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                                    return d;
                                },
                            }}
                            columns={columns}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
