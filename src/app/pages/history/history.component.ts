import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.sass']
})
export class HistoryComponent {
  constructor(private router: Router) {}

  verDetalle(id: number): void {
    // Navegar a la vista de resultados con el ID del resultado
    this.router.navigate(['/details'], { queryParams: { id } });
  }
}
