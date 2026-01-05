import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(5);
  readonly size = input<number>(16);
  readonly gap = input<number>(2);
  readonly filledClass = input<string>('text-amber-500');
  readonly emptyClass = input<string>('text-gray-300');

  private readonly internalId = `td-stars-${Math.random().toString(36).slice(2, 10)}`;

  readonly stars = computed(() => {
    const count = Math.max(0, Math.floor(this.max()));
    return Array.from({ length: count }, (_, index) => index);
  });

  clipId(starIndex: number): string {
    return `${this.internalId}-clip-${starIndex}`;
  }

  maskId(starIndex: number): string {
    return `${this.internalId}-mask-${starIndex}`;
  }

  getStarFillUnits(starIndex: number): number {
    const percent = this.getStarFillPercent(starIndex);
    return (20 * percent) / 100;
  }

  getStarFillPercent(starIndex: number): number {
    const v = Number.isFinite(this.value()) ? this.value() : 0;
    const normalized = Math.max(0, Math.min(this.max(), v));
    const perStar = normalized - starIndex;
    const clamped = Math.max(0, Math.min(1, perStar));
    return clamped * 100;
  }
}
