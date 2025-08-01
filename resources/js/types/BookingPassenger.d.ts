export interface BookingPassenger {
    [key: string]: string | number | undefined;
    id?: number;
    booking_id: number;
    name: string;
    phone_number: string;
    pickup_address: string;
    pickup_latitude: number;
    pickup_longitude: number;
    created_at?: string;
    updated_at?: string;
}