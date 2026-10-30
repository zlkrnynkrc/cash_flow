<script lang="ts">
  import type { CashFlowItem } from '../../types/finance';
  import {
    calculateItemTotal,
    calculateExtraFeesAmount,
    calculateDailyAccruedInterest
  } from '../../stores/financeCalculations';

  export let item: CashFlowItem;
  export let onOpenPaymentModal: (item: CashFlowItem) => void;
  export let onEdit: (item: CashFlowItem) => void;
  export let onDelete: (id: string) => void;

  function formatCurrency(val: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2
    }).format(val);
  }

  $: totalAmount = calculateItemTotal(item);
  $: extraFeesSum = calculateExtraFeesAmount(item.amount, item.extraFees);
  $: dailyInterest = calculateDailyAccruedInterest(item);
</script>

<div class="item-card" class:is-paid={item.isPaid}>
  <div class="item-card-left">
    <!-- Ödeme Durumu / Butonu -->
    <button
      class="payment-status-badge {item.isPaid ? 'status-paid' : 'status-unpaid'}"
      on:click={() => onOpenPaymentModal(item)}
      title="Ödeme durumunu veya yöntemini değiştirmek için tıklayın"
    >
      {#if item.isPaid}
        ✓ ÖDENDİ
      {:else}
        ⏳ ÖDENMEDİ
      {/if}
    </button>

    <div class="item-details">
      <div class="item-title">
        <span>{item.title}</span>
        
        {#if item.type === 'income'}
          <span class="item-badge badge-income">Gelir</span>
        {:else if item.type === 'expense'}
          <span class="item-badge badge-expense">Gider</span>
        {:else}
          <span class="item-badge badge-debt">Borç / Kredi</span>
        {/if}

        {#if item.isRollover}
          <span class="item-badge badge-rollover">Devreden</span>
        {/if}
      </div>

      <div class="item-meta">
        <span>Kategori: <strong>{item.category}</strong></span>
        {#if item.dueDate}
          <span>Son Ödeme: <strong>{item.dueDate}</strong></span>
        {/if}
        {#if item.interestRate && item.interestRate > 0}
          <span>Faiz: <strong>%{item.interestRate}/ay</strong></span>
        {/if}
        {#if item.isPaid}
          <span class="payment-info-text">
            Ödeme: {item.paymentMethod === 'credit_card' ? `💳 Kredi Kartı (${item.creditCardName || 'Belirtilmedi'})` : item.paymentMethod === 'bank_transfer' ? '🏦 Havale/EFT' : '💵 Nakit'}
            {#if item.paidDate}({item.paidDate}){/if}
          </span>
        {/if}
        {#if item.notes}
          <span class="notes-text">📝 {item.notes}</span>
        {/if}
      </div>

      <!-- Günlük İşleyen Faiz / Ceza Detayları -->
      {#if !item.isPaid && dailyInterest.overdueDays > 0}
        <div class="daily-interest-alert">
          ⚠️ <strong>{dailyInterest.overdueDays} gün gecikmede!</strong> İşleyen Günlük Faiz: <strong>+{formatCurrency(dailyInterest.accruedInterest)}</strong>
        </div>
      {/if}

      {#if item.extraFees && item.extraFees.length > 0}
        <div style="margin-top: 4px;">
          {#each item.extraFees as fee}
            <span class="fee-item-badge">
              +{fee.name}: {fee.type === 'percentage' ? `%${fee.value}` : `₺${fee.value}`}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="item-card-right">
    <div class="item-amount-box">
      <div class="item-total-amount" class:income={item.type === 'income'} class:expense={item.type === 'expense'} class:debt={item.type === 'debt'}>
        {item.type === 'income' ? '+' : '-'}{formatCurrency(totalAmount)}
      </div>
      {#if extraFeesSum > 0 || dailyInterest.accruedInterest > 0}
        <div class="item-base-amount">
          Ana Para: {formatCurrency(item.amount)}
          {#if dailyInterest.accruedInterest > 0}
            <span style="color: #fb923c;"> (Faiz: +{formatCurrency(dailyInterest.accruedInterest)})</span>
          {/if}
        </div>
      {/if}
    </div>

    <div style="display: flex; gap: 6px;">
      <button class="btn btn-sm btn-edit" on:click={() => onEdit(item)} title="Kalemi Düzenle">
        ✏️
      </button>
      <button class="btn btn-sm btn-danger" on:click={() => onDelete(item.id)} title="Sil">
        ✕
      </button>
    </div>
  </div>
</div>

<style>
  .payment-status-badge {
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }
  .payment-status-badge:hover {
    filter: brightness(1.15);
  }
  .status-paid {
    background-color: var(--accent-income-bg);
    color: var(--accent-income);
    border: 1px solid var(--accent-income);
  }
  .status-unpaid {
    background-color: var(--accent-debt-bg);
    color: var(--accent-debt);
    border: 1px solid var(--accent-debt);
  }
  .payment-info-text {
    color: var(--accent-income);
    font-weight: 600;
  }
  .daily-interest-alert {
    font-size: 0.8rem;
    color: #fb923c;
    background: rgba(251, 146, 60, 0.12);
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 5px;
    display: inline-block;
  }
  .btn-edit {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-main);
  }
  .btn-edit:hover {
    background: var(--bg-hover);
  }
</style>
