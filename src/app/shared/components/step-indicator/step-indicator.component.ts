import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  templateUrl: './step-indicator.component.html',
  styleUrl: './step-indicator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('circleFill', [
      transition('void => *', animate('0ms')),
      state(
        'todo',
        style({
          backgroundColor: 'var(--td-step-todo-bg)',
          color: 'var(--td-step-todo-fg)',
          transform: 'scale(1)'
        })
      ),
      state(
        'current',
        style({
          backgroundColor: 'var(--td-step-fill)',
          color: '#ffffff',
          transform: 'scale(1.06)'
        })
      ),
      state(
        'done',
        style({
          backgroundColor: 'var(--td-step-fill)',
          color: '#ffffff',
          transform: 'scale(1)'
        })
      ),
      transition('* => *', animate('420ms cubic-bezier(0.2, 0, 0, 1)'))
    ]),
    trigger('barFill', [
      transition('void => *', animate('0ms')),
      state('empty', style({ transform: 'scaleX(0)' })),
      state('filled', style({ transform: 'scaleX(1)' })),
      transition('empty <=> filled', animate('520ms cubic-bezier(0.2, 0, 0, 1)'))
    ])
  ]
})
export class StepIndicatorComponent implements AfterViewInit {
  readonly currentStep = input.required<number>();
  readonly totalSteps = input<number>(6);
  readonly previousStep = input<number | null>(null);

  private readonly ready = signal(false);

  readonly steps = computed(() =>
    Array.from({ length: this.totalSteps() }, (_, i) => i + 1)
  );

  ngAfterViewInit(): void {
    if (this.shouldPlayEntryAnimation()) {
      // Defer to next tick so the template paints the "before" state first.
      globalThis.setTimeout(() => this.ready.set(true), 0);
    } else {
      this.ready.set(true);
    }
  }

  protected shouldPlayEntryAnimation(): boolean {
    const prev = this.previousStep();
    if (prev === null) return false;
    return prev < this.currentStep();
  }

  protected shouldAnimateConnector(step: number): boolean {
    const prev = this.previousStep();
    if (prev === null) return false;
    return this.shouldPlayEntryAnimation() && step === prev;
  }

  protected connectorFillState(step: number): 'empty' | 'filled' {
    if (!this.shouldAnimateConnector(step)) {
      return step < this.currentStep() ? 'filled' : 'empty';
    }

    return this.ready() ? 'filled' : 'empty';
  }

  protected circleAnimState(step: number): 'todo' | 'current' | 'done' {
    const prev = this.previousStep();
    const current = this.currentStep();

    if (prev !== null && prev < current && step === current) {
      return this.ready() ? 'current' : 'todo';
    }

    return this.circleState(step);
  }

  protected circleState(step: number): 'todo' | 'current' | 'done' {
    const current = this.currentStep();
    if (step < current) return 'done';
    if (step === current) return 'current';
    return 'todo';
  }
}
