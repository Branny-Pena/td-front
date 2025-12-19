import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-barcode-scanner-dialog',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, ModalDialogComponent],
  templateUrl: './barcode-scanner-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarcodeScannerDialogComponent {
  readonly isOpen = input(false);
  readonly title = input('Escanear');
  readonly formats = input<BarcodeFormat[]>([
    BarcodeFormat.QR_CODE,
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.PDF_417
  ]);

  readonly scanned = output<string>();
  readonly closed = output<void>();

  readonly hasPermission = signal<boolean | null>(null);
  readonly camerasFound = signal(false);
  readonly errorText = signal<string | null>(null);

  readonly isEnabled = computed(() => this.isOpen());

  onPermissionResponse(hasPermission: boolean): void {
    this.hasPermission.set(hasPermission);
    if (!hasPermission) this.errorText.set('Permiso de cámara denegado.');
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.camerasFound.set(devices.length > 0);
    if (devices.length === 0) this.errorText.set('No se encontró cámara disponible.');
  }

  onScanError(): void {
    this.errorText.set('No se pudo iniciar el escáner.');
  }

  onScanSuccess(result: string): void {
    const value = result.trim();
    if (!value) return;
    this.scanned.emit(value);
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}

