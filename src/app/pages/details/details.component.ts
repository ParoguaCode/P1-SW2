import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

interface Evaluacion {
  id: number;
  fecha: string;
  tipo: string;
  vehiculo?: {
    marca: string;
    modelo: string;
    año: number;
  };
  danoFisico?: {
    tipo: string;
    gravedad: string;
  };
  archivo?: {
    url: string;
  };
  respuestaAiQuery?: string;
}

@Component({
  selector: 'app-details',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.sass',
  standalone: true,
})
export class DetailsComponent implements OnInit {
  evaluacionId: number = 0;
  evaluacion: Evaluacion | null = null;
  loading: boolean = true;
  error: string = '';
  
  // Variables para mostrar en la vista
  imageUrl: string = '';
  fecha: string = '';
  tipoEvaluacion: string = '';
  marca: string = '';
  modelo: string = '';
  anio: number = 0;
  tipoDano: string = '';
  gravedad: string = '';
  recomendacion: string = '';
  presupuesto: number = 0;
  respuestaAI: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.evaluacionId = Number(params['id']) || 0;
      if (this.evaluacionId) {
        this.cargarEvaluacion();
      } else {
        this.error = 'No se proporcionó un ID de evaluación válido';
        this.loading = false;
      }
    });
  }

  cargarEvaluacion(): void {
    this.loading = true;
    this.http.get<any>(`https://parcial1-sw2-backend.onrender.com/api/evaluacion/${this.evaluacionId}`).subscribe(
      (data) => {
        console.log('Datos recibidos del backend:', data);
        
        if (data) {
          this.evaluacion = data;
          
          // Procesar los datos para mostrarlos en la vista
          this.fecha = new Date(data.fecha).toLocaleDateString('es-ES');
          this.tipoEvaluacion = data.tipo === 'F' ? 'Físico' : 'Mecánico';
          
          if (data.vehiculo) {
            this.marca = data.vehiculo.marca;
            this.modelo = data.vehiculo.modelo;
            this.anio = data.vehiculo.año;
          }
          
          // Ahora usamos danosFisicos (array) en lugar de danoFisico (objeto)
          if (data.danosFisicos && data.danosFisicos.length > 0) {
            const danoFisico = data.danosFisicos[0]; // Tomamos el primer daño físico
            this.tipoDano = danoFisico.tipo || 'No especificado';
            this.gravedad = danoFisico.gravedad || 'No especificada';
            
            // Generar recomendación basada en la marca, modelo y gravedad
            this.recomendacion = this.generarRecomendacion(
              this.marca,
              this.modelo,
              this.gravedad
            );
            
            // Calcular presupuesto estimado
            this.presupuesto = this.calcularPresupuesto(
              this.marca,
              this.tipoDano,
              this.gravedad
            );
          }
          
          // Ahora usamos archivos (array) en lugar de archivo (objeto)
          if (data.archivos && data.archivos.length > 0) {
            // Filtramos solo los archivos de tipo imagen (tipo 'I')
            const imagenes = data.archivos.filter((archivo: any) => archivo.tipo === 'I');
            if (imagenes.length > 0) {
              this.imageUrl = imagenes[0].url;
            }
          }
          
          if (data.respuestaAiQuery) {
            this.respuestaAI = data.respuestaAiQuery;
          }
        } else {
          this.error = 'No se encontró la evaluación solicitada';
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar evaluación:', error);
        this.error = 'Error al cargar la evaluación. Intenta nuevamente.';
        this.loading = false;
      }
    );
  }

  // Método para generar recomendaciones basadas en marca, modelo y gravedad
  generarRecomendacion(marca: string, modelo: string, gravedad: string): string {
    let recomendacion = '';
    
    switch(gravedad.toLowerCase()) {
      case 'grave':
        recomendacion = `Para un ${marca} ${modelo} con daño grave, recomendamos acudir inmediatamente a un taller especializado en la marca. Es necesario reemplazar las piezas afectadas y posiblemente realizar trabajos de chasis. No es seguro conducir el vehículo en este estado.`;
        break;
      case 'moderado':
        recomendacion = `Para un ${marca} ${modelo} con daño moderado, recomendamos una revisión en un taller autorizado. Las piezas afectadas pueden requerir reparación o reemplazo, pero el vehículo puede ser conducido con precaución.`;
        break;
      case 'leve':
        recomendacion = `Para un ${marca} ${modelo} con daño leve, puede programar una visita a su taller de confianza. El daño es principalmente estético y no afecta la funcionalidad del vehículo.`;
        break;
      default:
        recomendacion = `Recomendamos una evaluación profesional para determinar el alcance del daño en su ${marca} ${modelo}.`;
    }
    
    return recomendacion;
  }

  // Método para calcular presupuesto estimado
  calcularPresupuesto(marca: string, tipoDano: string, gravedad: string): number {
    // Valores base según la marca (en bolivianos)
    const valorBaseMarca: {[key: string]: number} = {
      'Toyota': 1500,
      'Honda': 1600,
      'Nissan': 1400,
      'Chevrolet': 1300,
      'Ford': 1700,
      'Hyundai': 1200,
      'Kia': 1250,
      'Volkswagen': 1800,
      'BMW': 3000,
      'Mercedes-Benz': 3200
    };
    
    // Multiplicador según gravedad
    const multiplicadorGravedad: {[key: string]: number} = {
      'grave': 3,
      'moderado': 1.5,
      'leve': 0.8
    };
    
    // Multiplicador según tipo de daño
    const multiplicadorTipoDano: {[key: string]: number} = {
      'abolladura': 1.2,
      'rayón': 0.7,
      'rotura': 1.5,
      'grieta': 1.3
    };
    
    // Obtener valores base o usar valores por defecto
    const valorBase = valorBaseMarca[marca] || 1500;
    const multGravedad = multiplicadorGravedad[gravedad.toLowerCase()] || 1;
    const multTipo = multiplicadorTipoDano[tipoDano.toLowerCase()] || 1;
    
    // Calcular presupuesto estimado
    return Math.round(valorBase * multGravedad * multTipo);
  }

  volver(): void {
    window.history.back();
  }
}
