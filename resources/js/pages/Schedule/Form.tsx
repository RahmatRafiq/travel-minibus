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
import { Schedule } from '@/types/Schedule';
import { Vehicle } from '@/types/Vehicle';

type Entry = {
    departure_time: string;
};


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
    schedule?: Schedule;
    routes: Route[];
    vehicles: Vehicle[];
}) {
    const isEdit = !!schedule;

    const [routeId, setRouteId] = useState<number | null>(
        isEdit ? schedule?.routeVehicle?.route?.id ?? null : null
    );
    const [vehicleId, setVehicleId] = useState<number | null>(
        isEdit ? schedule?.routeVehicle?.vehicle?.id ?? null : null
    );
    const [status, setStatus] = useState<string>(
        isEdit ? schedule?.status ?? 'ready' : 'ready'
    );

    const [departureTimes, setDepartureTimes] = useState<Entry[]>(
        isEdit
            ? [{ departure_time: schedule?.departure_time ?? '' }]
            : [{ departure_time: '' }]
    );

    const { data, setData, post, put, processing, errors, setError, clearErrors } = useForm(
        isEdit
            ? {
                route_id: routeId,
                vehicle_id: vehicleId,
                departure_time: departureTimes[0]?.departure_time,
                status,
            }
            : {
                route_id: routeId,
                vehicle_id: vehicleId,
                status,
                departure_times: departureTimes.map(dt => dt.departure_time),
            }
    );
    const [generalError, setGeneralError] = useState<string>('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Jadwal', href: route('schedules.index') },
        { title: isEdit ? 'Edit Jadwal' : 'Buat Jadwal', href: '#' },
    ];

    const handleFieldChange = (field: 'route_id' | 'vehicle_id' | 'status', value: any) => {
        if (field === 'route_id') setRouteId(value);
        if (field === 'vehicle_id') setVehicleId(value);
        if (field === 'status') setStatus(value);
        setData(field, value);
        clearErrors();
    };

    const handleDepartureTimeChange = (idx: number, value: { date: string, time: string }) => {
        const updated = [...departureTimes];
        updated[idx].departure_time = combineDateTime(value.date, value.time);
        setDepartureTimes(updated);
        setData('departure_times', updated.map(dt => dt.departure_time));
        clearErrors();
    };

    const addDepartureTime = () => {
        const last = departureTimes[departureTimes.length - 1];
        let newDepartureTime = '';
        if (last && last.departure_time) {
            const { date, time } = splitDateTime(last.departure_time);
            if (date) {
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
                const formattedDate = nextDate.toISOString().slice(0, 10);
                newDepartureTime = combineDateTime(formattedDate, time);
            }
        }
        const updated = [...departureTimes, { departure_time: newDepartureTime }];
        setDepartureTimes(updated);
        setData('departure_times', updated.map(dt => dt.departure_time));
    };

    // Helper to bulk add departure times for a given count (e.g., 7 or 30 days)
    const bulkAddDepartureTimes = (count: number) => {
        const first = departureTimes[0];
        if (!first || !first.departure_time) return;
        const { date, time } = splitDateTime(first.departure_time);
        if (!date || !time) return;
        const newEntries: Entry[] = [];
        for (let i = 0; i < count; i++) {
            const d = new Date(date);
            d.setDate(d.getDate() + i);
            const formattedDate = d.toISOString().slice(0, 10);
            newEntries.push({ departure_time: combineDateTime(formattedDate, time) });
        }
        setDepartureTimes(newEntries);
        setData('departure_times', newEntries.map(dt => dt.departure_time));
    };
    const removeDepartureTime = (idx: number) => {
        const updated = departureTimes.filter((_, i) => i !== idx);
        setDepartureTimes(updated);
        setData('departure_times', updated.map(dt => dt.departure_time));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        setGeneralError('');
        if (!routeId || !vehicleId || !status) {
            setGeneralError('Rute, Kendaraan, dan Status wajib diisi.');
            return;
        }
        if (!isEdit && departureTimes.length === 0) {
            setError('departure_times', 'Minimal satu waktu keberangkatan harus diisi.');
            return;
        }
        if (!isEdit) {
            for (let i = 0; i < departureTimes.length; i++) {
                if (!departureTimes[i].departure_time) {
                    setError('departure_times', 'Semua waktu keberangkatan harus diisi.');
                    return;
                }
            }
        }
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
        label: `${vehicle.plate_number} - ${vehicle.brand}`,
    }));

    const statusOptions = [
        { value: 'ready', label: 'Siap Berangkat' },
        { value: 'departed', label: 'Berangkat' },
        { value: 'arrived', label: 'Tiba' },
        { value: 'cancelled', label: 'Dibatalkan' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Jadwal' : 'Buat Jadwal'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4 text-foreground">Manajemen Jadwal</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Jadwal' : 'Buat Jadwal'}
                            description="Isi detail jadwal di bawah ini"
                        />
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="border rounded p-6 mb-2">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="route_id" className="text-foreground">Rute</Label>
                                        <CustomSelect
                                            id="route_id"
                                            options={routeOptions}
                                            value={routeOptions.find((option) => option.value === routeId) || null}
                                            onChange={(selected: any) => handleFieldChange('route_id', selected ? selected.value : null)}
                                            placeholder="Pilih rute..."
                                        />
                                        <InputError message={errors.route_id as string} />
                                    </div>
                                    <div>
                                        <Label htmlFor="vehicle_id" className="text-foreground">Kendaraan</Label>
                                        <CustomSelect
                                            id="vehicle_id"
                                            options={vehicleOptions}
                                            value={vehicleOptions.find((option) => option.value === vehicleId) || null}
                                            onChange={(selected: any) => handleFieldChange('vehicle_id', selected ? selected.value : null)}
                                            placeholder="Pilih kendaraan..."
                                        />
                                        {(() => {
                                            const selectedVehicle = vehicles.find(v => v.id === vehicleId);
                                            return (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Merek: {selectedVehicle?.brand ?? '-'}
                                                </div>
                                            );
                                        })()}
                                        <InputError message={errors.vehicle_id as string} />
                                    </div>
                                    <div>
                                        <Label htmlFor="status" className="text-foreground">Status</Label>
                                        <CustomSelect
                                            id="status"
                                            options={statusOptions}
                                            value={statusOptions.find(option => option.value === status)}
                                            onChange={(selected: any) => handleFieldChange('status', selected ? selected.value : 'ready')}
                                            placeholder="Pilih status..."
                                            isSearchable={false}
                                        />
                                        <InputError message={errors.status as string} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">Waktu Keberangkatan</Label>
                                {departureTimes.map((dt, idx) => {
                                    const { date, time } = splitDateTime(dt.departure_time);
                                    return (
                                        <div key={idx} className="flex items-center gap-2 mb-2">
                                            <DatePicker
                                                id={`departure_date_${idx}`}
                                                value={date ? new Date(date) : undefined}
                                                onChange={(selectedDate: Date | null) => {
                                                    const formattedDate = selectedDate
                                                        ? selectedDate.toISOString().slice(0, 10)
                                                        : '';
                                                    handleDepartureTimeChange(idx, {
                                                        date: formattedDate,
                                                        time,
                                                    });
                                                }}
                                                displayFormat="dd/MM/yyyy"
                                                locale="id"
                                                required
                                                minDate={new Date()}
                                            />
                                            <TimePicker
                                                id={`departure_time_${idx}`}
                                                value={time}
                                                onChange={(selectedTime: string) => {
                                                    handleDepartureTimeChange(idx, {
                                                        date,
                                                        time: selectedTime,
                                                    });
                                                }}
                                                required
                                            />
                                            {departureTimes.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="text-red-600"
                                                    onClick={() => removeDepartureTime(idx)}
                                                >
                                                    Hapus
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" onClick={addDepartureTime} className="border-primary text-primary hover:bg-primary/10">
                                        + Tambah Waktu
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => bulkAddDepartureTimes(7)} className="border-primary text-primary hover:bg-primary/10">
                                        Isi 1 Minggu
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => bulkAddDepartureTimes(30)} className="border-primary text-primary hover:bg-primary/10">
                                        Isi 1 Bulan
                                    </Button>
                                </div>
                                <InputError message={errors.departure_times as string} />
                            </div>
                            {(generalError || (errors as any)?.form) && (
                                <div className="p-2 bg-destructive/10 text-destructive rounded">
                                    {generalError || (errors as any)?.form}
                                </div>
                            )}
                            <div className="flex items-center space-x-4">
                                <Button disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    {isEdit ? 'Perbarui Jadwal' : 'Buat Jadwal'}
                                </Button>
                                <Link
                                    href={route('schedules.index')}
                                    className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
