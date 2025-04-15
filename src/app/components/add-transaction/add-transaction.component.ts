import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl } from '@angular/forms';
import { TransactionDto } from '../../models/transaction.dto';
import { CategoryDto } from '../../models/category.dto';
import { CategoriesService } from '../../services/categories.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  imports: [
    ReactiveFormsModule ,
    NgFor,
    NgIf
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
    date: new FormControl<Date>(new Date(), { nonNullable: true, validators: [Validators.required] })
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

  get amountControl() {
    return this.transactionForm.get('amount');
  }
  
  ngOnInit(): void {
    // Set userId dynamically from localStorage (if available)
    const userId = localStorage.getItem('userId');
    this.userCurrencySymbol = localStorage.getItem('userCurrencySymbol');
    this.userCurrencyName = localStorage.getItem('userCurrencyName');
    if (userId) {
      this.transactionForm.patchValue({ userId: parseInt(userId, 10) });
    }
    // Fetch categories from your CategoriesService
    this.categoriesService.getCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        // Optional: Show a user-friendly message
      }
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const transaction: TransactionDto = this.transactionForm.value as TransactionDto;
      this.transactionService.addTransaction(transaction).subscribe({
        next: (addedTransaction: TransactionDto) => {
          this.transactionForm.reset();
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
