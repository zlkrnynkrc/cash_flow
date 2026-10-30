export type TransactionType = 'income' | 'expense' | 'debt';

export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer';

export interface ExtraFee {
  id: string;
  name: string; // e.g. Gecikme Zammı, Açma-Kapama Bedeli, Paket Aşımı
  type: 'fixed' | 'percentage';
  value: number; // Sabit ₺ veya Yüzde %
}

export interface CashFlowItem {
  id: string;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  month: string; // YYYY-MM
  dueDate?: string; // YYYY-MM-DD
  interestRate?: number; // Aylık Faiz Oranı % (Örn: 4.75 veya 3.5)
  extraFees: ExtraFee[];
  
  // Ödeme Durumu ve Yöntemi
  isPaid: boolean;
  paymentMethod?: PaymentMethod; // 'cash' | 'credit_card' | 'bank_transfer'
  creditCardName?: string; // Örn: 'Garanti Bonus', 'Yapı Kredi World'
  paidDate?: string; // YYYY-MM-DD

  notes?: string;
  isRollover?: boolean; // Bir önceki aydan devir mi?
  originalAmount?: number;
  rolloverSourceMonth?: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  totalDebt: number;
  remainingBudget: number;
  totalInterestAndFees: number;
  unpaidDebtCount: number;
  unpaidExpenseCount: number;
  netCashFlow: number;
}
