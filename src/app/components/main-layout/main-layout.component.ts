import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { SummaryThisMonthComponent } from "../summary-this-month/summary-this-month.component";
import { FooterComponent } from "../footer/footer.component";
import { LoginComponent } from "../login/login.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthLayoutComponent } from "../auth-layout/auth-layout.component";

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
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.checkAuthentication();
  }
  
  // Check if the user is authenticated
  checkAuthentication() {
    this.isAuthenticated = !!localStorage.getItem('token');
    this.userName = localStorage.getItem('userName');
  }

  // Handle login event from login component
  onLogin(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
    if (this.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  logout() {
    localStorage.removeItem('token'); 
    this.isAuthenticated = false;
    this.router.navigate(['/login']); // Redirect to the login page
  }
}
