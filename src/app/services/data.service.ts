import { Injectable } from '@angular/core';

interface VehiculoSeleccionado{
  placa: string;
  marca: string;
  modelo: string;
  año: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private vehiculoSeleccionado: VehiculoSeleccionado | null = null;
  private imageUrl: string = '';
  // Add this to your DataService class
  private aiQueryResponse: {archivo: string, nivel: string, detecciones: number} = {
    archivo: '',
    nivel: '',
    detecciones: 0
  };
  // Información de la evaluación
  private fechaEvaluacion: string = '';
  private tipoEvaluacion: string = '';
  private evaluacionId: number = 0;
  
  // Información del vehículo
  private marcaVehiculo: string = '';
  private modeloVehiculo: string = '';
  private anioVehiculo: number = 0;
  
  // Información del daño
  private tipoDano: string = '';
  private gravedadDano: string = '';
  private recomendacion: string = '';
  private presupuesto: number = 0;


  constructor(){ }

  setVehiculoSeleccionado(vehiculo: VehiculoSeleccionado): void {
    this.vehiculoSeleccionado = vehiculo;
  }

  getVehiculoSeleccionado(): VehiculoSeleccionado | null {
    return this.vehiculoSeleccionado
  }

  setImageUrl(url: string): void {
    this.imageUrl = url;
  }

  getImageUrl(): string {
    return this.imageUrl;
  }

  // Métodos para la evaluación
  setEvaluacionInfo(fecha: string, tipo: string, id: number): void {
    this.fechaEvaluacion = fecha;
    this.tipoEvaluacion = tipo;
    this.evaluacionId = id;
  }
  
  getEvaluacionInfo(): {fecha: string, tipo: string, id: number} {
    return {
      fecha: this.fechaEvaluacion,
      tipo: this.tipoEvaluacion,
      id: this.evaluacionId
    };
  }
  
  // Métodos para el vehículo
  setVehiculoInfo(marca: string, modelo: string, anio: number): void {
    this.marcaVehiculo = marca;
    this.modeloVehiculo = modelo;
    this.anioVehiculo = anio;
  }
  
  getVehiculoInfo(): {marca: string, modelo: string, anio: number} {
    return {
      marca: this.marcaVehiculo,
      modelo: this.modeloVehiculo,
      anio: this.anioVehiculo
    };
  }
  
  // Métodos para el daño
  setDanoInfo(tipo: string, gravedad: string, recomendacion: string, presupuesto: number): void {
    this.tipoDano = tipo;
    this.gravedadDano = gravedad;
    this.recomendacion = recomendacion;
    this.presupuesto = presupuesto;
  }
  
  getDanoInfo(): {tipo: string, gravedad: string, recomendacion: string, presupuesto: number} {
    return {
      tipo: this.tipoDano,
      gravedad: this.gravedadDano,
      recomendacion: this.recomendacion,
      presupuesto: this.presupuesto
    };
  }

  setAiQueryResponse(response: {archivo: string, nivel: string, detecciones: number}): void {
    this.aiQueryResponse = response;
  }
  
  getAiQueryResponse(): {archivo: string, nivel: string, detecciones: number} {
    return this.aiQueryResponse;
  }

  /*setResults(ubicacion: string, gravedad: string, recomendaciones: string): void {
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
  }*/
}
