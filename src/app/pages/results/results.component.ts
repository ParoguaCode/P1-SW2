import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.sass'],
})
export class ResultsComponent implements OnInit {
  imageUrl: string = '';
  evaluacion: {fecha: string, tipo: string, id: number} = {fecha: '', tipo: '', id: 0};
  vehiculo: {marca: string, modelo: string, anio: number} = {marca: '', modelo: '', anio: 0};
  dano: {tipo: string, gravedad: string, recomendacion: string, presupuesto: number} = {
    tipo: '', 
    gravedad: '', 
    recomendacion: '', 
    presupuesto: 0
  };
  aiQueryResponse: {archivo: string, nivel: string, detecciones: number} = {
    archivo: '',
    nivel: '',
    detecciones: 0
  };

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

 ngOnInit(): void {
    this.imageUrl = this.dataService.getImageUrl();
    this.evaluacion = this.dataService.getEvaluacionInfo();
    this.vehiculo = this.dataService.getVehiculoInfo();
    this.dano = this.dataService.getDanoInfo();
    this.aiQueryResponse = this.dataService.getAiQueryResponse();
    
    // Verificar si hay datos para mostrar
    if (!this.imageUrl || !this.dano.gravedad) {
      alert('No hay resultados para mostrar. Volviendo a la página principal.');
      this.router.navigate(['/']);
    }
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }
  guardarPDF(): void {
    // Mostrar mensaje de carga
    alert('Generando PDF, por favor espere...');

    // Seleccionar el elemento que contiene los resultados
    const element = document.querySelector('.result-card') as HTMLElement;
    
    if (!element) {
      alert('Error al generar el PDF: No se encontró el contenido.');
      return;
    }

    // Usar html2canvas para convertir el elemento HTML a una imagen
    html2canvas(element, {
      scale: 2, // Mayor escala para mejor calidad
      useCORS: true, // Permitir imágenes de otros dominios
      logging: false, // Desactivar logs
      allowTaint: true // Permitir elementos tainted
    }).then(canvas => {
      // Crear un nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Obtener dimensiones del canvas y ajustar al tamaño del PDF
      const imgWidth = 210; // Ancho de página A4 en mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Añadir título al PDF
      pdf.setFontSize(18);
      pdf.text('Diagnóstico de Daño Vehicular', 105, 15, { align: 'center' });
      
      // Añadir fecha de generación
      pdf.setFontSize(10);
      pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      
      // Añadir la imagen del canvas al PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);
      
      // Añadir pie de página
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text('AutoDiagnóstico - Informe generado automáticamente', 105, 290, { align: 'center' });
      }
      
      // Guardar el PDF
      pdf.save(`Diagnostico_${this.vehiculo.marca}_${this.vehiculo.modelo}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      alert('PDF generado correctamente.');
    }).catch(error => {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    });
  }
  historial(): void {
    this.router.navigate(['/history']);
  }
}
