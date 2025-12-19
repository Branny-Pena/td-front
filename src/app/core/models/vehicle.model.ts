export type VehicleRegisterStatus = 'in progress' | 'confirmed';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  vinNumber: string | null;
  registerStatus: VehicleRegisterStatus;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  licensePlate: string;
  vinNumber?: string;
  registerStatus?: VehicleRegisterStatus;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  licensePlate?: string;
  vinNumber?: string;
  registerStatus?: VehicleRegisterStatus;
}
