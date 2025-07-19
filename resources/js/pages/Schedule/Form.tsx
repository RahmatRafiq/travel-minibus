import { Head, useForm, Link } from '@inertiajs/react';
import React, { FormEvent, useState } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import CustomSelect from '@/components/select';
import { DatePicker } from '@/components/DatePicker';
import { TimePicker } from '@/components/TimePicker';


type Entry = {
    route_id: number | null;
    vehicle_id: number | null;
    departure_time: string;
    status: string;
};

type FormErrors = {
    entries?: string;
    [key: string]: string | undefined;
};

// Perbaiki combineDateTime agar tetap mengembalikan string walau salah satu kosong
function combineDateTime(date: string, time: string) {
    if (!date && !time) return '';
    if (!date) return `T${time}`;
    if (!time) return `${date}T`;
    return `${date}T${time}`;
}

function splitDateTime(datetime: string) {
    if (!datetime) return { date: '', time: '' };
    const [date, time] = datetime.split('T');
    return { date, time: time ? time.slice(0, 5) : '' };
}

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

    const [entries, setEntries] = useState<Entry[]>(
        isEdit
            ? [{
                route_id: schedule?.routeVehicle?.route?.id ?? null,
                vehicle_id: schedule?.routeVehicle?.vehicle?.id ?? null,
                departure_time: schedule?.departure_time ?? '',
                status: schedule?.status ?? '',
            }]
            : [{
                route_id: null,
                vehicle_id: null,
                departure_time: '',
                status: '',
            }]
    );

    const { data, setData, post, put, processing, errors, setError, clearErrors } = useForm(
        isEdit
            ? {
                route_id: entries[0].route_id,
                vehicle_id: entries[0].vehicle_id,
                departure_time: entries[0].departure_time,
                status: entries[0].status,
            }
            : { entries }
    );
    const [generalError, setGeneralError] = useState<string>('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Schedule Management', href: '/schedules' },
        { title: isEdit ? 'Edit Schedule' : 'Create Schedule', href: '#' },
    ];

    const handleChange = (idx: number, field: keyof Entry, value: any) => {
        const updated = [...entries];
        if (field === 'departure_time') {
            // value: { date, time }
            const combined = combineDateTime(value.date, value.time);
            updated[idx].departure_time = combined;
        } else {
            updated[idx] = { ...updated[idx], [field]: value };
        }
        setEntries(updated);
        setData('entries', updated);
        clearErrors();
    };

    const handleEditChange = (field: keyof Entry, value: any) => {
        if (field === 'departure_time') {
            // value: { date, time }
            const combined = combineDateTime(value.date, value.time);
            setData(field, combined);
        } else {
            setData(field, value);
        }
        clearErrors();
    };

    const addEntry = () => {
        const updated = [...entries, { route_id: null, vehicle_id: null, departure_time: '', status: '' }];
        setEntries(updated);
        setData('entries', updated);
    };
    const removeEntry = (idx: number) => {
        const updated = entries.filter((_, i) => i !== idx);
        setEntries(updated);
        setData('entries', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        setGeneralError('');
        if (isEdit) {
            if (!data.route_id || !data.vehicle_id || !data.departure_time || !data.status) {
                setGeneralError('All fields are required.');
                return;
            }
            put(route('schedules.update', schedule!.id));
        } else {
            if (entries.length === 0) {
                setError('entries', 'At least one schedule entry is required.');
                return;
            }
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                if (!entry.route_id || !entry.vehicle_id || !entry.departure_time || !entry.status) {
                    setError('entries', 'All fields are required.');
                    return;
                }
            }
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

    const getEntryError = (idx: number, field: keyof Entry) => {
        const key = `entries.${idx}.${field}`;
        return (errors as FormErrors)[key] || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Schedule' : 'Create Schedule'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4 text-foreground">Schedule Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* <ScheduleSidebar /> */}
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Schedule' : 'Create Schedule'}
                            description="Fill in the details below"
                        />
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isEdit ? (
                                <div className="bg-muted border rounded p-6 mb-2">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="route_id" className="text-foreground">Route</Label>
                                            <CustomSelect
                                                id="route_id"
                                                options={routeOptions}
                                                value={routeOptions.find((option) => option.value === data.route_id) || null}
                                                onChange={(selected: any) => handleEditChange('route_id', selected ? selected.value : null)}
                                                placeholder="Select route..."
                                            />
                                            <InputError message={errors.route_id as string} />
                                        </div>
                                        <div>
                                            <Label htmlFor="vehicle_id" className="text-foreground">Vehicle</Label>
                                            <CustomSelect
                                                id="vehicle_id"
                                                options={vehicleOptions}
                                                value={vehicleOptions.find((option) => option.value === data.vehicle_id) || null}
                                                onChange={(selected: any) => handleEditChange('vehicle_id', selected ? selected.value : null)}
                                                placeholder="Select vehicle..."
                                            />
                                            <InputError message={errors.vehicle_id as string} />
                                        </div>
                                        <div>
                                            <Label htmlFor="departure_time" className="text-foreground">Departure Time</Label>
                                            {(() => {
                                                const { date, time } = splitDateTime(data.departure_time ?? '');
                                                return (
                                                    <div className="flex gap-2">
                                                        <DatePicker
                                                            id={`departure_date`}
                                                            value={date ? new Date(date) : undefined}
                                                            onChange={(selectedDate: Date | null) => {
                                                                // Format ke YYYY-MM-DD
                                                                const formattedDate = selectedDate
                                                                    ? selectedDate.toISOString().slice(0, 10)
                                                                    : '';
                                                                handleEditChange('departure_time', {
                                                                    date: formattedDate,
                                                                    time,
                                                                });
                                                            }}
                                                            displayFormat="dd/MM/yyyy"
                                                            locale="id" // Bahasa Indonesia
                                                            required
                                                        />
                                                        <TimePicker
                                                            id={`departure_time`}
                                                            value={time}
                                                            onChange={(selectedTime: string) => {
                                                                handleEditChange('departure_time', {
                                                                    date,
                                                                    time: selectedTime,
                                                                });
                                                            }}
                                                            format="HH:mm"
                                                            required
                                                        />
                                                    </div>
                                                );
                                            })()}
                                            <InputError message={errors.departure_time as string} />
                                        </div>
                                        <div>
                                            <Label htmlFor="status" className="text-foreground">Status</Label>
                                            <Input
                                                id="status"
                                                type="text"
                                                value={data.status}
                                                onChange={(e) => handleEditChange('status', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.status as string} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {entries.map((entry, idx) => {
                                        const { date, time } = splitDateTime(entry.departure_time);
                                        return (
                                            <div key={idx} className="border rounded p-6 mb-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-foreground">Schedule #{idx + 1}</span>
                                                    {entries.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            className="text-red-600 hover:text-red-800 hover:underline text-xs"
                                                            onClick={() => removeEntry(idx)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor={`route_id_${idx}`} className="text-foreground">Route</Label>
                                                        <CustomSelect
                                                            id={`route_id_${idx}`}
                                                            options={routeOptions}
                                                            value={routeOptions.find((option) => option.value === entry.route_id) || null}
                                                            onChange={(selected: any) => handleChange(idx, 'route_id', selected ? selected.value : null)}
                                                            placeholder="Select route..."
                                                        />
                                                        <InputError message={getEntryError(idx, 'route_id')} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`vehicle_id_${idx}`} className="text-foreground">Vehicle</Label>
                                                        <CustomSelect
                                                            id={`vehicle_id_${idx}`}
                                                            options={vehicleOptions}
                                                            value={vehicleOptions.find((option) => option.value === entry.vehicle_id) || null}
                                                            onChange={(selected: any) => handleChange(idx, 'vehicle_id', selected ? selected.value : null)}
                                                            placeholder="Select vehicle..."
                                                        />
                                                        <InputError message={getEntryError(idx, 'vehicle_id')} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`departure_time_${idx}`} className="text-foreground">Departure Date & Time</Label>
                                                        <div className="flex gap-2">
                                                            {/* DatePicker untuk tanggal format Indonesia */}
                                                            <DatePicker
                                                                id={`departure_date_${idx}`}
                                                                value={date ? new Date(date) : undefined}
                                                                onChange={(selectedDate: Date | null) => {
                                                                    // Format ke YYYY-MM-DD
                                                                    const formattedDate = selectedDate
                                                                        ? selectedDate.toISOString().slice(0, 10)
                                                                        : '';
                                                                    handleChange(idx, 'departure_time', {
                                                                        date: formattedDate,
                                                                        time,
                                                                    });
                                                                }}
                                                                displayFormat="dd/MM/yyyy"
                                                                locale="id" // Bahasa Indonesia
                                                                required
                                                            />
                                                            {/* TimePicker untuk waktu 24 jam */}
                                                            <TimePicker
                                                                id={`departure_time_${idx}`}
                                                                value={time}
                                                                onChange={(selectedTime: string) => {
                                                                    handleChange(idx, 'departure_time', {
                                                                        date,
                                                                        time: selectedTime,
                                                                    });
                                                                }}
                                                                format="HH:mm"
                                                                required
                                                            />
                                                        </div>
                                                        <InputError message={getEntryError(idx, 'departure_time')} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`status_${idx}`} className="text-foreground">Status</Label>
                                                        <Input
                                                            id={`status_${idx}`}
                                                            type="text"
                                                            value={entry.status}
                                                            onChange={(e) => handleChange(idx, 'status', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={getEntryError(idx, 'status')} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div>
                                        <Button type="button" variant="outline" onClick={addEntry} className="border-primary text-primary hover:bg-primary/10">
                                            + Add Another Schedule
                                        </Button>
                                    </div>
                                    <InputError message={errors.entries && typeof errors.entries === 'string' ? errors.entries : ''} />
                                </>
                            )}
                            {(generalError || (errors as any)?.form) && (
                                <div className="p-2 bg-destructive/10 text-destructive rounded">
                                    {generalError || (errors as any)?.form}
                                </div>
                            )}
                            <div className="flex items-center space-x-4">
                                <Button disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    {isEdit ? 'Update Schedule' : 'Create Schedule(s)'}
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
