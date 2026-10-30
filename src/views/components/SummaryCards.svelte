<script lang="ts">
  import type { MonthlySummary } from '../../types/finance';

  export let summary: MonthlySummary;

  function formatCurrency(val: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2
    }).format(val);
  }
</script>

<div class="summary-grid">
  <div class="summary-card income">
    <div class="summary-title">Toplam Gelir</div>
    <div class="summary-value income">{formatCurrency(summary.totalIncome)}</div>
    <div class="summary-subtext">Ay içi kaydedilen tüm tahsilatlar</div>
  </div>

  <div class="summary-card expense">
    <div class="summary-title">Toplam Gider</div>
    <div class="summary-value expense">{formatCurrency(summary.totalExpense)}</div>
    <div class="summary-subtext">Faturalar, mutfak ve yaşam giderleri</div>
  </div>

  <div class="summary-card debt">
    <div class="summary-title">Borç & Kredi Yükü</div>
    <div class="summary-value debt">{formatCurrency(summary.totalDebt)}</div>
    <div class="summary-subtext">Ödenmemiş borç sayısı: {summary.unpaidDebtCount}</div>
  </div>

  <div class="summary-card budget">
    <div class="summary-title">Kalan Net Bütçe</div>
    <div class="summary-value" class:income={summary.remainingBudget >= 0} class:expense={summary.remainingBudget < 0}>
      {formatCurrency(summary.remainingBudget)}
    </div>
    <div class="summary-subtext">Gelir - (Gider + Borçlar)</div>
  </div>

  <div class="summary-card">
    <div class="summary-title">Ödenen/Yansıyan Faiz & Ceza</div>
    <div class="summary-value" style="color: #fb923c;">
      {formatCurrency(summary.totalInterestAndFees)}
    </div>
    <div class="summary-subtext">Gecikme zammı, akdi faiz ve masraflar</div>
  </div>
</div>

