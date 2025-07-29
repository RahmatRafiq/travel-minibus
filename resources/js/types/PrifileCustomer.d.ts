import { User } from './UserRolePermission';

export interface ProfileCustomer {
  phone_number?: string;
  pickup_address?: string;
  address?: string;
  pickup_latitude?: number | string;
  pickup_longitude?: number | string;
}
