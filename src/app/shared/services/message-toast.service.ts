import { Injectable, signal } from '@angular/core';

export interface MessageToast {
  id: string;
  title?: string;
  message: string;
  durationMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageToastService {
  private readonly toastsSignal = signal<MessageToast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(
    message: string,
    options?: {
      title?: string;
      durationMs?: number;
    }
  ): void {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const toast: MessageToast = {
      id,
      title: options?.title,
      message,
      durationMs: options?.durationMs ?? 3500
    };

    this.toastsSignal.update((toasts) => [...toasts, toast]);
    globalThis.setTimeout(() => this.dismiss(id), toast.durationMs);
  }

  dismiss(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}
