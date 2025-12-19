import { Customer } from './customer.model';
import { Vehicle } from './vehicle.model';
import { CurrentLocation } from './location.model';
import { DigitalSignature } from './digital-signature.model';
import { ReturnState, CreateReturnStateDto } from './return-state.model';

export type TestDriveFormStatus = 'draft' | 'pending' | 'submitted';

export interface TestDriveForm {
  id: string;
  purchaseProbability: number;
  estimatedPurchaseDate: string;
  observations: string;
  status: TestDriveFormStatus;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  vehicle: Vehicle;
  location: CurrentLocation;
  signature: DigitalSignature | null;
  returnState: ReturnState | null;
}

export interface CreateTestDriveFormDto {
  customerId: string;
  vehicleId: string;
  locationId: string;
  signatureData?: string;
  purchaseProbability: number;
  estimatedPurchaseDate: string;
  observations?: string;
  status: TestDriveFormStatus;
  returnState?: CreateReturnStateDto;
}

export interface CreateDraftTestDriveFormDto {
  customerId: string;
  vehicleId: string;
  locationId: string;
  signatureData?: string;
  status: 'draft';
}

export interface UpdateTestDriveFormDto {
  customerId?: string;
  vehicleId?: string;
  locationId?: string;
  signatureData?: string;
  purchaseProbability?: number;
  estimatedPurchaseDate?: string;
  observations?: string;
  status?: TestDriveFormStatus;
  returnState?: CreateReturnStateDto;
}
