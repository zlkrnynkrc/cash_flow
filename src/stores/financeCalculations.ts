import type { CashFlowItem, ExtraFee, MonthlySummary } from '../types/finance';

/**
 * Bir kalemin ek ücretler toplamını hesaplar.
 */
export function calculateExtraFeesAmount(baseAmount: number, fees: ExtraFee[]): number {
  if (!fees || fees.length === 0) return 0;
  return fees.reduce((sum, fee) => {
    if (fee.type === 'percentage') {
      return sum + (baseAmount * (fee.value / 100));
    }
    return sum + (Number(fee.value) || 0);
  }, 0);
}

/**
 * Gecikilen gün sayısını hesaplar.
 * Son ödeme tarihi geçmemişse 0 döner.
 */
export function calculateOverdueDays(dueDateStr?: string, targetDateStr?: string): number {
  if (!dueDateStr) return 0;

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const target = targetDateStr ? new Date(targetDateStr) : new Date();
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - due.getTime();
  if (diffTime <= 0) return 0;

  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Günlük bazlı gecikme faizi hesaplaması:
 * Aylık faiz oranı 30 güne bölünerek günlük faiz oranı bulunur.
 * Faiz = (Ana Para + Cezalar) * (Aylık Faiz Oranı / 100 / 30) * Gecikilen Gün Sayısı
 */
export function calculateDailyAccruedInterest(
  item: CashFlowItem,
  referenceDateStr?: string
): { overdueDays: number; accruedInterest: number } {
  // Ödenmişse veya faiz oranı yoksa/0 ise faiz işletilmez (veya ödeme tarihindeki gün baz alınabilir)
  if (item.isPaid) {
    return { overdueDays: 0, accruedInterest: 0 };
  }

  const interestRate = item.interestRate || 0;
  if (interestRate <= 0 || !item.dueDate) {
    return { overdueDays: 0, accruedInterest: 0 };
  }

  const overdueDays = calculateOverdueDays(item.dueDate, referenceDateStr);
  if (overdueDays <= 0) {
    return { overdueDays: 0, accruedInterest: 0 };
  }

  const fees = calculateExtraFeesAmount(item.amount, item.extraFees);
  const basePlusFees = item.amount + fees;
  
  // Günlük faiz oranı = Aylık faiz / 30
  const dailyRate = (interestRate / 100) / 30;
  const accruedInterest = basePlusFees * dailyRate * overdueDays;

  return {
    overdueDays,
    accruedInterest: Math.round(accruedInterest * 100) / 100
  };
}

/**
 * Kalemin toplam tutarını hesaplar (Ana para + Ek ücretler + Günlük işlemiş faiz).
 */
export function calculateItemTotal(item: CashFlowItem, referenceDateStr?: string): number {
  const extraTotal = calculateExtraFeesAmount(item.amount, item.extraFees);
  const { accruedInterest } = calculateDailyAccruedInterest(item, referenceDateStr);
  return item.amount + extraTotal + accruedInterest;
}

/**
 * Devir tutarı hesaplama:
 * (Önceki Tutar + Cezalar + Günlük İşlemiş Faiz)
 */
export function calculateRolloverDebt(
  item: CashFlowItem,
  referenceDateStr?: string
): number {
  return calculateItemTotal(item, referenceDateStr);
}

/**
 * Aylık Bilanço ve Raporlama Hesaplaması
 */
export function calculateMonthlySummary(items: CashFlowItem[], referenceDateStr?: string): MonthlySummary {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalDebt = 0;
  let totalInterestAndFees = 0;
  let unpaidDebtCount = 0;
  let unpaidExpenseCount = 0;

  for (const item of items) {
    const fees = calculateExtraFeesAmount(item.amount, item.extraFees);
    const { accruedInterest } = calculateDailyAccruedInterest(item, referenceDateStr);
    const itemTotalInterestAndFees = fees + accruedInterest;
    totalInterestAndFees += itemTotalInterestAndFees;

    const itemTotal = item.amount + itemTotalInterestAndFees;

    if (item.type === 'income') {
      totalIncome += itemTotal;
    } else if (item.type === 'expense') {
      totalExpense += itemTotal;
      if (!item.isPaid) {
        unpaidExpenseCount++;
      }
    } else if (item.type === 'debt') {
      totalDebt += itemTotal;
      if (!item.isPaid) {
        unpaidDebtCount++;
      }
    }
  }

  // Kalan Bütçe = Toplam Gelir - (Toplam Gider + Borçlar)
  const remainingBudget = totalIncome - (totalExpense + totalDebt);

  return {
    totalIncome,
    totalExpense,
    totalDebt,
    remainingBudget,
    totalInterestAndFees,
    unpaidDebtCount,
    unpaidExpenseCount,
    netCashFlow: remainingBudget
  };
}

/**
 * Bir sonraki ay dizesini döndürür (YYYY-MM).
 */
export function getNextMonth(currentMonthStr: string): string {
  const [yearStr, monthStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month++;
  if (month > 12) {
    month = 1;
    year++;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Bir önceki ay dizesini döndürür (YYYY-MM).
 */
export function getPrevMonth(currentMonthStr: string): string {
  const [yearStr, monthStr] = currentMonthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month--;
  if (month < 1) {
    month = 12;
    year--;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Bugünün ay dizesini döndürür (YYYY-MM).
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Bugünün YYYY-MM-DD dizesini döndürür.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
