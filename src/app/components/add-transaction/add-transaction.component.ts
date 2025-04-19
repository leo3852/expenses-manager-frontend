import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { TransactionDto } from '../../models/transaction.dto';
import { CategoryDto } from '../../models/category.dto';
import { CategoriesService } from '../../services/categories.service';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  imports: [
    ReactiveFormsModule ,
    NgFor,
    NgIf,
    CommonModule
  ],
  styleUrls: ['./add-transaction.component.scss'],
})
export class AddTransactionComponent implements OnInit {
  categories: CategoryDto[] = []; 
  userCurrencySymbol: string | null= '';
  userCurrencyName: string | null= '';
  transactionForm = new FormGroup({
    id: new FormControl<number | null>(null),
    userId: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, this.amountGreaterThanZero] }),
    amount: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    categoryId: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<'Income' | 'Expense'>('Income', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl<string>(this.formatDateToString(new Date()), { nonNullable: true, validators: [Validators.required] })

  });


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private transactionService: TransactionService
  ) {}
  
  amountGreaterThanZero(control: AbstractControl): ValidationErrors | null {
    return control.value > 0 ? null : { notPositive: true };
  }


  formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }
  
  
  get amountControl() {
    return this.transactionForm.get('amount');
  }
  
  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    this.userCurrencySymbol = localStorage.getItem('userCurrencySymbol');
    this.userCurrencyName = localStorage.getItem('userCurrencyName');
    if (userId) {
      this.transactionForm.patchValue({ userId: parseInt(userId, 10) });
    }
    this.categoriesService.getCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  // onSubmit(): void {
  //   if (this.transactionForm.valid) {
  //     const transaction: TransactionDto = this.transactionForm.value as TransactionDto;
  //     this.transactionService.addTransaction(transaction).subscribe({
  //       next: (addedTransaction: TransactionDto) => {
  //         this.transactionForm.reset();
  //       },
  //       error: (err) => {
  //         console.error('Error adding transaction', err);
  //       }
  //     });
  //   } else {
  //     console.error('Please fill in all required fields.');
  //   }
  // }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.getRawValue();

      const transaction: TransactionDto = {
        ...formValue,
        id: formValue.id ?? undefined,
        date: new Date(formValue.date as string) // Convert string to Date
      };
  
      this.transactionService.addTransaction(transaction).subscribe({
        next: (addedTransaction: TransactionDto) => {
          this.transactionForm.reset();
          // Re-set default date after reset (optional)
          this.transactionForm.patchValue({ date: this.formatDateToString(new Date()) });
        },
        error: (err) => {
          console.error('Error adding transaction', err);
        }
      });
    } else {
      console.error('Please fill in all required fields.');
    }
  }
  

  // Getter for accessing form controls in template (for error handling)
  get f() {
    return this.transactionForm.controls;
  }
}
