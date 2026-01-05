import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { TestDriveForm } from '../../core/models';
import { TestDriveFormService } from '../../core/services/test-drive-form.service';
import { TestDriveStateService } from '../../core/services/test-drive-state.service';

@Injectable({ providedIn: 'root' })
export class DraftFormContextService {
  private readonly testDriveFormService = inject(TestDriveFormService);
  private readonly stateService = inject(TestDriveStateService);

  ensureLoaded(id: string): Observable<TestDriveForm> {
    const existing = this.stateService.testDriveForm();
    if (existing?.id === id) return of(existing);

    return this.testDriveFormService.getById(id).pipe(
      tap((form) => {
        this.stateService.setDraftFormId(form.id);
        this.stateService.setTestDriveForm(form);
        if (form.customer) this.stateService.setUser(form.customer);
        if (form.vehicle) this.stateService.setVehicle(form.vehicle);
        this.stateService.setSignatureData(form.signature?.signatureData ?? null);

        this.stateService.setEvaluation({
          purchaseProbability: form.purchaseProbability ?? 0,
          estimatedPurchaseDate: form.estimatedPurchaseDate ?? '',
          observations: form.observations ?? ''
        });

        if (form.returnState) {
          const vehicleUrls = (form.returnState.images ?? []).map((i) => i.url);
          this.stateService.setReturnState({
            mileageImageUrl: form.returnState.mileageImage?.url ?? null,
            fuelLevelImageUrl: form.returnState.fuelLevelImage?.url ?? null,
            imageUrls: vehicleUrls
          });
        }
      })
    );
  }
}
