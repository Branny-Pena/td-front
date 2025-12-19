import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-modal-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDialogComponent {
  readonly isOpen = input(false);
  readonly title = input<string>('');
  readonly contentId = input<string | null>(null);
  readonly closeOnOverlay = input(true);
  readonly closeOnEscape = input(true);

  readonly acceptText = input('Aceptar');
  readonly rejectText = input('Cancelar');
  readonly acceptDisabled = input(false);
  readonly rejectDisabled = input(false);

  readonly accept = output<void>();
  readonly reject = output<void>();
  readonly closed = output<void>();

  @ViewChild('dialogEl') private readonly dialogEl?: ElementRef<HTMLElement>;

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private previouslyFocused: Element | null = null;
  private readonly internalTitleId = `td-modal-title-${Math.random().toString(36).slice(2, 10)}`;

  readonly titleId = computed(() => this.internalTitleId);
  readonly ariaDescribedBy = computed(() => this.contentId() ?? null);

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      this.previouslyFocused = document.activeElement;
      queueMicrotask(() => this.focusFirst());
    });

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (!this.isOpen()) return;
        if (event.key === 'Escape' && this.closeOnEscape()) {
          event.preventDefault();
          this.close();
          return;
        }
        if (event.key === 'Tab') this.trapTab(event);
      });
  }

  onOverlayPointerDown(event: PointerEvent): void {
    if (!this.closeOnOverlay()) return;
    if (event.target !== event.currentTarget) return;
    this.close();
  }

  onReject(): void {
    this.reject.emit();
    this.close();
  }

  onAccept(): void {
    this.accept.emit();
  }

  close(): void {
    this.closed.emit();
    queueMicrotask(() => {
      const el = this.previouslyFocused as HTMLElement | null;
      el?.focus?.();
    });
  }

  private focusFirst(): void {
    const dialog = this.dialogEl?.nativeElement;
    if (!dialog) return;
    const focusables = this.getFocusable(dialog);
    (focusables[0] ?? dialog).focus?.();
  }

  private trapTab(event: KeyboardEvent): void {
    const dialog = this.dialogEl?.nativeElement;
    if (!dialog) return;
    const focusables = this.getFocusable(dialog);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusable(root: HTMLElement): HTMLElement[] {
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.visibility !== 'hidden' && style.display !== 'none';
    });
  }
}

