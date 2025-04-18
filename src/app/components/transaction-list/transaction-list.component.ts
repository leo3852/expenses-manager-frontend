import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { CommonModule, CurrencyPipe, NgClass, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransactionDto } from '../../models/transaction.dto';
import { CategoriesService } from '../../services/categories.service';
import { CategoryDto } from '../../models/category.dto';

@Component({
  selector: 'app-transaction-list',
  imports:[CurrencyPipe, NgFor, CommonModule, NgClass],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
})
export class TransactionListComponent implements OnInit {
  transactions: TransactionDto[] = [];
  categories: CategoryDto[] =[];
  userCurrencySymbol: string | null = '';

  constructor(private transactionService: TransactionService,
      private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.transactionService.clearTransactions();
    this.userCurrencySymbol = localStorage.getItem('userCurrencySymbol');
    this.categoriesService.getCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // Optional: Show a user-friendly message
      }
    });
    this.transactionService.getTransactions().subscribe((value: TransactionDto[])=>{
      this.transactionService.updateTransactions(value);
      this.transactions = [...value].reverse();  // Reverse for display only

      // this.sortTransactions();
      
    });   

  }


  // sortTransactions() {
  //   this.transactions.sort((a, b) => {
  //     const dateA = a.id ? new Date(a.date).getTime() : 0;  // Default to 0 if undefined
  //     const dateB = b.date ? new Date(b.date).getTime() : 0;  // Default to 0 if undefined
      
  //     return dateB - dateA; // Most recent first
  //   });
  // }

  // sortTransactions() {
  //   this.transactions.sort((a, b) => {
  //     return b.id - a.id;  // Most recent first based on the ID
  //   });
  // }

}

// (data) => {
//   this.transactions = data;
// }