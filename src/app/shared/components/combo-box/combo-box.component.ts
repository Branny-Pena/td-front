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
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type ComboBoxOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-combo-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combo-box.component.html',
  styleUrl: './combo-box.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ComboBoxComponent,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboBoxComponent implements ControlValueAccessor {
  readonly id = input<string | null>(null);
  readonly placeholder = input<string>('Escriba un texto');
  readonly options = input<ComboBoxOption[]>([]);
  readonly ariaLabel = input<string | null>(null);
  readonly ariaRequired = input(false);
  readonly disabled = input(false);
  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  @ViewChild('inputEl', { static: true }) private readonly inputEl?: ElementRef<HTMLInputElement>;

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private readonly internalId = `td-combobox-${Math.random().toString(36).slice(2, 10)}`;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly value = signal<string>('');
  readonly activeIndex = signal(-1);

  readonly inputId = computed(() => this.id() ?? this.internalId);
  readonly listboxId = computed(() => `${this.inputId()}-listbox`);
  readonly activeDescendantId = computed(() => {
    const idx = this.activeIndex();
    if (!this.isOpen() || idx < 0) return null;
    const opt = this.filteredOptions()[idx];
    if (!opt) return null;
    return `${this.inputId()}-opt-${opt.value}`;
  });

  readonly selectedOption = computed(() => {
    const v = this.value();
    return this.options().find((o) => o.value === v) ?? null;
  });

  readonly filteredOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const opts = this.options();
    if (!q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  });

  readonly displayValue = computed(() => {
    if (this.isOpen()) return this.query();
    return this.selectedOption()?.label ?? '';
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) return;
      const v = this.value();
      const label = this.options().find((o) => o.value === v)?.label ?? '';
      this.query.set(label);
    });

    fromEvent<PointerEvent>(document, 'pointerdown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (!this.isOpen()) return;
        const target = event.target as Node | null;
        if (!target) return;
        if (this.hostEl.nativeElement.contains(target)) return;
        this.close(true);
      });
  }

  writeValue(value: string | null): void {
    const safe = value ?? '';
    this.value.set(safe);
    this.query.set(this.options().find((o) => o.value === safe)?.label ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    if (this.isDisabled()) this.close();
  }

  open(): void {
    if (this.isDisabled()) return;
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.query.set(this.selectedOption()?.label ?? this.query());
    const next = this.filteredOptions().length ? 0 : -1;
    this.activeIndex.set(next);
  }

  toggle(): void {
    if (this.isOpen()) this.close(true);
    else this.open();
  }

  close(commitExactMatch = false): void {
    if (!this.isOpen()) return;
    if (commitExactMatch) this.commitExactMatch();
    this.isOpen.set(false);
    this.activeIndex.set(-1);
    this.query.set(this.selectedOption()?.label ?? '');
    this.onTouched();
  }

  focusInput(): void {
    this.inputEl?.nativeElement.focus();
  }

  onInput(event: Event): void {
    const nextQuery = (event.target as HTMLInputElement).value ?? '';
    this.query.set(nextQuery);
    if (!this.isOpen()) this.open();
    const next = this.filteredOptions().length ? 0 : -1;
    this.activeIndex.set(next);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    const opts = this.filteredOptions();
    const hasOptions = opts.length > 0;
    const active = this.activeIndex();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isOpen()) this.open();
        if (!hasOptions) return;
        this.activeIndex.set(Math.min(active + 1, opts.length - 1));
        return;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.isOpen()) this.open();
        if (!hasOptions) return;
        this.activeIndex.set(Math.max(active - 1, 0));
        return;
      }
      case 'Enter': {
        if (!this.isOpen()) {
          this.open();
          event.preventDefault();
          return;
        }
        if (!hasOptions) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        const idx = active >= 0 ? active : 0;
        const picked = opts[idx];
        if (picked) this.select(picked);
        return;
      }
      case 'Escape': {
        if (!this.isOpen()) return;
        event.preventDefault();
        this.close(false);
        return;
      }
      case 'Tab': {
        this.close(true);
        return;
      }
      default:
        return;
    }
  }

  onOptionPointerEnter(index: number): void {
    this.activeIndex.set(index);
  }

  select(option: ComboBoxOption): void {
    this.value.set(option.value);
    this.query.set(option.label);
    this.onChange(option.value);
    this.close(false);
    queueMicrotask(() => this.focusInput());
  }

  onBlur(): void {
    if (!this.isOpen()) {
      this.onTouched();
      return;
    }
    this.close(true);
  }

  private commitExactMatch(): void {
    const q = this.query().trim().toLowerCase();
    if (!q) return;
    const match = this.options().find((o) => o.label.toLowerCase() === q);
    if (!match) return;
    if (match.value === this.value()) return;
    this.value.set(match.value);
    this.onChange(match.value);
  }
}
