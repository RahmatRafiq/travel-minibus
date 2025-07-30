import { Head, useForm, router, Link } from '@inertiajs/react';
import { DatePicker } from '@/components/DatePicker';
import SeatPickerComponent, { generateMinibusLayout } from '@/components/SeatPickerComponent';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/select';
import type { Vehicle } from '@/types/Vehicle';
import type { Schedule } from '@/types/Schedule';
type AdminSchedule = Schedule & {
    reservedSeats?: (string | number)[];
};
import type { Booking } from '@/types/Booking';
import BookingPassengerForm from './BookingPassengerForm';
import { BookingPassenger } from '@/types/BookingPassenger';

type Errors = {
    seats_selected?: string;
    error?: string;
    [key: string]: string | undefined;
};

type Props = {
    errors: Errors;
    origin?: string;
    destination?: string;
    route_id?: number;
    routes?: Route[];
    schedules?: AdminSchedule[];
    success?: string;
    allOrigins?: string[];
    allDestinations?: string[];
    departure_date?: string;
};

export default function BookingForm(props: Props) {
    const [search, setSearch] = useState({
        origin: props.origin || '',
        destination: props.destination || '',
        departure_date: props.departure_date || '',
    });
    const autoSelectedRoute = props.routes && props.routes.length === 1 ? props.routes[0].id : null;
    const [selectedRoute, setSelectedRoute] = useState<number | null>(
        props.route_id ? Number(props.route_id) : autoSelectedRoute
    );
    const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        schedule_id: string;
        seats_booked: number;
        seats_selected: (string | number)[];
        passengers: BookingPassenger[];
    }>({
        schedule_id: '',
        seats_booked: 1,
        seats_selected: [],
        passengers: [],
    });

    const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
    React.useEffect(() => {
        setData('seats_selected', selectedSeats.filter(seat => seat !== 'D' && seat !== 'Sopir'));
        setData('passengers', passengers);
    }, [selectedSeats, passengers]);

    const validSelectedSeats = selectedSeats.filter(seat => seat !== 'D' && seat !== 'Sopir');

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
        setFormError(null);
        const seatsToSend = selectedSeats.filter(seat => seat !== 'D' && seat !== 'Sopir');
        setData('seats_selected', seatsToSend);
        setData('passengers', passengers);
        if (!selectedSchedule) {
            setFormError('Pilih jadwal terlebih dahulu.');
            return;
        }
        if (seatsToSend.length === 0) {
            setFormError('Pilih kursi terlebih dahulu.');
            return;
        }
        const emptyNames = passengers.filter(p => !p.name || p.name.trim() === '');
        if (emptyNames.length > 0) {
            setFormError('Semua penumpang wajib diisi nama.');
            return;
        }
        post(route('bookings.store'));
    };

    const originOptions = props.allOrigins?.map(origin => ({ value: origin, label: origin })) || [];
    const destinationOptions = props.allDestinations?.map(dest => ({ value: dest, label: dest })) || [];

    const availableSeats =
        props.schedules?.find(s => s.id === selectedSchedule)?.available_seats || 1;
    const seatsOptions = Array.from({ length: availableSeats }).map((_, i) => ({
        value: i + 1,
        label: String(i + 1),
    }));

    const reservedSeats = props.schedules?.find(s => s.id === selectedSchedule)?.reservedSeats || [];

    // DatePicker
    const dateValue = search.departure_date ? new Date(search.departure_date + 'T12:00:00') : undefined;
    const handleDateChange = (date: Date | null) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            setSearch(s => ({ ...s, departure_date: `${year}-${month}-${day}` }));
        } else {
            setSearch(s => ({ ...s, departure_date: '' }));
        }
    };

    const breadcrumbs = [
        { title: 'Pemesanan', href: route('bookings.index') },
        { title: 'Buat Pemesanan', href: '' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pemesanan" />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Manajemen Pemesanan</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title="Buat Pemesanan"
                            description="Isi detail pemesanan di bawah ini"
                        />
                        <div className="space-y-4">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Asal</label>
                                    <CustomSelect
                                        options={originOptions}
                                        value={originOptions.find(opt => opt.value === search.origin) || null}
                                        onChange={(newValue) => {
                                            if (!newValue || Array.isArray(newValue)) {
                                                setSearch(s => ({ ...s, origin: '' }));
                                            } else {
                                                setSearch(s => ({ ...s, origin: (newValue as { value: string }).value }));
                                            }
                                        }}
                                        placeholder="Pilih Asal"
                                        isClearable
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Tujuan</label>
                                    <CustomSelect
                                        options={destinationOptions}
                                        value={destinationOptions.find(opt => opt.value === search.destination) || null}
                                        onChange={(newValue) => {
                                            if (!newValue || Array.isArray(newValue)) {
                                                setSearch(s => ({ ...s, destination: '' }));
                                            } else {
                                                setSearch(s => ({ ...s, destination: (newValue as { value: string }).value }));
                                            }
                                        }}
                                        placeholder="Pilih Tujuan"
                                        isClearable
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Tanggal Berangkat</label>
                                    <DatePicker
                                        id="booking-date"
                                        value={dateValue}
                                        onChange={handleDateChange}
                                        required
                                        className="w-full"
                                        minDate={new Date()}
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Button type="submit" className="h-10">Cari Jadwal</Button>
                                    <Link
                                        href={route('bookings.index')}
                                        className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70 border border-input"
                                    >
                                        Batal
                                    </Link>
                                </div>
                            </form>
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
                                                    {sch.departure_time} | {sch.vehicle?.plate_number ?? '-'} ({sch.vehicle?.brand ?? '-'}) | Sisa kursi: {sch.available_seats}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {selectedSchedule && (
                                <form onSubmit={handleBooking} className="space-y-4">
                                    <div className="bg-white border border-input p-4">
                                        <label className="block text-xs text-muted-foreground mb-1 font-medium">Pilih Kursi</label>
                                        <SeatPickerComponent
                                            layout={generateMinibusLayout(
                                                props.schedules?.find(s => s.id === selectedSchedule)?.vehicle?.seat_capacity || 8,
                                                [2, 4, 3],
                                                true
                                            )}
                                            reservedSeats={reservedSeats}
                                            selectedSeats={selectedSeats}
                                            onSelect={(seats: (string | number)[]) => {
                                                setSelectedSeats(Array.isArray(seats) ? seats : []);
                                                setFormError(null);
                                            }}
                                        />
                                        <InputError message={errors.seats_selected} />
                                        {formError && <div className="text-red-600 text-sm mt-2">{formError}</div>}
                                    </div>
                                    {validSelectedSeats.length > 0 && (
                                        <BookingPassengerForm
                                            passengers={passengers}
                                            setPassengers={setPassengers}
                                            errors={errors}
                                            seatsCount={validSelectedSeats.length}
                                        />
                                    )}
                                    <div className="flex items-center space-x-4">
                                        <Button type="submit" disabled={processing || !selectedSchedule || validSelectedSeats.length === 0}>
                                            Buat Pemesanan
                                        </Button>
                                        <Link
                                            href={route('bookings.index')}
                                            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70 border border-input"
                                        >
                                            Batal
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
