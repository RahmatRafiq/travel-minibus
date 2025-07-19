export interface Schedule {
    id: number;
    route_vehicle_id: number;
    departure_time: string;
    available_seats?: number;
    status: string;
    routeVehicle?: {
        id: number;
        route?: Route;
        vehicle?: Vehicle;
    };
    vehicle?: Vehicle;
    created_at?: string;
    updated_at?: string;
    trashed?: boolean;
}
