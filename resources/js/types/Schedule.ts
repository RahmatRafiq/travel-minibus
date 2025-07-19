export interface Schedule {
    id: number;
    route_vehicle_id: number;
    departure_time: string;
    status: string;
    routeVehicle?: {
        id: number;
        route?: {
            id: number;
            name: string;
        };
        vehicle?: {
            id: number;
            plate_number: string;
        };
    };
    created_at?: string;
    updated_at?: string;
    trashed?: boolean;
}
