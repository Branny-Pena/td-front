export type VehicleRegisterStatus = 'in progress' | 'confirmed';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  color: string;
  location: string;
  licensePlate: string;
  vinNumber: string | null;
  registerStatus: VehicleRegisterStatus;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  color: string;
  location: string;
  licensePlate: string;
  vinNumber?: string;
  registerStatus?: VehicleRegisterStatus;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  color?: string;
  location?: string;
  licensePlate?: string;
  vinNumber?: string;
  registerStatus?: VehicleRegisterStatus;
}

export interface VehicleQrRequestDto {
  brand: string;
  model: string;
  color: string;
  licensePlate: string;
  vin?: string;
  location: string;
}

export interface VehicleQrResponseDto {
  payload: string;
  qrCodeDataUrl: string;
}
