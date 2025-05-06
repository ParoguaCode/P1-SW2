import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

interface Vehiculo{
  id: number;
  marca: string;
  modelo: string;
  año: number;
  deletedAt: null | string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule, HttpClientModule], // Asegúrate de incluir HttpClientModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit{
  isModalOpen = false;
  vehiculos: Vehiculo[] = [];
  marcasUnicas: string[] = [];
  modelosPorMarca: { [marca: string]: string[]} = {};
  aniosPorModelo: { [modelo: string]:number[]} = {};
  marcaSeleccionada: string = '';
  modeloSeleccionado: string = '';
  anioSeleccionado: number | null = null;
  placaVehiculo:string = '';

  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void{
      this.http.get<Vehiculo[]>('http://localhost:3000/api/vehiculo').subscribe((data) => {
        this.vehiculos = data;
        this.procesarDatosVehiculos();
      },
      (error) => {
        console.error('Error al cargar vehiculos:', error);
      }
    );
  }

  procesarDatosVehiculos(): void{
   //Extraer marcas unicas
   this.marcasUnicas = [... new Set(this.vehiculos.map(v => v.marca))].sort();
   
   //Agrupar modelos por marca
   this.marcasUnicas.forEach(marca => {
    const modelosDeMarca = this.vehiculos.filter(v => v.marca === marca).map(v => v.modelo);
    this.modelosPorMarca[marca] = [...new Set(modelosDeMarca)].sort();
   });

   //Agrupar años por modelo
   this.vehiculos.forEach(v => {
    if(!this.aniosPorModelo[v.modelo]){
      this.aniosPorModelo[v.modelo] = [];
    }
    if(!this.aniosPorModelo[v.modelo].includes(v.año)){
      this.aniosPorModelo[v.modelo].push(v.año);
    }
   });
   // Ordenar los años de cada modelo
   Object.keys(this.aniosPorModelo).forEach(modelo => {
    // Ordenar de más reciente a más antiguo
    this.aniosPorModelo[modelo].sort((a, b) => b - a); 
   });
  }

  onMarcaChange(): void{
    this.modeloSeleccionado = '';
    this.anioSeleccionado = null;
  }

  onModeloChange(): void{
    this.anioSeleccionado = null;
  }

  openModal(): void{
    this.isModalOpen = true;
  }

  closeModal(): void{
    this.isModalOpen = false;
  }

  findVehiculoId(marca: string, modelo: string, anio: number): Promise<number | null> {
    // Return a Promise so we can use async/await with this function
    return new Promise((resolve, reject) => {
      // Make a fresh API call to get the latest vehicles data
      this.http.get<Vehiculo[]>('http://localhost:3000/api/vehiculo').subscribe({
        next: (vehiculos) => {
          const vehiculoEncontrado = vehiculos.find(v => 
            v.marca === marca && 
            v.modelo === modelo && 
            v.año === anio
          );
          
          if (vehiculoEncontrado) {
            console.log('Vehículo encontrado:', vehiculoEncontrado);
            resolve(vehiculoEncontrado.id);
          } else {
            console.log('No se encontró el vehículo con los criterios:', {
              marca: marca,
              modelo: modelo,
              año: anio
            });
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Error al buscar el vehículo:', error);
          reject(error);
        }
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async onSubmit(): Promise<void> {
    if (this.placaVehiculo && this.marcaSeleccionada && this.modeloSeleccionado && this.anioSeleccionado && this.selectedFile) {
      try {
        // Convertir anioSeleccionado a número si es necesario
        const anio = typeof this.anioSeleccionado === 'string' ? parseInt(this.anioSeleccionado) : this.anioSeleccionado;
        
        // Esperar a que se resuelva la promesa para obtener el ID
        const vehiculoId = await this.findVehiculoId(
          this.marcaSeleccionada, 
          this.modeloSeleccionado, 
          anio
        );
        
        if (!vehiculoId) {
          alert('No se pudo encontrar el ID del vehículo. Por favor, intente nuevamente.');
          return;
        }
        
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('fileName', this.selectedFile.name);
        formData.append('vehiculoId', vehiculoId.toString());

        // Mostrar mensaje de carga
        alert('Procesando su solicitud, por favor espere...');

        //this.http.post<any>('https://jhwd7bkf-3000.brs.devtunnels.ms/api/archivo/upload-file', formData).subscribe({
        this.http.post<any>('http://localhost:3000/api/archivo/upload-file', formData).subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            
            // Guardar datos relevantes en el servicio
            if (response.archivo && response.archivo.url) {
              this.dataService.setImageUrl(response.archivo.url);
            }

            if (response.respuestaAiQuery) {
              this.dataService.setAiQueryResponse(response.respuestaAiQuery);
            }

            if (response.evaluacion) {
              const tipoEvaluacion = response.evaluacion.tipo === 'F' ? 'Físico' : 'Mecánico';
              this.dataService.setEvaluacionInfo(
                response.evaluacion.fecha,
                tipoEvaluacion,
                response.evaluacion.id
              );
              
              // Guardar datos del vehículo
              if (response.evaluacion.vehiculo) {
                this.dataService.setVehiculoInfo(
                  response.evaluacion.vehiculo.marca,
                  response.evaluacion.vehiculo.modelo,
                  response.evaluacion.vehiculo.año
                );
              }
            }
            
            // Procesar datos del daño físico
            if (response.danoFisico) {
              const gravedad = response.danoFisico.gravedad || 'No especificada';
              const tipoDano = response.danoFisico.tipo || 'No especificado';
              
              // Generar recomendación basada en la marca, modelo y gravedad
              const recomendacion = this.generarRecomendacion(
                this.marcaSeleccionada,
                this.modeloSeleccionado,
                gravedad
              );
              
              // Calcular presupuesto estimado
              const presupuesto = this.calcularPresupuesto(
                this.marcaSeleccionada,
                tipoDano,
                gravedad
              );
              
              this.dataService.setDanoInfo(
                tipoDano,
                gravedad,
                recomendacion,
                presupuesto
              );
            }
            // Navegar a la página de resultados
            this.router.navigate(['/results']);
          },
          error: (err) => {
            console.error('Error al enviar el archivo:', err);
            alert('Error al procesar el archivo. Por favor, intente nuevamente.');
          },
        });
      } catch (error) {
        console.error('Error en el proceso:', error);
        alert('Ocurrió un error al procesar su solicitud. Por favor, intente nuevamente.');
      }
    } else {
      alert('Por favor, complete todos los campos del formulario');
    }
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
}