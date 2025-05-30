import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { NgIf } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-auth-layout',
  imports: [NgIf, FooterComponent, RegisterComponent, LoginComponent],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {

  isLogin = true;
  isRegister = false;
  showButtns = true;
  isCheckingLogin = true;
  constructor(private router: Router, private route: ActivatedRoute) {}
  
  
  
  ngOnInit(): void {

    this.isCheckingLogin = true;
    // Check for token or userId in localStorage
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000); // Show spinner for a second
    } else {
      this.route.params.subscribe(params => {
        const mode = params['mode'];
        this.isLogin = (mode === 'login');
        this.isRegister = (mode === 'register');
        this.isCheckingLogin = false;
      });
    }
  }
  
  onSwitchToLogin() {
    this.isLogin = true;
    this.isRegister= false;
  }

  onSwitchToRegister() {
    this.isLogin = false;
    this.isRegister = true;
  }

  // Show the register form when the Register button is clicked
  showRegisterForm() {
    this.isLogin = false;
    this.isRegister = true;
    this.showButtns = false;
  }

  showLoginForm() {
    this.isLogin = true;
    this.isRegister = false;
    this.showButtns = false;
  }
  // onLogin(isAuthenticated: boolean) {
  //   if (isAuthenticated) {
  //     this.router.navigate(['/dashboard']);
  //   }
  // }
}
