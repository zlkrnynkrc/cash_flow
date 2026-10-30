import { writable } from 'svelte/store';
import type { CashFlowItem, PaymentMethod } from '../types/finance';
import {
  getCurrentMonth,
  getNextMonth,
  calculateItemTotal,
  getTodayDateString
} from './financeCalculations';

const STORAGE_KEY = 'cash_flow_items_v2';

function getInitialItems(): CashFlowItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load items from localStorage', e);
  }

  const currentMonth = getCurrentMonth();
  return [
    {
      id: 'demo-1',
      title: 'Aylık Net Maaş',
      category: 'Maaş / Ücret',
      type: 'income',
      amount: 45000,
      month: currentMonth,
      extraFees: [],
      isPaid: true,
      paidDate: `${currentMonth}-01`
    },
    {
      id: 'demo-2',
      title: 'Ev Kirası',
      category: 'Ev / İş Yeri Kirası',
      type: 'expense',
      amount: 17500,
      month: currentMonth,
      dueDate: `${currentMonth}-15`,
      extraFees: [],
      isPaid: false
    },
    {
      id: 'demo-3',
      title: 'Elektrik Faturası',
      category: 'Elektrik Faturası (CK/Aydem/Enerjisa vb.)',
      type: 'expense',
      amount: 850,
      month: currentMonth,
      dueDate: `${currentMonth}-10`,
      interestRate: 3.5,
      extraFees: [
        { id: 'fee-1', name: 'Gecikme Zammı', type: 'percentage', value: 3.5 }
      ],
      isPaid: false
    },
    {
      id: 'demo-4',
      title: 'Garanti BBVA Kredi Kartı',
      category: 'Kredi Kartı Ekstresi / Asgari Tutar',
      type: 'debt',
      amount: 12000,
      month: currentMonth,
      dueDate: `${currentMonth}-05`,
      interestRate: 4.75, // TCMB referans/akdi gecikme faizi
      extraFees: [
        { id: 'fee-2', name: 'Gecikme Ücreti', type: 'fixed', value: 150 }
      ],
      isPaid: false
    }
  ];
}

function createFinanceStore() {
  const { subscribe, set, update } = writable<CashFlowItem[]>(getInitialItems());

  const save = (items: CashFlowItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }
  };

  return {
    subscribe,
    addItem: (item: Omit<CashFlowItem, 'id'>) => {
      update(items => {
        const newItem: CashFlowItem = {
          ...item,
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
        };
        const updated = [newItem, ...items];
        save(updated);
        return updated;
      });
    },
    updateItem: (id: string, updatedFields: Partial<CashFlowItem>) => {
      update(items => {
        const updated = items.map(item =>
          item.id === id ? { ...item, ...updatedFields } : item
        );
        save(updated);
        return updated;
      });
    },
    removeItem: (id: string) => {
      update(items => {
        const updated = items.filter(item => item.id !== id);
        save(updated);
        return updated;
      });
    },
    /**
     * Ödeme Durumu ve Ödeme Yöntemi güncelleme:
     * Nakit, Kredi Kartı (Hangi kart ile ödendiği) ve Havale desteği.
     */
    setPaymentStatus: (
      id: string,
      isPaid: boolean,
      details?: {
        paymentMethod?: PaymentMethod;
        creditCardName?: string;
        paidDate?: string;
      }
    ) => {
      update(items => {
        const updated = items.map(item => {
          if (item.id !== id) return item;
          if (isPaid) {
            return {
              ...item,
              isPaid: true,
              paymentMethod: details?.paymentMethod || 'cash',
              creditCardName: details?.paymentMethod === 'credit_card' ? details.creditCardName : undefined,
              paidDate: details?.paidDate || getTodayDateString()
            };
          } else {
            return {
              ...item,
              isPaid: false,
              paymentMethod: undefined,
              creditCardName: undefined,
              paidDate: undefined
            };
          }
        });
        save(updated);
        return updated;
      });
    },
    /**
     * Kapsamlı Devir (Rollover) Mekanizması:
     * 1) Ödenmemiş TÜM borçlar (kullanıcı eklediği özel kalemler ve ön tanımlılar)
     * 2) Ödenmemiş gider/faturalar (borç niteliğindeki tüm açık kalemler)
     * 3) Varsa kalan pozitif nakit bütçe / devreden gelir de yeni aya "Devreden Gelir / Kasa Bakiyesi" olarak aktarılır.
     * 4) Gecikme faizleri son ödeme tarihine göre günlük hesaplanarak yeni döneme eklenir.
     */
    rolloverToNextMonth: (sourceMonth: string) => {
      let newlyCreatedCount = 0;

      update(items => {
        const targetMonth = getNextMonth(sourceMonth);
        const sourceItems = items.filter(item => item.month === sourceMonth);

        // 1. Ödenmemiş Borçlar ve Ödenmemiş Giderler (Borç olarak görünen tüm açık kalemler)
        const unpaidLiabilities = sourceItems.filter(
          item => (item.type === 'debt' || item.type === 'expense') && !item.isPaid
        );

        const newRolloverItems: CashFlowItem[] = [];

        for (const liability of unpaidLiabilities) {
          // Günlük işlemiş faiz ve ek ücret dahil gerçek toplam tutar
          const totalWithDailyInterest = calculateItemTotal(liability);
          const roundedAmount = Math.round(totalWithDailyInterest * 100) / 100;

          newRolloverItems.push({
            id: 'rollover_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            title: `[DEVREDEN] ${liability.title}`,
            category: liability.category,
            type: 'debt', // Ödenmeyen gider de yeni ayda borç olarak devreder
            amount: roundedAmount,
            originalAmount: liability.amount,
            month: targetMonth,
            dueDate: `${targetMonth}-15`,
            interestRate: liability.interestRate,
            extraFees: [],
            isPaid: false,
            isRollover: true,
            rolloverSourceMonth: sourceMonth,
            notes: `${sourceMonth} döneminden devir. Orijinal: ₺${liability.amount.toLocaleString('tr-TR')}, Günlük faiz/cezalarla: ₺${roundedAmount.toLocaleString('tr-TR')}`
          });
        }

        // 2. Kalan Gelir / Bütçe Devri:
        // Ay içindeki toplam gelirlerden ödenen tutarlar ve harcamalar düşüldüğünde pozitif bakiye varsa yeni aya "Devreden Gelir" olarak eklenir.
        let totalIncome = 0;
        let totalPaidExpensesAndDebts = 0;

        for (const it of sourceItems) {
          if (it.type === 'income') {
            totalIncome += calculateItemTotal(it);
          } else if (it.isPaid) {
            totalPaidExpensesAndDebts += calculateItemTotal(it);
          }
        }

        const remainingSurplus = totalIncome - totalPaidExpensesAndDebts;
        if (remainingSurplus > 0) {
          newRolloverItems.push({
            id: 'rollover_inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            title: `[DEVREDEN KASA/GELİR] ${sourceMonth} Bakiyesi`,
            category: 'Kasa / Devreden Bakiye',
            type: 'income',
            amount: Math.round(remainingSurplus * 100) / 100,
            month: targetMonth,
            extraFees: [],
            isPaid: true,
            paidDate: `${targetMonth}-01`,
            isRollover: true,
            rolloverSourceMonth: sourceMonth,
            notes: `${sourceMonth} döneminden kalan net nakit devri.`
          });
        }

        newlyCreatedCount = newRolloverItems.length;

        // Eski kalemleri güncelleyelim (devredildi notu)
        const updatedSourceItems = items.map(item => {
          if (item.month === sourceMonth && (item.type === 'debt' || item.type === 'expense') && !item.isPaid) {
            return {
              ...item,
              notes: (item.notes ? item.notes + ' | ' : '') + `${targetMonth} ayına devredildi.`
            };
          }
          return item;
        });

        const result = [...newRolloverItems, ...updatedSourceItems];
        save(result);
        return result;
      });

      return newlyCreatedCount;
    }
  };
}

export const financeStore = createFinanceStore();
