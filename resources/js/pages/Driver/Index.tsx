import { useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables';
import { BreadcrumbItem } from '@/types';
import VehicleSidebar from '@/components/vehicle-sidebar';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Driver Management', href: '/drivers' },
];

const columns = [
    { data: 'id', title: 'ID' },
    { data: 'name', title: 'Name' },
    { data: 'phone', title: 'Phone' },
    { data: 'created_at', title: 'Created At' },
    { data: 'updated_at', title: 'Updated At' },
];

export default function DriverIndex() {
    const dtRef = useRef<DataTableWrapperRef>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Drivers" />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Driver Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <VehicleSidebar />
                    <div className="w-full flex-grow">
                        <HeadingSmall title="Drivers" description="View all drivers" />
                        <DataTableWrapper
                            ref={dtRef}
                            ajax={{
                                url: route('drivers.json'),
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
