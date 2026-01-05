import { Customer } from './customer.model';
import { Vehicle } from './vehicle.model';
import { CurrentLocation } from './location.model';
import { DigitalSignature } from './digital-signature.model';
import { ReturnState, CreateReturnStateDto } from './return-state.model';

export type TestDriveFormStatus = 'draft' | 'submitted';
export type TestDriveBrand = 'MERCEDES-BENZ' | 'ANDES MOTOR' | 'STELLANTIS';
export type TestDriveFormStep =
  | 'CUSTOMER_DATA'
  | 'VEHICLE_DATA'
  | 'SIGNATURE_DATA'
  | 'VALUATION_DATA'
  | 'VEHICLE_RETURN_DATA'
  | 'FINAL_CONFIRMATION';

export interface TestDriveForm {
  id: string;
  brand?: TestDriveBrand | null;
  currentStep?: TestDriveFormStep | null;
  purchaseProbability?: number | null;
  estimatedPurchaseDate?: string | null;
  observations?: string | null;
  status: TestDriveFormStatus;
  createdAt: string;
  updatedAt: string;
  customerValoration?: number;
  salesExpert?: string;
  customer: Customer | null;
  vehicle: Vehicle | null;
  location: CurrentLocation | null;
  signature: DigitalSignature | null;
  returnState: ReturnState | null;
}

export interface CreateTestDriveFormDto {
  brand?: TestDriveBrand;
  customerId?: string;
  vehicleId?: string;
  locationId?: string;
  currentStep?: TestDriveFormStep;
  signatureData?: string;
  purchaseProbability?: number;
  estimatedPurchaseDate?: string;
  observations?: string;
  status: TestDriveFormStatus;
  returnState?: CreateReturnStateDto;
}

export interface CreateDraftTestDriveFormDto {
  brand?: TestDriveBrand;
  currentStep?: TestDriveFormStep;
  status: 'draft';
  customerId?: string;
  vehicleId?: string;
  locationId?: string;
}

export interface UpdateTestDriveFormDto {
  brand?: TestDriveBrand;
  customerId?: string;
  vehicleId?: string;
  locationId?: string;
  currentStep?: TestDriveFormStep;
  signatureData?: string;
  purchaseProbability?: number;
  estimatedPurchaseDate?: string;
  observations?: string;
  status?: TestDriveFormStatus;
  returnState?: CreateReturnStateDto;
}
