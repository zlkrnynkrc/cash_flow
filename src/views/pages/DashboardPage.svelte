<script lang="ts">
  import { financeStore } from '../../stores/financeStore';
  import {
    calculateMonthlySummary,
    getCurrentMonth,
    getNextMonth,
    getPrevMonth
  } from '../../stores/financeCalculations';
  import SummaryCards from '../components/SummaryCards.svelte';
  import CashFlowItemCard from '../components/CashFlowItemCard.svelte';
  import EditItemModal from '../components/EditItemModal.svelte';
  import PaymentModal from '../components/PaymentModal.svelte';
  import type { CashFlowItem, TransactionType } from '../../types/finance';

  let selectedMonth = getCurrentMonth();
  let filterType: 'all' | TransactionType = 'all';

  // Modal Durumları
  let isAddEditModalOpen = false;
  let editingItem: CashFlowItem | null = null;
  let isPaymentModalOpen = false;
  let payingItem: CashFlowItem | null = null;

  $: items = $financeStore;
  $: monthlyItems = items.filter(item => item.month === selectedMonth);
  $: filteredItems = monthlyItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  $: summary = calculateMonthlySummary(monthlyItems);
  $: nextMonthStr = getNextMonth(selectedMonth);
  $: prevMonthStr = getPrevMonth(selectedMonth);

  function handleGoPrevMonth() {
    selectedMonth = prevMonthStr;
  }

  function handleGoNextMonth() {
    selectedMonth = nextMonthStr;
  }

  function handleOpenAdd() {
    editingItem = null;
    isAddEditModalOpen = true;
  }

  function handleOpenEdit(item: CashFlowItem) {
    editingItem = item;
    isAddEditModalOpen = true;
  }

  function handleSaveItem(data: any) {
    if (editingItem) {
      financeStore.updateItem(editingItem.id, data);
    } else {
      financeStore.addItem(data);
    }
  }

  function handleDelete(id: string) {
    if (confirm('Bu kalemi kalıcı olarak silmek istediğinize emin misiniz?')) {
      financeStore.removeItem(id);
    }
  }

  function handleOpenPaymentModal(item: CashFlowItem) {
    payingItem = item;
    isPaymentModalOpen = true;
  }

  function handleSavePayment(details: Partial<CashFlowItem>) {
    if (payingItem) {
      financeStore.updateItem(payingItem.id, details);
    }
  }

  function handleRollover() {
    const totalLiabilities = monthlyItems.filter(
      item => (item.type === 'debt' || item.type === 'expense') && !item.isPaid
    ).length;

    const confirmMsg = `${selectedMonth} dönemindeki tüm açık borç/kart/gider kalemleri (günlük faizleri dahil) ve varsa devreden kasa bakiyesi ${nextMonthStr} dönemine devredilecek.\n\nToplam devredecek açık kalem sayısı: ${totalLiabilities}\n\nDevretmek istiyor musunuz?`;
    
    if (confirm(confirmMsg)) {
      const createdCount = financeStore.rolloverToNextMonth(selectedMonth);
      selectedMonth = nextMonthStr;
      alert(`Başarıyla ${createdCount} adet devir kalemi ${nextMonthStr} dönemine aktarıldı!`);
    }
  }
</script>

<div class="app-container">
  <!-- Üst Başlık ve Geriye/İleriye Dönük Dönem Seçici -->
  <header class="app-header">
    <div class="brand-title">
      <span>💰 Cash Flow (Kişisel Finans & Bütçe)</span>
    </div>

    <!-- Geriye ve İleriye Dönük Hızlı Ay Seçici -->
    <div class="month-navigation">
      <button class="btn btn-sm btn-nav" on:click={handleGoPrevMonth} title="Önceki Döneme Git">
        ◀ {prevMonthStr}
      </button>

      <div class="month-selector">
        <label for="month-input" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">
          Dönem:
        </label>
        <input
          id="month-input"
          type="month"
          bind:value={selectedMonth}
        />
      </div>

      <button class="btn btn-sm btn-nav" on:click={handleGoNextMonth} title="Sonraki Döneme Git">
        {nextMonthStr} ▶
      </button>
    </div>
  </header>

  <!-- Aylık Bilanço ve Raporlama -->
  <SummaryCards {summary} />

  <!-- Eylemler ve Filtreler -->
  <div class="action-bar">
    <div class="filter-buttons">
      <button
        class="filter-btn {filterType === 'all' ? 'active' : ''}"
        on:click={() => (filterType = 'all')}
      >
        Tümü ({monthlyItems.length})
      </button>
      <button
        class="filter-btn {filterType === 'income' ? 'active' : ''}"
        on:click={() => (filterType = 'income')}
      >
        Gelirler
      </button>
      <button
        class="filter-btn {filterType === 'expense' ? 'active' : ''}"
        on:click={() => (filterType = 'expense')}
      >
        Giderler ({summary.unpaidExpenseCount} Açık)
      </button>
      <button
        class="filter-btn {filterType === 'debt' ? 'active' : ''}"
        on:click={() => (filterType = 'debt')}
      >
        Borçlar & Kartlar ({summary.unpaidDebtCount} Bekleyen)
      </button>
    </div>

    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
      <button class="btn btn-warning" on:click={handleRollover} title="Tüm açık borçları ve kalan geliri sonraki aya devreder">
        🔄 Sonraki Döneme Devret ({nextMonthStr})
      </button>

      <button class="btn btn-primary" on:click={handleOpenAdd}>
        + Yeni Kalem Ekle
      </button>
    </div>
  </div>

  <!-- Kalem Listesi -->
  {#if filteredItems.length === 0}
    <div class="empty-state">
      <p style="font-size: 1.1rem; margin-bottom: 8px;">{selectedMonth} dönemi için kayıtlı finans kalemi bulunamadı.</p>
      <p style="font-size: 0.85rem;">"Yeni Kalem Ekle" butonu ile maaş, borç, fatura ekleyebilir veya önceki aylardan devir yapabilirsiniz.</p>
    </div>
  {:else}
    <div class="items-list">
      {#each filteredItems as item (item.id)}
        <CashFlowItemCard
          {item}
          onOpenPaymentModal={handleOpenPaymentModal}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      {/each}
    </div>
  {/if}

  <!-- Yeni Ekleme / Düzenleme Modalı -->
  {#if isAddEditModalOpen}
    <EditItemModal
      item={editingItem}
      currentMonth={selectedMonth}
      onSave={handleSaveItem}
      onClose={() => {
        isAddEditModalOpen = false;
        editingItem = null;
      }}
    />
  {/if}

  <!-- Ödeme Yöntemi Modalı -->
  {#if isPaymentModalOpen && payingItem}
    <PaymentModal
      item={payingItem}
      onSave={handleSavePayment}
      onClose={() => {
        isPaymentModalOpen = false;
        payingItem = null;
      }}
    />
  {/if}
</div>

<style>
  .month-navigation {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-nav {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
  }
  .btn-nav:hover {
    background-color: var(--bg-hover);
    color: var(--text-main);
  }
</style>
