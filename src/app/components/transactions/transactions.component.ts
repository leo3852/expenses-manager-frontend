import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { CommonModule, CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransactionDto } from '../../models/transaction.dto';
import { CategoriesService } from '../../services/categories.service';
import { CategoryDto } from '../../models/category.dto';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transactions',
  imports:[CurrencyPipe, NgFor, NgIf, CommonModule, FormsModule, NgClass],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  originalTransactions: TransactionDto[] = []; 
  transactions: TransactionDto[] = [];
  categories: CategoryDto[] =[];
  months = [
    { name: 'January', value: 0 },
    { name: 'February', value: 1 },
    { name: 'March', value: 2 },
    { name: 'April', value: 3 },
    { name: 'May', value: 4 },
    { name: 'June', value: 5 },
    { name: 'July', value: 6 },
    { name: 'August', value: 7 },
    { name: 'September', value: 8 },
    { name: 'October', value: 9 },
    { name: 'November', value: 10 },
    { name: 'December', value: 11 }
  ];
  types = [
    { name: 'Income', value: 0 },
    { name: 'Expense', value: 1 }
  ];
  selectedMonth: string = '';
  selectedType: string = '';
  selectedCategory: string = '';
  userCurrencySymbol: string | null = '';

  constructor(private transactionService: TransactionService,
      private categoriesService: CategoriesService,
      private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.userCurrencySymbol = localStorage.getItem('userCurrencySymbol');
    // Set initial month to current
    this.selectedMonth = new Date().getMonth().toString();
    
    this.categoriesService.getCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // todo: Show a user-friendly message
      }
    });
    
    this.transactionService.getTransactions().subscribe((value: TransactionDto[])=>{
      this.originalTransactions = value;
      this.transactionService.updateTransactions(value);
      this.filterTransactions(); 
      this.sortTransactions();
    });

  }

  deleteTransaction(id?: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmDelete) return;
    if (id) { 
      this.transactionService.deleteTransaction(id).subscribe(() => {
        this.originalTransactions = this.originalTransactions.filter(t => t.id !== id);
        this.filterTransactions();
    
        this.snackBar.open('Transaction deleted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success'] // Optional custom style
        });
      });
    }
  }
  


  sortTransactions() {
    this.transactions.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;  // Default to 0 if undefined
      const dateB = b.date ? new Date(b.date).getTime() : 0;  // Default to 0 if undefined
      
      return dateB - dateA; // Most recent first
    });
  }

  filterTransactions() {
    this.transactions = this.originalTransactions.filter(t => {
      const matchesMonth = this.selectedMonth === '' || (
        t.date && new Date(t.date).getMonth() === parseInt(this.selectedMonth)
      );
  
      const matchesType = this.selectedType === '' || (
        t.type && t.type === this.selectedType
      );
      
      const matchesCategorie = this.selectedCategory === '' || (
        t.categoryId && t.categoryId === parseInt(this.selectedCategory)
      );

      return matchesMonth && matchesType && matchesCategorie;
    });
  }

  filterByMonth() {
    this.filterTransactions();
    this.sortTransactions();
  }
  
  
  filterByType() {
    this.filterTransactions();
    this.sortTransactions();
  }

  filterByCategory(){
    this.filterTransactions();
    this.sortTransactions();
  };
}

// (data) => {
//   this.transactions = data;
// }