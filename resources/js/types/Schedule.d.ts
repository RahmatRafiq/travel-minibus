import { Vehicle } from "./Vehicle";

export interface Schedule {
    id: number;
    route_vehicle_id: number;
    departure_time: string;
    available_seats?: number;
    status: string;
    vehicle?: Vehicle;
    route?: Route;
    vehicle?: Vehicle;
    created_at?: string;
    updated_at?: string;
    trashed?: boolean;
}
