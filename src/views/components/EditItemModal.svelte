<script lang="ts">
  import type { CashFlowItem, TransactionType, ExtraFee } from '../../types/finance';
  import { TURKEY_PRESET_CATEGORIES } from '../../data/categories';

  export let item: CashFlowItem | null = null; // null ise yeni ekleme, dolu ise düzenleme
  export let currentMonth: string;
  export let onSave: (itemData: any) => void;
  export let onClose: () => void;

  let title = item ? item.title : '';
  let type: TransactionType = item ? item.type : 'expense';
  let category = item ? item.category : '';
  let amount: number = item ? item.amount : 0;
  let month = item ? item.month : currentMonth;
  let dueDate = item?.dueDate || '';
  let interestRate: number | undefined = item?.interestRate;
  let notes = item?.notes || '';

  let extraFees: ExtraFee[] = item ? [...item.extraFees] : [];
  let newFeeName = '';
  let newFeeType: 'fixed' | 'percentage' = 'fixed';
  let newFeeValue: number = 0;

  $: availableCategories = TURKEY_PRESET_CATEGORIES.filter(c => c.type === type);

  function onTypeChange(newType: TransactionType) {
    type = newType;
    const firstCat = TURKEY_PRESET_CATEGORIES.find(c => c.type === newType);
    if (firstCat) category = firstCat.name;
  }

  if (!category) {
    const firstCat = TURKEY_PRESET_CATEGORIES.find(c => c.type === type);
    if (firstCat) category = firstCat.name;
  }

  function addFee() {
    if (!newFeeName.trim() || newFeeValue <= 0) return;
    extraFees = [
      ...extraFees,
      {
        id: 'fee_' + Date.now(),
        name: newFeeName.trim(),
        type: newFeeType,
        value: Number(newFeeValue)
      }
    ];
    newFeeName = '';
    newFeeValue = 0;
  }

  function removeFee(feeId: string) {
    extraFees = extraFees.filter(f => f.id !== feeId);
  }

  function handleSubmit() {
    if (!title.trim() || amount <= 0) return;

    onSave({
      title: title.trim(),
      category: category || 'Genel',
      type,
      amount: Number(amount),
      month,
      dueDate: dueDate || undefined,
      interestRate: interestRate ? Number(interestRate) : undefined,
      notes: notes.trim() || undefined,
      extraFees
    });

    onClose();
  }
</script>

<div class="modal-overlay" on:click|self={onClose}>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">{item ? 'Kalemi Düzenle' : 'Yeni Finans Kalemi Ekle'}</h2>
      <button class="btn-close" on:click={onClose}>&times;</button>
    </div>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label class="form-label">İşlem Türü</label>
        <div style="display: flex; gap: 8px;">
          <button
            type="button"
            class="filter-btn {type === 'expense' ? 'active' : ''}"
            on:click={() => onTypeChange('expense')}
          >
            Gider / Fatura
          </button>
          <button
            type="button"
            class="filter-btn {type === 'income' ? 'active' : ''}"
            on:click={() => onTypeChange('income')}
          >
            Gelir
          </button>
          <button
            type="button"
            class="filter-btn {type === 'debt' ? 'active' : ''}"
            on:click={() => onTypeChange('debt')}
          >
            Borç & Kredi Kartı
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="item-title">Kalem Başlığı</label>
        <input
          id="item-title"
          class="form-control"
          placeholder="Örn: Garanti Bonus Kredi Kartı, Elektrik Faturası, Maaş..."
          bind:value={title}
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="item-category">Kategori (Ön Tanımlı / Özel)</label>
          <input
            id="item-category"
            list="categories-list"
            class="form-control"
            placeholder="Kategori seçin veya yazın..."
            bind:value={category}
            required
          />
          <datalist id="categories-list">
            {#each availableCategories as cat}
              <option value={cat.name} />
            {/each}
          </datalist>
        </div>

        <div class="form-group">
          <label class="form-label" for="item-amount">Tutar (₺)</label>
          <input
            id="item-amount"
            type="number"
            step="0.01"
            min="0"
            class="form-control"
            placeholder="0.00"
            bind:value={amount}
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="item-due-date">Son Ödeme Tarihi</label>
          <input id="item-due-date" type="date" class="form-control" bind:value={dueDate} />
        </div>

        <div class="form-group">
          <label class="form-label" for="item-interest">Aylık Faiz Oranı (%) [Günlük hesaplanır]</label>
          <input
            id="item-interest"
            type="number"
            step="0.01"
            min="0"
            class="form-control"
            placeholder="Örn: 4.75"
            bind:value={interestRate}
          />
        </div>
      </div>

      <!-- Esnek Ek Ücretler / Cezalar Bölümü -->
      <div class="fees-section">
        <label class="form-label">Esnek Ek Masraflar & Cezalar (Açma-Kapama, Gecikme Zammı vb.)</label>
        
        {#if extraFees.length > 0}
          <div style="margin-bottom: 8px;">
            {#each extraFees as fee}
              <div class="fee-row">
                <span style="flex: 1; font-size: 0.9rem;">
                  {fee.name}: {fee.type === 'percentage' ? `%${fee.value}` : `₺${fee.value}`}
                </span>
                <button type="button" class="btn btn-sm btn-danger" on:click={() => removeFee(fee.id)}>Sil</button>
              </div>
            {/each}
          </div>
        {/if}

        <div class="fee-row">
          <input
            type="text"
            class="form-control"
            placeholder="Masraf Adı"
            bind:value={newFeeName}
          />
          <select class="form-control" style="max-width: 110px;" bind:value={newFeeType}>
            <option value="fixed">Sabit ₺</option>
            <option value="percentage">Yüzde %</option>
          </select>
          <input
            type="number"
            step="0.01"
            class="form-control"
            style="max-width: 90px;"
            placeholder="Değer"
            bind:value={newFeeValue}
          />
          <button type="button" class="btn btn-sm btn-primary" on:click={addFee}>Ekle</button>
        </div>
      </div>

      <div class="form-group" style="margin-top: 14px;">
        <label class="form-label" for="item-notes">Açıklama / Not</label>
        <input
          id="item-notes"
          type="text"
          class="form-control"
          placeholder="Ekstra not ekleyin..."
          bind:value={notes}
        />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn filter-btn" on:click={onClose}>İptal</button>
        <button type="submit" class="btn btn-primary">{item ? 'Güncelle' : 'Kaydet'}</button>
      </div>
    </form>
  </div>
</div>

