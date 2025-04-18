// login.component.ts

import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Your AuthService to handle login API calls
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginDto } from '../../models/login.dto';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  loginValidOrFirst = true;

  @Output() changeToRegister = new EventEmitter<void>();

  constructor(private transactionService: TransactionService, private authService: AuthService, private router: Router) {}

  login() {
    let email = this.loginData.email;
    let password = this.loginData.password;

    if (email && password) {
      this.authService.login({ email, password }).subscribe({
        next: (value: LoginDto) => {
          if (value.token) {
            const userId = value?.userDto?.id;
            const userName = value?.userDto?.name;
            const userCurrency = value?.userDto?.currency;
            // On successful login, emit the login event
            localStorage.setItem('token', value.token);
            if (typeof userId === 'number' && !isNaN(userId)) {
              localStorage.setItem('userId', userId.toString());
            }
            if (userName && typeof userName === 'string') {
              localStorage.setItem('userName', userName );
            }
            if (userCurrency && typeof userCurrency === 'object') {
              localStorage.setItem('userCurrencySymbol', userCurrency.symbol );
              localStorage.setItem('userCurrencyName', userCurrency.name );
            }
            this.loginValidOrFirst = true;
            //this.onLogin.emit(this.loginValidOrFirst); // Pass true when login is successful
            this.transactionService.clearTransactions(); // clear transactions
            this.router.navigate(['/dashboard']);
          } else {  
            alert('Invalid credentials');
            this.loginValidOrFirst = false;
          }
          
        },
        error: err =>{ 
          this.loginValidOrFirst = false;
          //console.error('Observable emitted an error: ' + err);
        }
      })
    }
    else {  
      this.loginValidOrFirst = false;
      // alert('Invalid credentials');
    }
  }
}
