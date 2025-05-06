import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

interface Evaluacion {
  id: number;
  fecha: string;
  tipo: string;
  resultado: string;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.sass'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class HistoryComponent implements OnInit {
  placa: string = '';
  evaluaciones: Evaluacion[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.placa = params['placa'] || '';
      if (this.placa) {
        this.cargarHistorial();
      } else {
        this.error = 'No se proporcionó un número de placa';
        this.loading = false;
      }
    });
  }

  cargarHistorial(): void {
    this.loading = true;
    this.http.get<any>(`https://parcial1-sw2-backend.onrender.com/api/historial/placa/${this.placa}`).subscribe(
      (data) => {
        if (data && data.evaluaciones && data.evaluaciones.length > 0) {
          this.evaluaciones = data.evaluaciones.map((evaluacion: any) => ({
            id: evaluacion.id,
            fecha: new Date(evaluacion.fecha).toLocaleDateString('es-ES'),
            tipo: evaluacion.tipo === 'F' ? 'Físico' : 'Mecánico',
            resultado: evaluacion.resultado || 'Evaluación completada'
          }));
        } else {
          this.evaluaciones = [];
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar historial:', error);
        this.error = 'Error al cargar el historial. Intenta nuevamente.';
        this.loading = false;
      }
    );
  }

  verDetalle(id: number): void {
    // Navegar a la vista de resultados con el ID del resultado
    this.router.navigate(['/details'], { queryParams: { id } });
  }
}
