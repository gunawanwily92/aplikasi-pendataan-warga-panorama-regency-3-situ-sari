import { HouseUnit, RondaSchedule, MovedCitizen, DeceasedCitizen, CoverLetter, CCTVCamera, CCTVIncidentLog } from '../types/census';

/**
 * Mendeteksi apakah format nomor rumah adalah generic "Blok D" lama (bukan Blok D1, D2, D3, D4 resmi).
 */
export function isGenericBlokD(nomorRumah?: string, id?: string): boolean {
  const str = (nomorRumah || id || '').trim();
  if (!str) return false;
  // Jika memuat D1, D2, D3, atau D4 (contoh: "Blok D1 No. 01", "D1-01", "Blok D2", dsb), itu data resmi valid
  if (/(?:Blok\s*)?D[1-4]\b/i.test(str) || /^D[1-4]-/i.test(str)) {
    return false;
  }
  // Jika hanya berlabel "Blok D No. xx", "Blok D xx", atau "D-xx", ini adalah data generic lama
  if (/^Blok\s*D\b/i.test(str) || /^D-\d+/i.test(str)) {
    return true;
  }
  return false;
}

// Data warga sensus aktif dimulai kosong atau hanya unit Blok D1-D4 resmi
export const INITIAL_HOUSES: HouseUnit[] = [];

export const INITIAL_RONDA_SCHEDULE: RondaSchedule[] = [
  {
    hari: 'Sabtu Pekan 1 (Malam Minggu)',
    pekan: 1,
    ketuaRegu: 'Belum ditentukan',
    petugas: [],
    posJaga: 'Pos Kamling Utama Blok D & Patroli Gang D1-D4',
    jamMulai: '22:00',
    jamSelesai: '04:00',
    catatan: 'Regu 1 Siskamling Sabtu Pekan Pertama (7 Orang)'
  },
  {
    hari: 'Sabtu Pekan 2 (Malam Minggu)',
    pekan: 2,
    ketuaRegu: 'Belum ditentukan',
    petugas: [],
    posJaga: 'Pos Kamling Utama Blok D & Patroli Gang D1-D4',
    jamMulai: '22:00',
    jamSelesai: '04:00',
    catatan: 'Regu 2 Siskamling Sabtu Pekan Kedua (7 Orang)'
  },
  {
    hari: 'Sabtu Pekan 3 (Malam Minggu)',
    pekan: 3,
    ketuaRegu: 'Belum ditentukan',
    petugas: [],
    posJaga: 'Pos Kamling Utama Blok D & Patroli Gang D1-D4',
    jamMulai: '22:00',
    jamSelesai: '04:00',
    catatan: 'Regu 3 Siskamling Sabtu Pekan Ketiga (7 Orang)'
  },
  {
    hari: 'Sabtu Pekan 4 (Malam Minggu)',
    pekan: 4,
    ketuaRegu: 'Belum ditentukan',
    petugas: [],
    posJaga: 'Pos Kamling Utama Blok D & Patroli Gang D1-D4',
    jamMulai: '22:00',
    jamSelesai: '04:00',
    catatan: 'Regu 4 Siskamling Sabtu Pekan Keempat (7 Orang)'
  },
  {
    hari: 'Sabtu Pekan 5 (Malam Minggu)',
    pekan: 5,
    ketuaRegu: 'Belum ditentukan',
    petugas: [],
    posJaga: 'Pos Kamling Utama Blok D (Patroli Gabungan Korlap)',
    jamMulai: '22:00',
    jamSelesai: '04:00',
    catatan: 'Regu 5 Gabungan untuk Bulan dengan 5 Hari Sabtu (7 Orang)'
  }
];

const STORAGE_KEY = 'panorama_regency3_blok_d_sensus_v1';
const RONDA_STORAGE_KEY = 'panorama_regency3_blok_d_ronda_v3_clean';

export function loadHousesFromStorage(): HouseUnit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Hapus & filter data warga generic Blok D serta rumah yang memiliki 0 jiwa
        return parsed.filter((h: HouseUnit) => !isGenericBlokD(h?.nomorRumah, h?.id) && Boolean(h?.residents && h.residents.length > 0));
      }
    }
  } catch (e) {
    console.error('Failed to load houses from localStorage', e);
  }
  return INITIAL_HOUSES.filter((h) => !isGenericBlokD(h?.nomorRumah, h?.id) && Boolean(h?.residents && h.residents.length > 0));
}

export function saveHousesToStorage(houses: HouseUnit[]): void {
  try {
    // Pastikan tidak menyimpan data generic Blok D dan data dengan 0 jiwa
    const cleanHouses = houses.filter((h) => !isGenericBlokD(h?.nomorRumah, h?.id) && Boolean(h?.residents && h.residents.length > 0));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanHouses));
  } catch (e) {
    console.error('Failed to save houses to localStorage', e);
  }
}

export function loadRondaFromStorage(): RondaSchedule[] {
  try {
    const saved = localStorage.getItem(RONDA_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Pastikan format Sabtu
        const hasSabtu = parsed.some((p: RondaSchedule) => p && p.hari && typeof p.hari === 'string' && p.hari.toLowerCase().includes('sabtu'));
        if (hasSabtu) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load ronda from localStorage', e);
  }
  return INITIAL_RONDA_SCHEDULE;
}

export function saveRondaToStorage(schedules: RondaSchedule[]): void {
  try {
    localStorage.setItem(RONDA_STORAGE_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.error('Failed to save ronda to localStorage', e);
  }
}

export const MOVED_STORAGE_KEY = 'PR3_CENSUS_MOVED_CITIZENS_V1';
export const DECEASED_STORAGE_KEY = 'PR3_CENSUS_DECEASED_CITIZENS_V1';

export const INITIAL_MOVED_CITIZENS: MovedCitizen[] = [
  
];

export const INITIAL_DECEASED_CITIZENS: DeceasedCitizen[] = [
  
];

export function loadMovedFromStorage(): MovedCitizen[] {
  try {
    const saved = localStorage.getItem(MOVED_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((m: MovedCitizen) => !isGenericBlokD(m?.nomorRumahAsal));
      }
    }
  } catch (e) {
    console.error('Failed to load moved citizens from localStorage', e);
  }
  return INITIAL_MOVED_CITIZENS;
}

export function saveMovedToStorage(data: MovedCitizen[]): void {
  try {
    const clean = data.filter((m) => !isGenericBlokD(m?.nomorRumahAsal));
    localStorage.setItem(MOVED_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error('Failed to save moved citizens to localStorage', e);
  }
}

export function loadDeceasedFromStorage(): DeceasedCitizen[] {
  try {
    const saved = localStorage.getItem(DECEASED_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((d: DeceasedCitizen) => !isGenericBlokD(d?.nomorRumah));
      }
    }
  } catch (e) {
    console.error('Failed to load deceased citizens from localStorage', e);
  }
  return INITIAL_DECEASED_CITIZENS;
}

export function saveDeceasedToStorage(data: DeceasedCitizen[]): void {
  try {
    const clean = data.filter((d) => !isGenericBlokD(d?.nomorRumah));
    localStorage.setItem(DECEASED_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error('Failed to save deceased citizens to localStorage', e);
  }
}

export const COVER_LETTERS_STORAGE_KEY = 'PR3_CENSUS_COVER_LETTERS_V1';

export const INITIAL_COVER_LETTERS: CoverLetter[] = [
  
];

export function loadCoverLettersFromStorage(): CoverLetter[] {
  try {
    const saved = localStorage.getItem(COVER_LETTERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((l: CoverLetter) => !isGenericBlokD(l?.nomorRumah));
      }
    }
  } catch (e) {
    console.error('Failed to load cover letters from localStorage', e);
  }
  return INITIAL_COVER_LETTERS;
}

export function saveCoverLettersToStorage(data: CoverLetter[]): void {
  try {
    const clean = data.filter((l) => !isGenericBlokD(l?.nomorRumah));
    localStorage.setItem(COVER_LETTERS_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error('Failed to save cover letters to localStorage', e);
  }
}

export const CCTV_CAMERAS_STORAGE_KEY = 'PR3_CENSUS_CCTV_CAMERAS_V1';
export const CCTV_LOGS_STORAGE_KEY = 'PR3_CENSUS_CCTV_LOGS_V1';

export const INITIAL_CCTV_CAMERAS: CCTVCamera[] = [
  {
    id: 'cam-01',
    nomorKamera: 'CAM-01',
    nama: 'Gate Utama & Pos Kamling Blok D',
    lokasi: 'Gerbang Masuk Utama Blok D (Pos 1 Utama & Gang D1)',
    blokTerkait: 'Gerbang Utama',
    tipeKamera: 'Hikvision ColorVu 4MP (Outdoor Audio)',
    ipAddress: '192.168.1.101',
    streamUrl: '',
    status: 'online',
    kualitas: '4K UHD',
    nightVision: true,
    audioSupport: true,
    ptzSupport: true,
    ptzPreset: { pan: 0, tilt: 0, zoom: 1 },
    storageDays: 30,
    petugasTeknisi: 'Tim IT & Keamanan Blok D',
    catatan: 'Kamera utama pengawasan keluar-masuk kendaraan & tamu warga 24 jam.',
    lastOnline: new Date().toISOString()
  },
  {
    id: 'cam-02',
    nomorKamera: 'CAM-02',
    nama: 'Simpang Utama D1 & D2',
    lokasi: 'Simpang Tiga Utama Blok D1 & D2 (Depan Unit D2/01)',
    blokTerkait: 'Blok D2',
    tipeKamera: 'Hikvision Bullet IP 4MP Full HD',
    ipAddress: '192.168.1.102',
    streamUrl: '',
    status: 'online',
    kualitas: '1080p FHD',
    nightVision: true,
    audioSupport: false,
    ptzSupport: false,
    storageDays: 14,
    petugasTeknisi: 'Tim IT & Keamanan Blok D',
    catatan: 'Memantau arus lalu lintas antar gang D1 dan D2.',
    lastOnline: new Date().toISOString()
  },
  {
    id: 'cam-03',
    nomorKamera: 'CAM-03',
    nama: 'Jalur Tengah Blok D2 & D3',
    lokasi: 'Koridor Tengah Antar Gang Blok D2 & D3',
    blokTerkait: 'Blok D3',
    tipeKamera: 'Dahua Smart IR 4MP Outdoor',
    ipAddress: '192.168.1.103',
    streamUrl: '',
    status: 'online',
    kualitas: '1080p FHD',
    nightVision: true,
    audioSupport: true,
    ptzSupport: false,
    storageDays: 14,
    petugasTeknisi: 'Tim IT & Keamanan Blok D',
    catatan: 'Pengawasan area rumah dan jalan tengah D2-D3.',
    lastOnline: new Date().toISOString()
  },
  {
    id: 'cam-04',
    nomorKamera: 'CAM-04',
    nama: 'Taman Fasum & Pos Lingkungan D3',
    lokasi: 'Area Taman Fasum & Pos Pantau Lingkungan D3/D4',
    blokTerkait: 'Area Fasum',
    tipeKamera: 'Hikvision PTZ 4MP Speed Dome',
    ipAddress: '192.168.1.104',
    streamUrl: '',
    status: 'online',
    kualitas: '2K QHD',
    nightVision: true,
    audioSupport: true,
    ptzSupport: true,
    ptzPreset: { pan: 45, tilt: -10, zoom: 1.5 },
    storageDays: 30,
    petugasTeknisi: 'Tim IT & Keamanan Blok D',
    catatan: 'Memantau aktivitas anak-anak dan area fasilitas umum perumahan.',
    lastOnline: new Date().toISOString()
  },
  {
    id: 'cam-05',
    nomorKamera: 'CAM-05',
    nama: 'Ujung Gang Blok D4 & Perimeter Belakang',
    lokasi: 'Jalur Belakang Blok D4 & Batas Pagar Perimeter Perumahan',
    blokTerkait: 'Blok D4',
    tipeKamera: 'Hikvision ColorVu Bullet 4MP',
    ipAddress: '192.168.1.105',
    streamUrl: '',
    status: 'online',
    kualitas: '1080p FHD',
    nightVision: true,
    audioSupport: false,
    ptzSupport: false,
    storageDays: 14,
    petugasTeknisi: 'Tim IT & Keamanan Blok D',
    catatan: 'Pengawasan keamanan batas perimeter belakang dan dinding perumahan.',
    lastOnline: new Date().toISOString()
  },
  {
    id: 'cam-06',
    nomorKamera: 'CAM-06',
    nama: 'Sudut Blok D1 Belakang & Jalur Darurat',
    lokasi: 'Ujung Barat Gang Blok D1 Belakang',
    blokTerkait: 'Blok D1',
    tipeKamera: 'Dahua Full Color 4MP',
    ipAddress: '192.168.1.106',
    streamUrl: '',
    status: 'online',
    kualitas: '1080p FHD',
    nightVision: true,
    audioSupport: false,
    ptzSupport: false,
    storageDays: 14,
    petugasTeknisi: 'Tim IT & Keamanan Blok D',
    catatan: 'Pengawasan pintu darurat dan sudut belakang perumahan.',
    lastOnline: new Date().toISOString()
  }
];

export const INITIAL_CCTV_LOGS: CCTVIncidentLog[] = [];

export function loadCCTVCamerasFromStorage(): CCTVCamera[] {
  try {
    const saved = localStorage.getItem(CCTV_CAMERAS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load CCTV cameras from localStorage', e);
  }
  return INITIAL_CCTV_CAMERAS;
}

export function saveCCTVCamerasToStorage(data: CCTVCamera[]): void {
  try {
    localStorage.setItem(CCTV_CAMERAS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save CCTV cameras to localStorage', e);
  }
}

export function loadCCTVLogsFromStorage(): CCTVIncidentLog[] {
  try {
    const saved = localStorage.getItem(CCTV_LOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load CCTV incident logs from localStorage', e);
  }
  return INITIAL_CCTV_LOGS;
}

export function saveCCTVLogsToStorage(data: CCTVIncidentLog[]): void {
  try {
    localStorage.setItem(CCTV_LOGS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save CCTV incident logs to localStorage', e);
  }
}
