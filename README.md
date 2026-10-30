# Cash Flow - Kişisel Finans, Bütçe ve Borç Yönetimi

Tauri v2 + Svelte 5 mimarisiyle geliştirilmiş, Türkiye finansal koşullarına ve mevzuatına uygun kişisel finans, bütçe, kredi kartı ve borç devir takip uygulaması.

---

## 🚀 Özellikler

### 1. Geriye ve İleriye Dönük Dönem Yönetimi
- Ay seçici ve hızlı geçiş butonları (`◀ Önceki Ay`, `Sonraki Ay ▶`) ile geçmiş ve gelecek dönemler incelenebilir.
- Her döneme ait kayıtlar ve özetler bağımsız olarak görüntülenir.

### 2. Kapsamlı Devir (Rollover) Mekanizması
- **Ödenmeyen Tüm Kalemlerin Devri:** Sadece ön tanımlı kalemler değil; kullanıcının eklediği özel borçlar, kredi kartı borçları ve ödenmemiş faturalar bir sonraki aya devreder.
- **Kasa / Gelir Devri:** Ay sonunda gelirlerden yapılan harcamalar düşüldükten sonra kalan pozitif bakiye, sonraki aya `[DEVREDEN KASA/GELİR]` olarak aktarılır.
- **Formül:** Devreden borç tutarı: `(Ana Para + Cezalar) * (1 + Faiz Oranı)` ve varsa günlük gecikme faizini içerir.

### 3. Günlük Dinamik Faiz & Gecikme Takibi
- Son ödeme tarihi geçen kalemlerde gecikilen gün sayısı anlık hesaplanır:
  $$\text{Günlük Faiz} = (\text{Ana Para} + \text{Cezalar}) \times \left(\frac{\text{Aylık Faiz Oranı}}{100 \times 30}\right) \times \text{Gecikilen Gün}$$
- Uygulama açıldığı her gün gerçek ve güncel faiz tutarını yansıtır.

### 4. Ödeme Yöntemi ve Detaylı Kayıt
- Kalemler ödendi olarak işaretlenirken ödeme türü seçilebilir:
  - 💵 **Nakit**
  - 💳 **Kredi Kartı:** Hangi kredi kartı ile ödendiği (örn: *Garanti Bonus*, *Yapı Kredi World* vb.) seçilip kaydedilir.
  - 🏦 **Havale / EFT**
- Ödeme tarihi kayıt altına alınır.

### 5. Kalem Düzenleme ve Esnek Ek Ücretler
- Eklenen tüm kalemler sonradan düzenlenebilir veya silinebilir.
- Kalemlere esnek ek ücretler eklenebilir:
  - Sabit tutar (₺) veya Yüzde bazlı (%) masraf/ceza (Açma-kapama bedeli, gecikme zammı, paket aşımı vb.).

### 6. Türkiye Standart Kalemleri Ön Tanımlı
- Maaş, kira, apartman aidatı, elektrik, su, doğalgaz, internet, GSM, SGK primi, vergi (MTV/KDV), kredi kartı asgari tutarı, KMH (Ek Hesap) vb. hazır kategoriler sunulur.

---

## 📂 Mimari ve Proje Yapısı

Proje katı mimari kurallarına uygun olarak yapılandırılmıştır:

```text
src/
├── types/
│   └── finance.ts                     # Finansal veri modelleri ve tipler
├── data/
│   └── categories.ts                  # Türkiye standart gelir/gider/borç kategorileri
├── stores/
│   ├── financeStore.ts                # Reaktif veri deposu (CRUD, ödeme kaydı, devir)
│   └── financeCalculations.ts         # Günlük faiz, ek masraf ve dönem özeti formülleri
├── styles/
│   └── app.css                        # Harici temiz vanilla CSS stilleri
├── views/
│   ├── components/
│   │   ├── SummaryCards.svelte        # Aylık bilanço özet kartları
│   │   ├── CashFlowItemCard.svelte    # İşlem kartı (günlük faiz, ödeme rozeti)
│   │   ├── EditItemModal.svelte       # Yeni ekleme ve düzenleme modalı
│   │   └── PaymentModal.svelte        # Ödeme durumu ve kredi kartı seçim modalı
│   └── pages/
│       └── DashboardPage.svelte       # Ana sayfa mantık ve görünüm bileşeni
└── routes/
    ├── +layout.svelte                 # Global stil yükleyici ve ayarlar
    └── +page.svelte                   # Yalnızca DashboardPage bileşenini çağıran hafif rota
```

---

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- Rust & Cargo (Tauri için)

### Geliştirme Sunucusu (Frontend)
```bash
npm install
npm run dev
```

### Masaüstü Uygulaması Olarak Çalıştırma (Tauri)
```bash
npm run tauri dev
```

### Üretim Derlemesi (Build)
```bash
npm run tauri build
```
