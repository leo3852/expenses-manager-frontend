export interface TransactionDto {
    id?: number | null;
    userId: number;
    amount: number;
    categoryId: number;
    type: 'Income' | 'Expense';
    date: Date ;
    description?: string;
  }