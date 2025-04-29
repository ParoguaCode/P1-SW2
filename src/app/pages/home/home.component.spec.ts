import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent {
  isModalOpen: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dataService: DataService
  ) {}

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<any>('http://tu-backend.com/api/upload', formData).subscribe({
        next: (response) => {
          this.dataService.setImageUrl(response.imageUrl);
          this.dataService.setResults(
            response.ubicacion,
            response.gravedad,
            response.recomendaciones
          );
          this.router.navigate(['/results']);
        },
        error: (err) => {
          console.error('Error al enviar el formulario:', err);
        },
      });
    } else {
      alert('Por favor selecciona un archivo.');
    }
  }
}
