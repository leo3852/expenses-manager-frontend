import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SummaryThisMonthComponent } from "../summary-this-month/summary-this-month.component";
import { FooterComponent } from "../footer/footer.component";
import { LoginComponent } from "../login/login.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthLayoutComponent } from "../auth-layout/auth-layout.component";
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterModule,
    SummaryThisMonthComponent,
    NgIf,
    FooterComponent,
    AuthLayoutComponent
],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})

export class MainLayoutComponent implements OnInit {
  isAuthenticated = false;
  title = 'FINANCES MANAGER'; 
  userName: string | null | undefined;
  constructor(private transactionService: TransactionService, private router: Router) {}
  
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Not authenticated, redirect to login
      this.router.navigate(['/auth/login']);
    } else {
      // Authenticated, redirect to dashboard only if already not there
      if (this.router.url === '/' || this.router.url === '/auth/login') {
        this.router.navigate(['/dashboard']);
      }
      this.isAuthenticated = true;
      this.userName = localStorage.getItem('userName');
    }
  }

  // Handle login event from login component
  onLogin(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  logout() {
    this.transactionService.clearTransactions(); // clear transactions
    localStorage.clear();
    this.isAuthenticated = false;
    this.router.navigate(['/login']); // Redirect to the login page
  }
}
