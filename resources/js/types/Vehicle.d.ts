
export type Vehicle = {
  id: number;
  plate_number: string;
  brand: string;
  seat_capacity: number;
  driver: Driver | null;
  route: Route | null;
  routes?: Route[]; 
  trashed?: boolean;
  created_at?: string;
  updated_at?: string;
};
