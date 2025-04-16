import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDto } from '../models/category.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class CategoriesService {
  private apiUrl = environment.apiUrl + '/categories';
  
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage!');
    }
  
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }
}
