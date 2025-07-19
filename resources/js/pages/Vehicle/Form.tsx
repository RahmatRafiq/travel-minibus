import { Head, useForm, Link } from '@inertiajs/react';
import React, { FormEvent, useState } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import VehicleSidebar from '@/components/vehicle-sidebar';
import CustomSelect from '@/components/select';
import { Vehicle } from '@/types/Vehicle';
import { Driver } from '@/types/Driver';

export default function VehicleForm({
    vehicle,
    routes,
}: {
    vehicle?: Vehicle;
    drivers: Driver[];
    routes: Route[];
}) {
    const isEdit = !!vehicle;
    const { data, setData, post, put, processing, errors } = useForm<{
        plate_number: string;
        brand: string;
        seat_capacity: number;
        driver_id: number | null;
        driver_name: string;
        driver_phone: string;
        route_ids: number[];
    }>({
        plate_number: vehicle ? vehicle.plate_number : '',
        brand: vehicle ? vehicle.brand : '',
        seat_capacity: vehicle ? vehicle.seat_capacity : 1,
        driver_id: vehicle && vehicle.driver ? vehicle.driver.id : null,
        driver_name: vehicle && vehicle.driver ? vehicle.driver.name : '',
        driver_phone: vehicle && vehicle.driver ? vehicle.driver.phone ?? '' : '',
        route_ids: vehicle && vehicle.routes ? vehicle.routes.map(r => r.id) : [],
    });

    const [routeIds, setRouteIds] = useState<number[]>(data.route_ids);

    React.useEffect(() => {
        setData('route_ids', routeIds);
    }, [routeIds]);

    const addRouteSelect = () => setRouteIds([...routeIds, 0]);
    const removeRouteSelect = (idx: number) => setRouteIds(routeIds.filter((_, i) => i !== idx));
    const updateRouteSelect = (idx: number, value: number) => {
        const updated = [...routeIds];
        updated[idx] = value;
        setRouteIds(updated);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vehicle Management', href: '/vehicles' },
        { title: isEdit ? 'Edit Vehicle' : 'Create Vehicle', href: '#' },
    ];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('vehicles.update', vehicle!.id));
        } else {
            post(route('vehicles.store'));
        }
    };

    const routeOptions = routes.map(route => ({
        value: route.id,
        label: route.name || `${route.origin} - ${route.destination}`,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Vehicle' : 'Create Vehicle'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Vehicle Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* Sidebar */}
                    <VehicleSidebar />
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Vehicle' : 'Create Vehicle'}
                            description="Fill in the details below"
                        />
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="plate_number">Plate Number</Label>
                                <Input
                                    id="plate_number"
                                    type="text"
                                    value={data.plate_number}
                                    onChange={(e) => setData('plate_number', e.target.value)}
                                    required
                                />
                                <InputError message={errors.plate_number} />
                            </div>
                            <div>
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    type="text"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                    required
                                />
                                <InputError message={errors.brand} />
                            </div>
                            <div>
                                <Label htmlFor="seat_capacity">Seat Capacity</Label>
                                <Input
                                    id="seat_capacity"
                                    type="number"
                                    min={1}
                                    value={data.seat_capacity}
                                    onChange={(e) => setData('seat_capacity', Number(e.target.value))}
                                    required
                                />
                                <InputError message={errors.seat_capacity} />
                            </div>
                            <div>
                                <Label htmlFor="driver_id">Driver</Label>
                                {/* <CustomSelect
                  id="driver_id"
                  options={driverOptions}
                  value={driverOptions.find((option) => option.value === data.driver_id)}
                  onChange={(selected) => setData('driver_id', (selected as { value: number }).value)}
                  isClearable
                /> */}
                                <InputError message={errors.driver_id} />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <Input
                                        id="driver_name"
                                        placeholder="New Driver Name"
                                        value={data.driver_name}
                                        onChange={e => setData('driver_name', e.target.value)}
                                    />
                                    <Input
                                        id="driver_phone"
                                        placeholder="New Driver Phone"
                                        value={data.driver_phone}
                                        onChange={e => setData('driver_phone', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.driver_name || errors.driver_phone} />
                            </div>
                            <div>
                                <Label htmlFor="route_ids">Routes</Label>
                                <CustomSelect
                                    id="route_ids"
                                    isMulti
                                    options={routeOptions}
                                    value={routeOptions.filter(opt => data.route_ids.includes(opt.value))}
                                    onChange={(selected: any) => {
                                        setData('route_ids', selected ? selected.map((opt: any) => opt.value) : []);
                                    }}
                                    placeholder="Select routes..."
                                />
                                <InputError message={errors.route_ids} />
                            </div>
                            <div className="flex items-center space-x-4">
                                <Button disabled={processing}>
                                    {isEdit ? 'Update Vehicle' : 'Create Vehicle'}
                                </Button>
                                <Link
                                    href={route('vehicles.index')}
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