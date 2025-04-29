import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.sass'],
})
export class ResultsComponent implements OnInit {
  imageUrl: string = '';
  ubicacion: string = '';
  gravedad: string = '';
  recomendaciones: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.imageUrl = this.dataService.getImageUrl();
    const results = this.dataService.getResults();
    this.ubicacion = results.ubicacion;
    this.gravedad = results.gravedad;
    this.recomendaciones = results.recomendaciones;
  }
}
