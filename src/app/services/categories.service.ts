import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { CategoryDto } from '../models/category.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class CategoriesService {
  private apiUrl = environment.apiUrl + '/categories';
  private categoriesSubject = new BehaviorSubject<CategoryDto[]>([]);
  categories$ = this.categoriesSubject.asObservable();
  
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

  updateCategories(categories: CategoryDto[]) {
    this.categoriesSubject.next(categories);
  }

  getCurrentCategories(): CategoryDto[] {
    return this.categoriesSubject.getValue();
  }

  getCategories(): Observable<CategoryDto[]> {
    if (this.getCurrentCategories().length === 0) {
      return this.http.get<CategoryDto[]>(this.apiUrl, {
        headers: this.getAuthHeaders()
      }).pipe(
        tap(data => this.updateCategories(data)) // store the fetched data
      );
    } else {
      return of(this.getCurrentCategories()); // wrap array in observable
    }
  }
}
