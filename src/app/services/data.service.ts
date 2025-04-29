import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private imageUrl: string = '';
  private ubicacion: string = '';
  private gravedad: string = '';
  private recomendaciones: string = '';

  setImageUrl(url: string): void {
    this.imageUrl = url;
  }

  getImageUrl(): string {
    return this.imageUrl;
  }

  setResults(ubicacion: string, gravedad: string, recomendaciones: string): void {
    this.ubicacion = ubicacion;
    this.gravedad = gravedad;
    this.recomendaciones = recomendaciones;
  }

  getResults(): { ubicacion: string; gravedad: string; recomendaciones: string } {
    return {
      ubicacion: this.ubicacion,
      gravedad: this.gravedad,
      recomendaciones: this.recomendaciones,
    };
  }
}
