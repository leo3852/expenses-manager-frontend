import { Component } from '@angular/core';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { CategoryDto } from '../../models/category.dto';
import { TransactionDto } from '../../models/transaction.dto';
import { CategoriesService } from '../../services/categories.service';
import { TransactionService } from '../../services/transaction.service';
import { CommonModule, NgFor } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

Chart.register(...registerables);

@Component({
  selector: 'app-analysis',
  imports: [NgFor, CommonModule],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss'
})
export class AnalysisComponent {
  public config: any = {}
  categories: CategoryDto[] = []; // e.g., Rent, Food, etc.
  summaryAI: string = '';

  transactions: TransactionDto[] = [];
  chart: Chart | undefined;
  timeBasedChart: Chart | undefined;
  timeBasedChartConfig: any = {};
  expenseTransactions: TransactionDto[] = [];
  biggestTransactions: TransactionDto[] = [];
  numberOfTransactions: number = 0;
  backgroundColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#6B7280'];
  userCurrencySymbol: string | null = " ";
  constructor(
    private transactionService: TransactionService,
    private categoriesService: CategoriesService,
    private http: HttpClient) {}  

  ngOnInit() {
    this.userCurrencySymbol = localStorage.getItem('userCurrencySymbol');
    this.categoriesService.getCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
        this.transactionService.getTransactions().subscribe((value: TransactionDto[]) => {
          const currentMonthTransactions = this.getCurrentMonthTransactions(value);
  
          this.transactions = currentMonthTransactions;
          this.transactionService.updateTransactions(this.transactions);  
          
          this.numberOfTransactions = this.transactions.length;
          this.updateChart(); // For the expenses chart
          this.getBiggestTransactions(); // For the biggest transactions
          this.updateTimeBasedChart(); // For the time-based income vs expenses chart
          //this.generateSummary(); // For the AI conclusion
        });
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  generateSummary() {
    const expenseTotals = this.getExpensesByCategory();

    let expenseLines = '';
    for (const catId in expenseTotals) {
      const name = this.categories[(+catId - 1)].name || `Category ${catId}`;
      expenseLines += `- ${name}: $${expenseTotals[catId].toFixed(2)}\n`;
    }

    const prompt = `Based on the following expense breakdown, write a paragraph with a financial insight and recommendation:\n${expenseLines} With a maximum of 150 words.`;
    const startPhrase = "150 words.";
      
    const headers = new HttpHeaders({
      Authorization: 'Bearer ',
      'Content-Type': 'application/json',
    });
    
    const body = {
      inputs: prompt,
    };
    
    this.http
    .post<any>(
      'https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased',
      body,
      { headers }
    )
    .subscribe({
      next: (res) => {
        this.summaryAI = res?.[0]?.generated_text || 'No summary generated.';
        const startIndex = this.summaryAI.indexOf(startPhrase);
        if (startIndex !== -1) {
          this.summaryAI = this.summaryAI.substring(startIndex+ startPhrase.length).trim();
        }
        
        },
        error: (err) => {
          console.error(err);
          this.summaryAI = '';
        },
      });
  }

  getExpensesByCategory(): { [categoryId: number]: number } {
    const expenses = this.transactions.filter((t) => t.type === 'Expense');
    const totals: { [categoryId: number]: number } = {};
    for (const tx of expenses) {
      totals[tx.categoryId] = (totals[tx.categoryId] || 0) + tx.amount;
    }    
    return totals;
  }


  getCurrentMonthTransactions(transactions: TransactionDto[]): TransactionDto[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
  
    return transactions.filter(t => {
      const tDate = new Date(t.date ?? 0);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
  }
  
  
  updateChart() {
    const expenseTransactions = this.transactions.filter(t => t.type === 'Expense');
    const categoryTotals: { [key: number]: number } = {};
  
    expenseTransactions.forEach(transaction => {
      categoryTotals[transaction.categoryId] = (categoryTotals[transaction.categoryId] || 0) + transaction.amount;
    });
  
    const labels = Object.keys(categoryTotals).map(id => {
      const category = this.categories.find(cat => cat.id === +id);
      return category ? category.name : 'Unknown';
    });
  
    const data = Object.values(categoryTotals);
    this.config = {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.backgroundColors.slice(0, data.length),
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels:{
              color: '#ffffff',
              font: {
                size: 16 
              }
            },
            position: 'bottom'
          },
          tooltip: {
            titleFont: {
              size: 16 
            },
            bodyFont: {
              size: 16 
            },      
            callbacks: {
              label: (context: TooltipItem<'pie'>) => {
                const value = context.raw as number;
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${this.userCurrencySymbol?.toString()} ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
    this.config.data.labels = labels;
    this.config.data.datasets[0].data = data;
    this.config.data.datasets[0].backgroundColor = this.backgroundColors.slice(0, data.length);
    
    if (this.chart) {
      this.chart.destroy();
    }
  
    this.chart = new Chart('MyChart', this.config);
    this.config.type = 'pie';
  }
  
  getBiggestTransactions() {
    this.biggestTransactions = [...this.transactions]
      .filter(t => t.type === 'Expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  updateTimeBasedChart() {
    // Filter transactions for the current month
    const currentMonthTransactions = this.getCurrentMonthTransactions(this.transactions);
  
    // Group the transactions by day for both income and expenses
    const incomeByDay: { [key: string]: number } = {};
    const expenseByDay: { [key: string]: number } = {};
  
    // Helper function to get all dates of the current month in local time
    const getAllDatesForCurrentMonth = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const numDays = new Date(currentYear, currentMonth + 1, 0).getDate(); // Get number of days in the month
      const dates: string[] = [];
      for (let i = 1; i <= numDays; i++) {
        // Use local time (no timezone offset)
        const date = new Date(currentYear, currentMonth, i);
        dates.push(date.toLocaleDateString()); // Use the local date format YYYY-MM-DD
      }
      return dates;
    };
  
    const allDatesForMonth = getAllDatesForCurrentMonth(); // Get all dates for the month
  
    currentMonthTransactions.forEach(transaction => {
      const date = new Date(transaction.date ?? 0);
      // Ensure the date is in local timezone format, trimming to the date only (no time)
      const dateString = date.toLocaleDateString(); // Format to YYYY-MM-DD
  
      if (transaction.type === 'Income') {
        incomeByDay[dateString] = (incomeByDay[dateString] || 0) + transaction.amount;
      } else if (transaction.type === 'Expense') {
        expenseByDay[dateString] = (expenseByDay[dateString] || 0) + transaction.amount;
      }
    });
  
    // Prepare chart labels (all dates in the current month)
    const labels = allDatesForMonth;
  
    // Prepare the data for the chart
    const incomeData: number[] = labels.map(date => incomeByDay[date] || 0); // Default to 0 if no data for that day
    const expenseData: number[] = labels.map(date => expenseByDay[date] || 0); // Default to 0 if no data for that day
  
    // Calculate cumulative data
    let cumulativeIncome = 0;
    const cumulativeIncomeData: number[] = incomeData.map(amount => cumulativeIncome += amount);
  
    let cumulativeExpense = 0;
    const cumulativeExpenseData: number[] = expenseData.map(amount => cumulativeExpense += amount);
  
    // Create the chart data
    const data = {
      labels: labels, // Dates
      datasets: [
        {
          label: 'Cumulative Income',
          data: cumulativeIncomeData,
          borderColor: '#10B981', // Green color for income
          backgroundColor: 'rgba(16, 185, 129, 0.2)', // Light green background for income
          fill: false, // No fill for the cumulative line
          tension: 0.4, // Smooth curve
          borderWidth: 2 // Thicker line for cumulative income
        },
        {
          label: 'Cumulative Expenses',
          data: cumulativeExpenseData,
          borderColor: '#EF4444', // Red color for expenses
          backgroundColor: 'rgba(239, 68, 68, 0.2)', // Light red background for expenses
          fill: false, // No fill for the cumulative line
          tension: 0.4, // Smooth curve
          borderWidth: 2, // Thicker line for cumulative expenses,
          Color: '#ffffff'
        }
      ]
    };
  
    // Chart configuration
    this.timeBasedChartConfig = {
      type: 'line', // Line chart
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            labels: labels,
            title: {
              display: true,
              text: 'Date',
              color: '#ffffff'
            },
            ticks: {
              color: '#ffffff' // Labels color (Y axis)
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (' + this.userCurrencySymbol?.toString() + ')',
              color: '#ffffff'
            },
            ticks: {
              color: '#ffffff' // Labels color (Y axis)
            }
          }
        },
        plugins: {
          legend: {
            labels:{
              color: '#ffffff',
              font: {
                size: 16 
              }
            },
            position: 'top', // Position the legend at the top
            color: '#ffffff'
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'line'>) => {
                const value = context.raw as number;
                return `${this.userCurrencySymbol?.toString()} ${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    };
  
    // If the chart exists, destroy it and create a new one
    if (this.timeBasedChart) {
      this.timeBasedChart.destroy();
    }
  
    this.timeBasedChart = new Chart('timeBasedChart', this.timeBasedChartConfig);
  }
  
  
  
  
}

