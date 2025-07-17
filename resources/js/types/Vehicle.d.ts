export type Driver = {
  id: number;
  name: string;
  phone?: string;
};

export type Route = {
  id: number;
  name: string;
  origin?: string;
  destination?: string;
  duration?: string;
};

export type Vehicle = {
  id: number;
  plate_number: string;
  brand: string;
  seat_capacity: number;
  driver: Driver | null;
  route: Route | null;
  trashed?: boolean;
  created_at?: string;
  updated_at?: string;
};
