import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-content-card',
  standalone: true,
  templateUrl: './content-card.component.html',
  styleUrl: './content-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentCardComponent {
  readonly title = input<string>();
}
