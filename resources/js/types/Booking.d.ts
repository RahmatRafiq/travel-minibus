import { User } from ".";

export interface Booking {
    id: number;
    user_id: number;
    schedule_id: number;
    booking_time: string; 
    seats_booked: number;
    seats_selected: string[];
    status: string;
    reference: string;
    BookingPassenger?: BookingPassenger[];
    user?: User;
    amount: number;
}