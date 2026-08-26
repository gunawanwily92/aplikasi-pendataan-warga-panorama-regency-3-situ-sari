import { HouseUnit, Resident } from '../types/census';

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr || birthDateStr === '-') return 0;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateDDMMYYYY(dateInput?: string | Date): string {
  if (!dateInput || dateInput === '-') return '-';
  try {
    if (typeof dateInput === 'string') {
      // Check if it matches YYYY-MM-DD pattern directly
      const match = dateInput.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${day}-${month}-${year}`;
      }
      // Check if already in DD-MM-YYYY format
      const matchDD = dateInput.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDD) {
        const day = matchDD[1].padStart(2, '0');
        const month = matchDD[2].padStart(2, '0');
        const year = matchDD[3];
        return `${day}-${month}-${year}`;
      }
    }
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateInput);
  }
}

export const BULAN_INDO = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDateNamedMonth(dateInput?: string | Date): string {
  if (!dateInput || dateInput === '-') return '-';
  try {
    if (typeof dateInput === 'string') {
      const matchYYYY = dateInput.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (matchYYYY) {
        const year = parseInt(matchYYYY[1], 10);
        const monthIdx = parseInt(matchYYYY[2], 10) - 1;
        const day = parseInt(matchYYYY[3], 10);
        return `${day} ${BULAN_INDO[monthIdx] || ''} ${year}`;
      }
      const matchDD = dateInput.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (matchDD) {
        const day = parseInt(matchDD[1], 10);
        const monthIdx = parseInt(matchDD[2], 10) - 1;
        const year = parseInt(matchDD[3], 10);
        return `${day} ${BULAN_INDO[monthIdx] || ''} ${year}`;
      }
    }
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return `${d.getDate()} ${BULAN_INDO[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return String(dateInput);
  }
}

export function formatDateIndo(dateStr: string): string {
  return formatDateDDMMYYYY(dateStr);
}

export function formatDateTimeIndo(dateTimeStr?: string): string {
  if (!dateTimeStr || dateTimeStr === '-') return '-';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return formatDateDDMMYYYY(dateTimeStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateFormatted = `${day}-${month}-${year}`;
    const timeFormatted = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${dateFormatted}, ${timeFormatted} WIB`;
  } catch {
    return dateTimeStr;
  }
}

export function formatRelativeTimeIndo(dateTimeStr?: string): string {
  if (!dateTimeStr || dateTimeStr === '-') return '';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    
    // Future or negative
    if (diffMs < 0) {
      return formatDateTimeIndo(dateTimeStr);
    }
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay === 1) {
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `Kemarin, ${timeStr} WIB`;
    }
    if (diffDay < 7) return `${diffDay} hari yang lalu`;
    
    return formatDateTimeIndo(dateTimeStr);
  } catch {
    return '';
  }
}

export function getAllResidents(houses: HouseUnit[]): { resident: Resident; house: HouseUnit }[] {
  const list: { resident: Resident; house: HouseUnit }[] = [];
  houses.forEach((house) => {
    house.residents.forEach((r) => {
      list.push({ resident: r, house });
    });
  });
  return list;
}

export function exportCensusToCSV(houses: HouseUnit[]): void {
  const allResidents = getAllResidents(houses);
  
  const headers = [
    'No. Rumah',
    'Status Hunian',
    'Kepemilikan',
    'Daya Listrik',
    'Sumber Air',
    'Wifi Internet',
    'Tgl Pindah Masuk',
    'No KK',
    'NIK',
    'Nama Warga',
    'Hubungan Keluarga',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Usia',
    'Pendidikan',
    'Agama',
    'Status Kawin',
    'Pekerjaan',
    'No HP / WA',
    'Gol Darah',
    'Status KTP',
    'Alamat Sesuai KTP',
    'Status BPJS',
    'Kategori Khusus',
    'Kendaraan',
    'Status Pendataan',
    'Tanggal Pendataan',
    'Petugas Pendataan',
    'Terakhir Diubah'
  ];

  const rows = allResidents.map(({ resident: r, house: h }) => {
    const age = calculateAge(r.tanggalLahir);
    const vehiclesStr = h.vehicles.map((v) => `${v.jenis}: ${v.platNomor} (${v.merkModel})`).join(' | ');
    const katStr = r.kategoriKhusus?.join(', ') || '-';
    const lastUpdatedStr = formatDateTimeIndo(r.updatedAt || h.updatedAt || h.tanggalSensus);

    return [
      `"${h.nomorRumah}"`,
      `"${h.statusHunian}"`,
      `"${h.kepemilikan}"`,
      `"${h.dayaListrik}"`,
      `"${h.sumberAir}"`,
      `"${h.wifi || 'Tanpa Wifi'}"`,
      `"${h.tanggalPindahMasuk ? formatDateIndo(h.tanggalPindahMasuk) : '-'}"`,
      `"${h.nomorKK || '-'}"`,
      `"'${r.nik}"`,
      `"${r.nama}"`,
      `"${r.hubunganKeluarga}"`,
      `"${r.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}"`,
      `"${r.tempatLahir || '-'}"`,
      `"${r.tanggalLahir || '-'}"`,
      `"${age} Thn"`,
      `"${r.pendidikan || '-'}"`,
      `"${r.agama}"`,
      `"${r.statusKawin}"`,
      `"${r.pekerjaan}"`,
      `"${r.noHp}"`,
      `"${r.golonganDarah || '-'}"`,
      `"${r.statusKtp}"`,
      `"${r.alamatKtpLuar || '-'}"`,
      `"${r.statusBpjs}"`,
      `"${katStr}"`,
      `"${vehiclesStr || 'Tidak Ada'}"`,
      `"${h.statusSensus}"`,
      `"${h.tanggalSensus || '-'}"`,
      `"${h.petugasSensus || '-'}"`,
      `"${lastUpdatedStr}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Data_Warga_Panorama_Regency_3_Blok_D_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateWhatsAppMessage(house: HouseUnit): string {
  const residentsList = house.residents.map((r, i) => 
    `${i + 1}. *${r.nama}* (${r.hubunganKeluarga}) - ${r.jenisKelamin === 'L' ? 'L' : 'P'}, ${r.pekerjaan || '-'}`
  ).join('\n');

  const vehiclesList = house.vehicles.length > 0 
    ? house.vehicles.map((v) => `• ${v.jenis} ${v.merkModel} [${v.platNomor}] (${v.warna})`).join('\n')
    : 'Tidak ada kendaraan tercatat';

  const text = `📋 *KARTU TANDA BUKTI DATA WARGA BLOK D*
🏘️ *Panorama Regency 3 Situ Sari*

🏡 *Unit Rumah*: ${house.nomorRumah}
📍 *Wilayah Administrasi*: RT ${house.rt || '004'} • RW ${house.rw || '012'}
📌 *Status Hunian*: ${house.statusHunian.toUpperCase()} (${house.kepemilikan})
👨‍👩‍👧‍👦 *Kepala Keluarga*: ${house.kepalaKeluargaNama || '-'}
🔢 *No. KK*: ${house.nomorKK || '-'}
⚡ *Listrik*: ${house.dayaListrik} | 💧 *Air*: ${house.sumberAir} | 🌐 *Wifi*: ${house.wifi || 'Tanpa Wifi'}

👥 *Daftar Anggota Keluarga (${house.residents.length} Jiwa)*:
${residentsList || 'Belum ada data warga terdaftar'}

🚗 *Data Kendaraan*:
${vehiclesList}

✅ *Status Pendataan*: ${house.statusSensus} (Tgl: ${formatDateDDMMYYYY(house.tanggalSensus)})
✍️ *Petugas Data*: ${house.petugasSensus || 'Pengurus Blok D'}

_Pengurus Paguyuban Blok D • Panorama Regency 3_`;

  return encodeURIComponent(text);
}
