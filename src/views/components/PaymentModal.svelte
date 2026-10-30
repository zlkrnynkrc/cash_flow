<script lang="ts">
  import type { CashFlowItem, PaymentMethod } from '../../types/finance';

  export let item: CashFlowItem;
  export let onSave: (updated: Partial<CashFlowItem>) => void;
  export let onClose: () => void;

  let isPaid = item.isPaid;
  let paymentMethod: PaymentMethod = item.paymentMethod || 'cash';
  let creditCardName = item.creditCardName || '';
  let paidDate = item.paidDate || new Date().toISOString().split('T')[0];

  function handleSubmit() {
    if (isPaid) {
      onSave({
        isPaid: true,
        paymentMethod,
        creditCardName: paymentMethod === 'credit_card' ? creditCardName.trim() : undefined,
        paidDate
      });
    } else {
      onSave({
        isPaid: false,
        paymentMethod: undefined,
        creditCardName: undefined,
        paidDate: undefined
      });
    }
    onClose();
  }
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content" style="max-width: 440px;">
    <div class="modal-header">
      <h2 class="modal-title">Ödeme Durumu & Detayı</h2>
      <button class="btn-close" on:click={onClose}>&times;</button>
    </div>

    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">
      <strong>{item.title}</strong> için ödeme kaydı ve yöntemini belirleyin.
    </p>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" style="width: 18px; height: 18px;" bind:checked={isPaid} />
          <span>Bu kalem ödendi olarak işaretlensin</span>
        </label>
      </div>

      {#if isPaid}
        <div class="form-group">
          <label class="form-label">Ödeme Yöntemi</label>
          <div style="display: flex; gap: 8px;">
            <button
              type="button"
              class="filter-btn {paymentMethod === 'cash' ? 'active' : ''}"
              on:click={() => (paymentMethod = 'cash')}
            >
              💵 Nakit
            </button>
            <button
              type="button"
              class="filter-btn {paymentMethod === 'credit_card' ? 'active' : ''}"
              on:click={() => (paymentMethod = 'credit_card')}
            >
              💳 Kredi Kartı
            </button>
            <button
              type="button"
              class="filter-btn {paymentMethod === 'bank_transfer' ? 'active' : ''}"
              on:click={() => (paymentMethod = 'bank_transfer')}
            >
              🏦 Havale / EFT
            </button>
          </div>
        </div>

        {#if paymentMethod === 'credit_card'}
          <div class="form-group">
            <label class="form-label" for="card-name">Hangi Kredi Kartı ile Ödendi?</label>
            <input
              id="card-name"
              class="form-control"
              placeholder="Örn: Garanti Bonus, İş Bankası Maximum, Yapı Kredi..."
              bind:value={creditCardName}
              required
            />
          </div>
        {/if}

        <div class="form-group">
          <label class="form-label" for="paid-date">Ödeme Tarihi</label>
          <input
            id="paid-date"
            type="date"
            class="form-control"
            bind:value={paidDate}
            required
          />
        </div>
      {/if}

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn filter-btn" on:click={onClose}>İptal</button>
        <button type="submit" class="btn btn-primary">Kaydet</button>
      </div>
    </form>
  </div>
</div>

