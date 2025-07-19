import { Head, useForm, router, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/select';

type RouteType = {
    id: number;
    name?: string;
    origin?: string;
    destination?: string;
    duration?: string;
};

type VehicleType = {
    id: number;
    plate_number: string;
    brand: string;
    seat_capacity?: number;
};

type ScheduleType = {
    id: number;
    departure_time: string;
    available_seats: number;
    vehicle: VehicleType;
    route?: RouteType;
};

type Props = {
    origin?: string;
    destination?: string;
    route_id?: number;
    routes?: RouteType[];
    schedules?: ScheduleType[];
    booking?: {
        id: number;
        schedule_id: number;
        seats_booked: number;
        status: string;
    };
    success?: string;
    errors?: any;
    allOrigins?: string[];
    allDestinations?: string[];
    departure_date?: string;
};

export default function BookingForm(props: Props) {
    const isEdit = !!props.booking;
    const [search, setSearch] = useState({
        origin: props.origin || '',
        destination: props.destination || '',
        departure_date: props.departure_date || '',
    });
    const autoSelectedRoute = props.routes && props.routes.length === 1 ? props.routes[0].id : null;
    const [selectedRoute, setSelectedRoute] = useState<number | null>(
        props.route_id ? Number(props.route_id) : autoSelectedRoute
    );
    const [selectedSchedule, setSelectedSchedule] = useState<number | null>(
        isEdit ? props.booking?.schedule_id ?? null : null
    );
    const [isManualDate, setIsManualDate] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        schedule_id: isEdit ? String(props.booking?.schedule_id) : '',
        seats_booked: isEdit ? props.booking?.seats_booked : 1,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('bookings.create'), { ...search, route_id: selectedRoute }, { preserveState: true });
        setSelectedRoute(null);
        setSelectedSchedule(null);
        reset();
    };

    React.useEffect(() => {
        if (props.routes && props.routes.length === 1) {
            setSelectedRoute(props.routes[0].id);
            router.get(route('bookings.create'), { ...search, route_id: props.routes[0].id }, { preserveState: true });
        }
    }, [props.routes?.length]);

    const handleSelectSchedule = (scheduleId: number) => {
        setSelectedSchedule(scheduleId);
        setData('schedule_id', String(scheduleId));
    };

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('bookings.update', props.booking!.id));
        } else {
            post(route('bookings.store'));
        }
    };

    const originOptions = props.allOrigins?.map(origin => ({ value: origin, label: origin })) || [];
    const destinationOptions = props.allDestinations?.map(dest => ({ value: dest, label: dest })) || [];

    const availableSeats =
        props.schedules?.find(s => s.id === selectedSchedule)?.available_seats || 1;
    const seatsOptions = Array.from({ length: availableSeats }).map((_, i) => ({
        value: i + 1,
        label: String(i + 1),
    }));

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    const dateOptions = [
        { value: formatDate(today), label: 'Hari Ini' },
        { value: formatDate(tomorrow), label: 'Besok' },
        { value: 'manual', label: 'Pilih Tanggal...' },
    ];

    let dateSelectValue = null;
    if (!isManualDate && search.departure_date === formatDate(today)) {
        dateSelectValue = dateOptions[0];
    } else if (!isManualDate && search.departure_date === formatDate(tomorrow)) {
        dateSelectValue = dateOptions[1];
    } else if (isManualDate) {
        dateSelectValue = dateOptions[2];
    }

    const breadcrumbs = [
        { title: 'Bookings', href: route('bookings.index') },
        { title: isEdit ? 'Edit Booking' : 'Create Booking', href: '' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Booking' : 'Create Booking'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Booking Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* Sidebar bisa ditambahkan di sini jika ada */}
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Booking' : 'Create Booking'}
                            description="Isi detail booking di bawah ini"
                        />
                        <div className="space-y-4">
                            {!isEdit ? (
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Origin</label>
                                        <CustomSelect
                                            options={originOptions}
                                            value={originOptions.find(opt => opt.value === search.origin) || null}
                                            onChange={(opt: any) => setSearch(s => ({ ...s, origin: opt?.value || '' }))}
                                            placeholder="Pilih Origin"
                                            isClearable
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Destination</label>
                                        <CustomSelect
                                            options={destinationOptions}
                                            value={destinationOptions.find(opt => opt.value === search.destination) || null}
                                            onChange={(opt: any) => setSearch(s => ({ ...s, destination: opt?.value || '' }))}
                                            placeholder="Pilih Destination"
                                            isClearable
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">Tanggal</label>
                                        <CustomSelect
                                            options={dateOptions}
                                            value={dateSelectValue}
                                            onChange={(opt: any) => {
                                                if (opt?.value === 'manual') {
                                                    setIsManualDate(true);
                                                    setSearch(s => ({ ...s, departure_date: '' }));
                                                } else {
                                                    setIsManualDate(false);
                                                    setSearch(s => ({ ...s, departure_date: opt?.value || '' }));
                                                }
                                            }}
                                            placeholder="Pilih Tanggal"
                                            isClearable={false}
                                        />
                                        {isManualDate && (
                                            <input
                                                type="date"
                                                value={search.departure_date}
                                                onChange={e => setSearch(s => ({ ...s, departure_date: e.target.value }))}
                                                className="border border-input rounded px-2 py-1 mt-2 w-full bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Button type="submit" className="h-10">Cari Jadwal</Button>
                                        <Link
                                            href={route('bookings.index')}
                                            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70 border border-input"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-2">
                                    {(() => {
                                        const currentSchedule = props.schedules?.find(
                                            s => s.id === props.booking?.schedule_id
                                        );
                                        const origin = props.origin ?? currentSchedule?.route?.origin ?? '-';
                                        const destination = props.destination ?? currentSchedule?.route?.destination ?? '-';
                                        const departureDate = props.departure_date
                                            ? props.departure_date
                                            : (currentSchedule?.departure_time
                                                ? currentSchedule.departure_time.slice(0, 10)
                                                : '-');
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1">Origin</label>
                                                    <input
                                                        type="text"
                                                        value={origin}
                                                        className="border border-input rounded px-2 py-1 w-full bg-muted text-foreground"
                                                        disabled
                                                        placeholder="Origin"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1">Destination</label>
                                                    <input
                                                        type="text"
                                                        value={destination}
                                                        className="border border-input rounded px-2 py-1 w-full bg-muted text-foreground"
                                                        disabled
                                                        placeholder="Destination"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1">Tanggal</label>
                                                    <input
                                                        type="date"
                                                        value={departureDate !== '-' ? departureDate : ''}
                                                        className="border border-input rounded px-2 py-1 w-full bg-muted text-foreground"
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                            {props.schedules && props.schedules.length > 0 && (
                                <div>
                                    <div className="font-semibold mb-2">Pilih Jadwal:</div>
                                    <ul className="space-y-2">
                                        {props.schedules.map(sch => (
                                            <li key={sch.id} className="flex items-center gap-2">
                                                <Button
                                                    variant={selectedSchedule === sch.id ? 'default' : 'outline'}
                                                    className={selectedSchedule === sch.id ? '' : 'border-input'}
                                                    onClick={() => handleSelectSchedule(sch.id)}
                                                >
                                                    {sch.departure_time} | {sch.vehicle.plate_number} ({sch.vehicle.brand}) | Sisa kursi: {sch.available_seats}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {selectedSchedule && (
                                <form onSubmit={handleBooking} className="space-y-4">
                                    <div>
                                        <label htmlFor="seats_booked" className="block text-xs text-muted-foreground mb-1 font-medium">Jumlah Kursi</label>
                                        <CustomSelect
                                            inputId="seats_booked"
                                            options={seatsOptions}
                                            value={seatsOptions.find(opt => opt.value === data.seats_booked) || null}
                                            onChange={(opt: any) => setData('seats_booked', opt?.value || 1)}
                                            placeholder="Pilih jumlah kursi"
                                            isClearable={false}
                                            required
                                        />
                                        <InputError message={errors.seats_booked} />
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Button type="submit" disabled={processing}>
                                            {isEdit ? 'Update Booking' : 'Create Booking'}
                                        </Button>
                                        <Link
                                            href={route('bookings.index')}
                                            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70 border border-input"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            )}
                            {props.success && (
                                <div className="mt-4 p-2 bg-green-100 text-green-800 rounded border border-green-300">{props.success}</div>
                            )}
                            {props.errors?.error && (
                                <div className="mt-4 p-2 bg-red-100 text-red-800 rounded border border-red-300">{props.errors.error}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
