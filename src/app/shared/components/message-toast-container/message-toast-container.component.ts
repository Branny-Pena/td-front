import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessageToastService } from '../../services/message-toast.service';

@Component({
  selector: 'app-message-toast-container',
  standalone: true,
  templateUrl: './message-toast-container.component.html',
  styleUrl: './message-toast-container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate3d(0, -8px, 0)', filter: 'blur(1px)' }),
        animate(
          '160ms cubic-bezier(0.2, 0, 0, 1)',
          style({ opacity: 1, transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' })
        )
      ]),
      transition(':leave', [
        animate(
          '140ms cubic-bezier(0.4, 0, 1, 1)',
          style({ opacity: 0, transform: 'translate3d(0, -8px, 0)', filter: 'blur(1px)' })
        )
      ])
    ])
  ]
})
export class MessageToastContainerComponent {
  protected readonly toastService = inject(MessageToastService);
}

