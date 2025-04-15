import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterDto } from '../../models/register.dto';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDto } from '../../models/user.dto';
import { LoginDto } from '../../models/login.dto';

@Component({
  selector: 'app-register',
  imports: [NgIf, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: ''
  };

  registrationFailed = false;
  passwordError = '';

  @Output() changeToLogin = new EventEmitter<void>();
  
  constructor(private snackBar: MatSnackBar, private authService: AuthService, private router: Router) {}

  validatePassword(): boolean {
    const password = this.registerData.password;
    const confirm = this.registerData.confirmPassword;
    const currencySelected = !!this.registerData.currency;
    const email = this.registerData.email;
    const name = this.registerData.name;
  
    const validName = name.length > 3;
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const matches = password === confirm;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
    if (!currencySelected) {
      this.passwordError = 'Please select a currency.';
    }else if (!validName) {
      this.passwordError = 'Please enter a valid name.';
    }else if (!validEmail) {
      this.passwordError = 'Please enter a valid email address.';
    }else if (!minLength) {
      this.passwordError = 'Password must be at least 6 characters long.';
    } else if (!hasUpper) {
      this.passwordError = 'Password must include an uppercase letter.';
    } else if (!hasLower) {
      this.passwordError = 'Password must include a lowercase letter.';
    } else if (!hasNumber) {
      this.passwordError = 'Password must include a number.';
    } else if (!matches) {
      this.passwordError = 'Passwords do not match.';
    } else {
      this.passwordError = '';
    }
  
    return currencySelected && validEmail && minLength && hasUpper && hasLower && hasNumber && matches;
  }
  

  register() {
    if (this.validatePassword()) {
      const dto: RegisterDto = {
        name: this.registerData.name,
        email: this.registerData.email,
        password: this.registerData.password,
        currencyId: Number(this.registerData.currency),
      };
      this.authService.register(dto).subscribe({
        next: (response: UserDto) => {
          this.snackBar.open('Registration Successful, Welcome!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          let email = this.registerData.email;
          let password = this.registerData.password;
          let credentials = {email, password}
          
          this.authService.login(credentials).subscribe({
            next: (value: LoginDto) => {
              if (value.token) {
                const userId = value?.userDto?.id;
                const userName = value?.userDto?.name;
                // On successful login, emit the login event
                localStorage.setItem('token', value.token);
                if (typeof userId === 'number' && !isNaN(userId)) {
                  localStorage.setItem('userId', userId.toString());
                }
                if (userName && typeof userName === 'string') {
                  localStorage.setItem('userName', userName );
                }
                this.router.navigate(['/dashboard']);
              } else {  
                alert('Invalid credentials');
              }
              
            },
            error: err =>{ 

              //console.error('Observable emitted an error: ' + err);
            }
          })
        },
        error: (error: HttpErrorResponse) => {
          //console.error('Registration failed:', error);
          this.snackBar.open(error.error, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
          this.registrationFailed = true;
  
          if (error.status === 400 && typeof error.error === 'string') {
            this.passwordError = error.error; // e.g., "Email already in use"
          } else {
            this.passwordError = 'Registration failed. Please try again.';
          }
        },
      });
    } else {
      this.registrationFailed = true;
    }
  }
  
  
}
