import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { TransactionDto } from '../models/transaction.dto';

@Injectable({
  providedIn: 'root',
})

export class TransactionService {
  private apiUrl = 'http://localhost:5050/api/transactions';  // API URL
  private transactionsSubject = new BehaviorSubject<TransactionDto[]>([]);
  transactions$ = this.transactionsSubject.asObservable();
  
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

  updateTransactions(transactions: TransactionDto[]) {
    this.transactionsSubject.next(transactions);
  }
  
  getCurrentTransactions(): TransactionDto[] {
    return this.transactionsSubject.getValue();
  }

  getTransactions(): Observable<TransactionDto[]> {
    if (this.getCurrentTransactions().length === 0) {
      return this.http.get<TransactionDto[]>(this.apiUrl, {
        headers: this.getAuthHeaders()
      }).pipe(
        tap(data => this.updateTransactions(data)) // store the fetched data
      );
    } else {
      return of(this.getCurrentTransactions()); // wrap array in observable
    }
  }
  
  addTransaction(transaction: TransactionDto): Observable<TransactionDto> {
    const payload = { ...transaction }; // making a copy
    delete payload.id; 
  
    return this.http.post<TransactionDto>(this.apiUrl, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((newTransaction) => {
        // Update the local transaction list with the new transaction
        const updatedTransactions = [...this.transactionsSubject.getValue(), newTransaction];
        this.updateTransactions(updatedTransactions); // Update the BehaviorSubject with the new list
      })
    );
  }

  // // Update an existing transaction
  // updateTransaction(id: number, transaction: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, transaction);
  // }

  // Delete a transaction
  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const updatedTransactions = this.transactionsSubject.getValue().filter(t => t.id !== id);
        this.updateTransactions(updatedTransactions); // Update the BehaviorSubject
      })
    );
  }

}
