import { Head, useForm, Link } from '@inertiajs/react';
import React, { FormEvent } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import CustomSelect from '@/components/select';

export default function ScheduleForm({
    schedule,
    routes,
    vehicles,
}: {
    schedule?: any;
    routes: any[];
    vehicles: any[];
}) {
    const isEdit = !!schedule;
    const { data, setData, post, put, processing, errors } = useForm<{
        route_id: number | null;
        vehicle_id: number | null;
        departure_time: string;
        status: string;
    }>({
        route_id: schedule?.routeVehicle?.route?.id ?? null,
        vehicle_id: schedule?.routeVehicle?.vehicle?.id ?? null,
        departure_time: schedule?.departure_time ?? '',
        status: schedule?.status ?? '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Schedule Management', href: '/schedules' },
        { title: isEdit ? 'Edit Schedule' : 'Create Schedule', href: '#' },
    ];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('schedules.update', schedule!.id));
        } else {
            post(route('schedules.store'));
        }
    };

    const routeOptions = routes.map(route => ({
        value: route.id,
        label: route.name || `${route.origin} - ${route.destination}`,
    }));

    const vehicleOptions = vehicles.map(vehicle => ({
        value: vehicle.id,
        label: vehicle.plate_number,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Schedule' : 'Create Schedule'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Schedule Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* Sidebar if needed */}
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Schedule' : 'Create Schedule'}
                            description="Fill in the details below"
                        />
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="route_id">Route</Label>
                                <CustomSelect
                                    id="route_id"
                                    options={routeOptions}
                                    value={routeOptions.find((option) => option.value === data.route_id) || null}
                                    onChange={(selected: any) => setData('route_id', selected ? selected.value : null)}
                                    placeholder="Select route..."
                                />
                                <InputError message={errors.route_id} />
                            </div>
                            <div>
                                <Label htmlFor="vehicle_id">Vehicle</Label>
                                <CustomSelect
                                    id="vehicle_id"
                                    options={vehicleOptions}
                                    value={vehicleOptions.find((option) => option.value === data.vehicle_id) || null}
                                    onChange={(selected: any) => setData('vehicle_id', selected ? selected.value : null)}
                                    placeholder="Select vehicle..."
                                />
                                <InputError message={errors.vehicle_id} />
                            </div>
                            <div>
                                <Label htmlFor="departure_time">Departure Time</Label>
                                <Input
                                    id="departure_time"
                                    type="datetime-local"
                                    value={data.departure_time}
                                    onChange={(e) => setData('departure_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.departure_time} />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Input
                                    id="status"
                                    type="text"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    required
                                />
                                <InputError message={errors.status} />
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button disabled={processing}>
                                    {isEdit ? 'Update Schedule' : 'Create Schedule'}
                                </Button>
                                <Link
                                    href={route('schedules.index')}
                                    className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
