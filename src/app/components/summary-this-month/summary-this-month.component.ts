import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TransactionDto } from '../../models/transaction.dto';
import { TransactionService } from '../../services/transaction.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-summary-this-month',
  imports: [
    RouterModule,
  ],
  templateUrl: './summary-this-month.component.html',
  styleUrls: ['./summary-this-month.component.scss']
})
export class SummaryThisMonthComponent implements OnInit, OnDestroy {
  spendingTotal: number = 0;
  incomeTotal: number = 0;
  transactions: TransactionDto[] = [];
  private transactionsSubscription?: Subscription;
  currentMonthLabel?: string;
  userCurrencySymbol: string | null="";
  userCurrencyName: string | null="";

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.setCurrentMonthLabel();
    this.userCurrencySymbol = localStorage.getItem('userCurrencySymbol');
    this.userCurrencyName = localStorage.getItem('userCurrencyName');
    // Subscribe to the transactions observable from the service
    this.transactionsSubscription = this.transactionService.transactions$.subscribe((transactions) => {
      this.transactions = transactions;
      this.calculateTotals();
    });

    // Initial load of transactions
    this.transactionService.getTransactions().subscribe();
  }

  setCurrentMonthLabel(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    this.currentMonthLabel = now.toLocaleDateString('en-US', options); // Example: "April 2025"
  }
  
  calculateTotals(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = this.transactions.filter(transaction => {
      if (!transaction.date) return false; 
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    this.spendingTotal = currentMonthTransactions
      .filter(transaction => transaction.type === 'Expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    this.incomeTotal = currentMonthTransactions
      .filter(transaction => transaction.type === 'Income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  

  ngOnDestroy(): void {
    // Unsubscribe when the component is destroyed to avoid memory leaks
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }
}
