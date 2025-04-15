export interface TransactionDto {
    id?: number;
    userId: number;
    amount: number;
    categoryId: number;
    type: 'Income' | 'Expense';
    date: Date ;
    description?: string;
  }