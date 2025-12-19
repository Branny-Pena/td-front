import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
  dayOfWeek: number; // 0..6 (Sun..Sat)
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toYyyyMmDdLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseYyyyMmDdLocal(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const day = Number(m[3]);
  const date = new Date(year, monthIndex, day);
  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) return null;
  return date;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly label = input<string | null>(null);

  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly isOpen = signal(false);
  readonly isDisabled = signal(false);
  readonly viewMode = signal<'day' | 'month' | 'year'>('day');
  readonly yearPageStart = signal<number>(new Date().getFullYear() - 7);

  private readonly selectedDate = signal<Date | null>(null);
  readonly viewMonth = signal<number>(new Date().getMonth());
  readonly viewYear = signal<number>(new Date().getFullYear());

  readonly displayValue = signal<string>('');
  protected readonly trackKey = (d: Date) => toYyyyMmDdLocal(d);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    if (!value) {
      this.selectedDate.set(null);
      this.displayValue.set('');
      return;
    }

    const parsed = parseYyyyMmDdLocal(value);
    if (!parsed) return;

    this.selectedDate.set(parsed);
    this.viewMonth.set(parsed.getMonth());
    this.viewYear.set(parsed.getFullYear());
    this.yearPageStart.set(parsed.getFullYear() - 7);
    this.displayValue.set(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    if (isDisabled) this.isOpen.set(false);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.viewMode.set('day');
      this.yearPageStart.set(this.viewYear() - 7);
    }
    this.onTouched();
  }

  close(): void {
    this.isOpen.set(false);
    this.viewMode.set('day');
  }

  prev(): void {
    const mode = this.viewMode();
    if (mode === 'day') {
      const month = this.viewMonth();
      const year = this.viewYear();
      if (month === 0) {
        this.viewMonth.set(11);
        this.viewYear.set(year - 1);
      } else {
        this.viewMonth.set(month - 1);
      }
      return;
    }

    if (mode === 'month') {
      this.viewYear.update((y) => y - 1);
      return;
    }

    this.yearPageStart.update((y) => y - 16);
  }

  next(): void {
    const mode = this.viewMode();
    if (mode === 'day') {
      const month = this.viewMonth();
      const year = this.viewYear();
      if (month === 11) {
        this.viewMonth.set(0);
        this.viewYear.set(year + 1);
      } else {
        this.viewMonth.set(month + 1);
      }
      return;
    }

    if (mode === 'month') {
      this.viewYear.update((y) => y + 1);
      return;
    }

    this.yearPageStart.update((y) => y + 16);
  }

  monthLabel(): string {
    const month = this.viewMonth();
    const year = this.viewYear();
    return new Date(year, month, 1).toLocaleString(undefined, { month: 'long' });
  }

  yearLabel(): string {
    return String(this.viewYear());
  }

  openMonthSelector(): void {
    this.viewMode.set('month');
  }

  openYearSelector(): void {
    this.viewMode.set('year');
    this.yearPageStart.set(this.viewYear() - 7);
  }

  months(): { label: string; index: number }[] {
    const year = this.viewYear();
    return Array.from({ length: 12 }, (_, index) => ({
      index,
      label: new Date(year, index, 1).toLocaleString(undefined, { month: 'short' })
    }));
  }

  years(): number[] {
    const start = this.yearPageStart();
    return Array.from({ length: 16 }, (_, i) => start + i);
  }

  selectMonth(monthIndex: number): void {
    this.viewMonth.set(monthIndex);
    this.viewMode.set('day');
  }

  selectYear(year: number): void {
    this.viewYear.set(year);
    this.viewMode.set('month');
  }

  dayCells(): DayCell[] {
    const month = this.viewMonth();
    const year = this.viewYear();

    const firstOfMonth = new Date(year, month, 1);
    const startDow = firstOfMonth.getDay(); // 0..6
    const gridStart = new Date(year, month, 1 - startDow);

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      cells.push({
        date,
        inCurrentMonth: date.getMonth() === month,
        dayOfWeek: date.getDay()
      });
    }
    return cells;
  }

  isWeekend(cell: DayCell): boolean {
    return cell.dayOfWeek === 0 || cell.dayOfWeek === 6;
  }

  isSelected(cell: DayCell): boolean {
    const selected = this.selectedDate();
    return !!selected && toYyyyMmDdLocal(selected) === toYyyyMmDdLocal(cell.date);
  }

  isToday(cell: DayCell): boolean {
    const todayKey = toYyyyMmDdLocal(new Date());
    return cell.inCurrentMonth && toYyyyMmDdLocal(cell.date) === todayKey;
  }

  select(cell: DayCell): void {
    if (this.isDisabled()) return;
    if (!cell.inCurrentMonth) return;

    this.selectedDate.set(cell.date);
    const value = toYyyyMmDdLocal(cell.date);
    this.displayValue.set(value);
    this.onChange(value);
    this.close();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(e: MouseEvent): void {
    if (!this.isOpen()) return;
    const host = this.hostRef.nativeElement;
    if (!host.contains(e.target as Node)) {
      this.close();
    }
  }
}
