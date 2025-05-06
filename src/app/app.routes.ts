import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ResultsComponent } from './pages/results/results.component';
import { HistoryComponent } from './pages/history/history.component';
import { DetailsComponent } from './pages/details/details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Ruta principal
  { path: 'results', component: ResultsComponent }, // Ruta para resultados
  { path: 'history', component: HistoryComponent }, // Ruta para historial
  { path: 'details', component: DetailsComponent }, // Ruta para detalles
  { path: '**', redirectTo: '' }, // Ruta comodín al final
];
