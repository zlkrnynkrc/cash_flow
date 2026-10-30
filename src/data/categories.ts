export interface DefaultCategory {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'debt';
  suggestedFees?: string[];
}

export const TURKEY_PRESET_CATEGORIES: DefaultCategory[] = [
  // GELİRLER
  { id: 'inc_maas', name: 'Maaş / Ücret', type: 'income' },
  { id: 'inc_ek_ders_mesai', name: 'Fazla Mesai / Ek Ders', type: 'income' },
  { id: 'inc_prim_ikramiye', name: 'Prim & İkramiye', type: 'income' },
  { id: 'inc_kira_geliri', name: 'Kira Geliri', type: 'income' },
  { id: 'inc_serbest_meslek', name: 'Serbest Meslek / Freelance', type: 'income' },
  { id: 'inc_emekli_maasi', name: 'Emekli Maaşı', type: 'income' },
  { id: 'inc_faiz_temettu', name: 'Mevduat Faizi / Temettü', type: 'income' },
  { id: 'inc_sosyal_yardim', name: 'Sosyal Yardım / Burs', type: 'income' },
  { id: 'inc_diger', name: 'Diğer Gelir', type: 'income' },

  // GİDERLER - FATURALAR VE TEMEL YAŞAM (Türkiye mevzuatı ve standart hizmetler)
  { id: 'exp_kira', name: 'Ev / İş Yeri Kirası', type: 'expense' },
  { id: 'exp_aidat', name: 'Apartman / Site Aidatı', type: 'expense', suggestedFees: ['Gecikme Tazminatı (%5)'] },
  { id: 'exp_elektrik', name: 'Elektrik Faturası (CK/Aydem/Enerjisa vb.)', type: 'expense', suggestedFees: ['Gecikme Zammı', 'Açma-Kapama Bedeli'] },
  { id: 'exp_su', name: 'Su Faturası (İSKİ/ASKİ/İZSU vb.)', type: 'expense', suggestedFees: ['Gecikme Zammı', 'Açma-Kapama Bedeli'] },
  { id: 'exp_dogalgaz', name: 'Doğalgaz Faturası (İGDAŞ/Başkentgaz vb.)', type: 'expense', suggestedFees: ['Gecikme Zammı', 'Sayaç Açma Bedeli'] },
  { id: 'exp_internet', name: 'Ev İnterneti & TV Platformları', type: 'expense', suggestedFees: ['Gecikme Faizi', 'Hat Dondurma/Açma Bedeli'] },
  { id: 'exp_gsm', name: 'Cep Telefonu Faturası (Turkcell/TT/Vodafone)', type: 'expense', suggestedFees: ['Gecikme Faizi', 'Hat Açma/Kapama Ücreti', 'Aşım Paketi Ücreti'] },
  { id: 'exp_mutfak', name: 'Market, Gıda & Pazar Alışverişi', type: 'expense' },
  { id: 'exp_ulasim', name: 'Toplu Taşıma / Akaryakıt / OGS-HGS', type: 'expense' },
  { id: 'exp_egitim', name: 'Eğitim & Okul / Kırtasiye Masrafları', type: 'expense' },
  { id: 'exp_saglik', name: 'Sağlık, İlaç & Muayene Katkı Payı', type: 'expense' },
  { id: 'exp_sigorta', name: 'SGK / Bağkur / GSS Primi / Kasko / DASK', type: 'expense', suggestedFees: ['SGK Gecikme Zammı'] },
  { id: 'exp_vergi', name: 'Vergiler (MTV, Emlak, Gelir/KDV Vergisi)', type: 'expense', suggestedFees: ['6183 Gecikme Zammı (%3.5/ay)'] },

  // BORÇ VE KREDİ KALEMLERİ
  { id: 'debt_kredi_karti', name: 'Kredi Kartı Ekstresi / Asgari Tutar', type: 'debt', suggestedFees: ['Akdi Faiz', 'Gecikme Faizi (%4.75)', 'Limit Aşım Ücreti'] },
  { id: 'debt_ihtiyac_kredisi', name: 'İhtiyaç Kredisi Taksiti', type: 'debt', suggestedFees: ['Gecikme Faizi', 'BSMV & KKDF'] },
  { id: 'debt_konut_kredisi', name: 'Konut / Taşıt Kredisi Taksiti', type: 'debt', suggestedFees: ['Gecikme Faizi'] },
  { id: 'debt_kmh', name: 'KMH / Ek Hesap / Avans Hesap', type: 'debt', suggestedFees: ['KMH Faiz Tahakkuku', 'BSMV & KKDF'] },
  { id: 'debt_sahis', name: 'Elden / Şahıs Borcu', type: 'debt' },
  { id: 'debt_senet', name: 'Senet & Taksitli Alışveriş Borcu', type: 'debt', suggestedFees: ['Protesto Masrafı', 'Gecikme Faizi'] }
];

