import { Injectable, signal, computed, effect } from '@angular/core';
import { Customer, Vehicle, CurrentLocation, TestDriveForm } from '../models';

export interface EvaluationData {
  purchaseProbability: number;
  estimatedPurchaseDate: string;
  observations: string;
}

export interface ReturnStateDraft {
  finalMileage: number;
  fuelLevelPercentage: number;
  imageUrls: string[];
}

export interface WizardState {
  customer: Customer | null;
  vehicle: Vehicle | null;
  vehicleAutofilled: boolean;
  location: CurrentLocation | null;
  signatureData: string | null;
  evaluation: EvaluationData | null;
  returnState: ReturnStateDraft | null;
  testDriveForm: TestDriveForm | null;
  currentStep: number;
  previousStep: number;
  draftFormId: string | null;
}

const initialState: WizardState = {
  customer: null,
  vehicle: null,
  vehicleAutofilled: false,
  location: null,
  signatureData: null,
  evaluation: null,
  returnState: null,
  testDriveForm: null,
  currentStep: 1,
  previousStep: 1,
  draftFormId: null
};

const STORAGE_KEY = 'tdWizardState:v1';

@Injectable({
  providedIn: 'root'
})
export class TestDriveStateService {
  private readonly state = signal<WizardState>(initialState);

  readonly customer = computed(() => this.state().customer);
  readonly vehicle = computed(() => this.state().vehicle);
  readonly vehicleAutofilled = computed(() => this.state().vehicleAutofilled);
  readonly location = computed(() => this.state().location);
  readonly signatureData = computed(() => this.state().signatureData);
  readonly evaluation = computed(() => this.state().evaluation);
  readonly returnState = computed(() => this.state().returnState);
  readonly testDriveForm = computed(() => this.state().testDriveForm);
  readonly currentStep = computed(() => this.state().currentStep);
  readonly previousStep = computed(() => this.state().previousStep);
  readonly draftFormId = computed(() => this.state().draftFormId);

  readonly isStep1Valid = computed(() => this.state().customer !== null);
  readonly isStep2Valid = computed(() =>
    this.state().vehicle !== null && this.state().location !== null
  );
  readonly isStep3Valid = computed(() => this.state().signatureData !== null);
  readonly isStep4Valid = computed(() => this.state().evaluation !== null);
  readonly isStep5Valid = computed(() => this.state().returnState !== null);

  constructor() {
    try {
      const raw = globalThis.sessionStorage?.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WizardState>;

        const migratedUser =
          parsed.customer && typeof parsed.customer === 'object' && 'customer' in (parsed.customer as any)
            ? ((parsed.customer as any).customer as Customer)
            : parsed.customer ?? null;

        const migratedVehicle =
          parsed.vehicle && typeof parsed.vehicle === 'object' && 'vehicle' in (parsed.vehicle as any)
            ? ((parsed.vehicle as any).vehicle as Vehicle)
            : parsed.vehicle ?? null;

        this.state.set({
          ...initialState,
          ...parsed,
          customer: migratedUser,
          vehicle: migratedVehicle,
          vehicleAutofilled: parsed.vehicleAutofilled ?? initialState.vehicleAutofilled,
          currentStep: parsed.currentStep ?? initialState.currentStep
        });
      }
    } catch {
      // ignore corrupted storage
    }

    effect(() => {
      try {
        globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(this.state()));
      } catch {
        // ignore quota/security errors
      }
    });
  }

  setUser(customer: Customer): void {
    this.state.update(s => ({ ...s, customer }));
  }

  setVehicle(vehicle: Vehicle): void {
    this.state.update(s => ({ ...s, vehicle }));
  }

  setVehicleAutofilled(vehicleAutofilled: boolean): void {
    this.state.update(s => ({ ...s, vehicleAutofilled }));
  }

  clearVehicle(): void {
    this.state.update(s => ({ ...s, vehicle: null, vehicleAutofilled: false }));
  }

  setLocation(location: CurrentLocation): void {
    this.state.update(s => ({ ...s, location }));
  }

  setSignatureData(signatureData: string | null): void {
    this.state.update(s => ({ ...s, signatureData }));
  }

  setEvaluation(evaluation: EvaluationData): void {
    this.state.update(s => ({ ...s, evaluation }));
  }

  setReturnState(returnState: ReturnStateDraft): void {
    this.state.update(s => ({ ...s, returnState }));
  }

  setTestDriveForm(testDriveForm: TestDriveForm): void {
    this.state.update(s => ({ ...s, testDriveForm }));
  }

  setCurrentStep(step: number): void {
    this.state.update((s) => {
      if (s.currentStep === step) return s;
      return { ...s, previousStep: s.currentStep, currentStep: step };
    });
  }

  setDraftFormId(id: string | null): void {
    this.state.update(s => ({ ...s, draftFormId: id }));
  }

  reset(): void {
    this.state.set(initialState);
    try {
      globalThis.sessionStorage?.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  getSnapshot(): WizardState {
    return this.state();
  }
}
