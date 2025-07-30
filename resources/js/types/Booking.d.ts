export interface Booking {
    id: number;
    user_id: number;
    schedule_id: number;
    booking_time: string; 
    seats_booked: number;
    seats_selected: string[];
    status: string;
}