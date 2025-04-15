import { RouterModule, Routes } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { LoginComponent } from './components/login/login.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { RegisterComponent } from './components/register/register.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {
      path: '',
      component: MainLayoutComponent,
      children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: TransactionListComponent },
        { path: 'transactions', component: TransactionsComponent },
        { path: 'analysis', component: AnalysisComponent },
        { path: 'add', component: AddTransactionComponent },
      ]
    },
    {
      path: 'auth/:mode',
      component: AuthLayoutComponent,
    },
    { path: '**', redirectTo: 'auth/login' }
  ];
  



// const routes: Routes = [
//     {path:'dashboard', component: TransactionListComponent},
//     {path:'transactions', component: TransactionsComponent},
//     {path:'add', component: AddTransactionComponent},
//     {path:'login', component: LoginComponent},
//     {path:'register', component: RegisterComponent},
//     {path:'analysis', component: AnalysisComponent},
// ];



