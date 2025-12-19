import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Instantiate to ensure persisted theme is applied on bootstrap.
  private readonly themeService = inject(ThemeService);
  protected readonly title = signal('td-app');
}
