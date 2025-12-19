import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  signal,
  output,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private resizeObserver: ResizeObserver | null = null;

  readonly hasSignature = signal(false);
  readonly signatureAccepted = output<string>();

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
    this.resizeCanvasToDisplaySize();
    this.observeResize();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private setupEventListeners(): void {
    const canvas = this.canvasRef().nativeElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUpOrCancel);
    canvas.addEventListener('pointercancel', this.onPointerUpOrCancel);
  }

  private removeEventListeners(): void {
    const canvas = this.canvasRef().nativeElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerup', this.onPointerUpOrCancel);
    canvas.removeEventListener('pointercancel', this.onPointerUpOrCancel);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.ctx) return;
    e.preventDefault();

    const canvas = this.canvasRef().nativeElement;
    canvas.setPointerCapture(e.pointerId);

    this.isDrawing = true;
    const { x, y } = this.getPointFromPointerEvent(e);
    this.lastX = x;
    this.lastY = y;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDrawing || !this.ctx) return;
    e.preventDefault();

    const { x, y } = this.getPointFromPointerEvent(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
    this.hasSignature.set(true);
  };

  private onPointerUpOrCancel = (e: PointerEvent): void => {
    e.preventDefault();
    this.isDrawing = false;
    try {
      this.canvasRef().nativeElement.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  private getPointFromPointerEvent(e: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private observeResize(): void {
    const canvas = this.canvasRef().nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvasToDisplaySize());
    this.resizeObserver.observe(canvas);
  }

  private resizeCanvasToDisplaySize(): void {
    if (!this.ctx) return;

    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = globalThis.devicePixelRatio || 1;
    const targetWidth = Math.max(1, Math.round(rect.width * dpr));
    const targetHeight = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width === targetWidth && canvas.height === targetHeight) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return;
    }

    const prevDataUrl = this.hasSignature() ? canvas.toDataURL('image/png') : null;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (prevDataUrl) {
      const img = new Image();
      img.onload = () => {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = prevDataUrl;
    }
  }

  clear(): void {
    const canvas = this.canvasRef().nativeElement;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.hasSignature.set(false);
  }

  accept(): void {
    const canvas = this.canvasRef().nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    this.signatureAccepted.emit(dataUrl);
  }
}
