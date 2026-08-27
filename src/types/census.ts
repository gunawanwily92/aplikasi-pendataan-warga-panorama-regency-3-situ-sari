export type HouseOccupancyStatus = 'tetap' | 'kontrak' | 'kosong' | 'renovasi' | 'usaha';
export type CensusStatus = 'Sudah Sensus' | 'Belum Sensus' | 'Perlu Kunjungan Ulang';
export type Gender = 'L' | 'P';
export type FamilyRole = 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua' | 'Mertua' | 'Famili Lain' | 'Asisten Rumah Tangga';
export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' | 'Lainnya';
export type MaritalStatus = 'Kawin' | 'Belum Kawin' | 'Cerai Hidup' | 'Cerai Mati';

export type EducationLevel =
  | 'Tidak / Belum Sekolah'
  | 'PAUD / TK'
  | 'SD / Sederajat'
  | 'SMP / Sederajat'
  | 'SMA / SMK / Sederajat'
  | 'Diploma (D1 - D3)'
  | 'Sarjana (S1 / D4)'
  | 'Magister (S2)'
  | 'Doktor (S3)'
  | 'Lainnya / Non-Formal';

export const PEKERJAAN_OPTIONS = [
  'Karyawan Swasta',
  'Pegawai Negeri Sipil (PNS / ASN)',
  'TNI / Polri',
  'Karyawan BUMN / BUMD',
  'Wiraswasta / Pedagang / Pengusaha',
  'Profesional / Konsultan / IT / Freelancer',
  'Guru / Dosen / Tenaga Pendidik',
  'Tenaga Kesehatan / Medis (Dokter/Perawat/Bidan)',
  'Driver / Ojek Online / Kurir / Logistik',
  'Buruh Pabrik / Konstruksi / Harian',
  'Ibu Rumah Tangga (IRT)',
  'Pelajar / Mahasiswa',
  'Belum / Tidak Bekerja',
  'Pensiunan / Purnawirawan',
  'Lainnya (Ketik Manual)'
] as const;

export const PENGHASILAN_OPTIONS = [
  '< Rp 3.000.000 (< 3 Juta)',
  'Rp 3.000.000 - Rp 5.000.000 (3 - 5 Juta)',
  'Rp 5.000.000 - Rp 10.000.000 (5 - 10 Juta)',
  'Rp 10.000.000 - Rp 20.000.000 (10 - 20 Juta)',
  '> Rp 20.000.000 (> 20 Juta)',
  'Penghasilan Tidak Tetap / Harian',
  'Tidak Ada Penghasilan'
] as const;

export type IncomeRange = typeof PENGHASILAN_OPTIONS[number];

export interface Resident {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Religion;
  statusKawin: MaritalStatus;
  pendidikan: EducationLevel | string;
  pekerjaan: string;
  penghasilan?: string; // Rentang penghasilan bulanan jika warga bekerja
  noHp: string;
  golonganDarah: string;
  hubunganKeluarga: FamilyRole;
  statusKtp?: 'KTP Blok D (Sesuai Alamat)' | 'KTP Luar (Domisili Sementara)' | 'Belum Memiliki KTP (< 17 Thn)' | '' | string;
  alamatKtpLuar?: string; // Alamat asal sesuai KTP jika memilih KTP Luar
  statusBpjs: 'Aktif (Mandiri)' | 'Aktif (Perusahaan/PPU)' | 'Aktif (PBI/Bansos)' | 'Tidak Aktif / Tidak Ada';
  kategoriKhusus: ('Balita' | 'Lansia' | 'Ibu Hamil' | 'Disabilitas' | 'Pelajar' | 'Penerima Bansos')[];
  catatanKhusus?: string;
  updatedAt?: string; // ISO datetime string: waktu detail terakhir disensus/diubah
}

export interface Vehicle {
  id: string;
  jenis: 'Mobil' | 'Sepeda Motor' | 'Sepeda Listrik' | 'Lainnya';
  merkModel: string;
  platNomor: string;
  warna: string;
  pemilik?: string;
}

export interface IuranRecord {
  bulan: string; // "2025-01", "2025-02", etc.
  namaBulan: string; // "Januari 2025"
  nominal: number;
  status: 'Lunas' | 'Belum Lunas' | 'Bebas Iuran';
  tanggalBayar?: string;
  metode?: 'Transfer' | 'Tunai / Petugas';
}

export type WifiProvider =
  | 'Tanpa Wifi'
  | 'Home Fiber'
  | 'Hira'
  | 'Bnetfit'
  | 'My Republic'
  | 'Wifi Lain';

export interface EmergencyContact {
  nama: string;
  hubungan: string;
  noHp: string;
}

export interface HouseUnit {
  id: string;
  nomorRumah: string; // e.g. "D1/01", "D.01", "Blok D No. 12"
  nomorUrut: number; // For sorting e.g. 1 to 50
  rt: string;
  rw: string;
  dusun: string; // e.g. "Situsari"
  perumahan: string; // "Panorama Regency 3"
  statusHunian: HouseOccupancyStatus;
  statusSensus: CensusStatus;
  kepemilikan: 'Milik Sendiri (SHM/HGB)' | 'Kontrak / Sewa' | 'Rumah Keluarga / Dinas';
  nomorKK: string;
  kepalaKeluargaNama: string;
  residents: Resident[];
  vehicles: Vehicle[];
  dayaListrik: '900 VA' | '1300 VA' | '2200 VA' | '3500 VA+' | 'Belum Terpasang';
  sumberAir: 'PDAM' | 'Sumur Bor / Jetpump' | 'Keduanya';
  wifi?: WifiProvider | string;
  luasTanah: string; // e.g. "60 m²", "72 m²"
  luasBangunan: string; // e.g. "36 m²", "45 m²"
  kontakDarurat: EmergencyContact;
  iuranHistory: IuranRecord[];
  catatanRumah: string;
  tanggalPindahMasuk?: string; // Tanggal pindah/mulai menghuni di Panorama Regency 3 (YYYY-MM-DD)
  tanggalSensus: string; // YYYY-MM-DD
  petugasSensus: string;
  koordinatGps?: string;
  fotoRumahUrl?: string;
  updatedAt?: string; // ISO datetime string waktu detail terakhir disensus / diubah
  terakhirDiubahOleh?: string;
}

export interface RondaSchedule {
  id?: string;
  hari: string; // e.g. 'Sabtu Pekan 1 (Malam Minggu)', 'Sabtu Pekan 2 (Malam Minggu)', etc.
  pekan?: number; // 1, 2, 3, 4, 5
  tanggal?: string; // YYYY-MM-DD
  ketuaRegu: string;
  petugas: { nama: string; blok: string; noHp: string; nomorRumah?: string }[]; // 7 orang per Sabtu
  posJaga: string;
  jamMulai: string;
  jamSelesai: string;
  catatan?: string;
}

export interface MovedCitizen {
  id: string;
  tanggalPindah: string; // YYYY-MM-DD
  nomorRumahAsal: string;
  nomorKK?: string;
  tipePencatatan?: 'individual' | 'kk';
  nama: string;
  nik: string;
  jenisKelamin: Gender;
  hubunganKeluarga?: string;
  jumlahJiwaPindah: number;
  anggotaKeluarga?: {
    nama: string;
    nik: string;
    jenisKelamin: Gender;
    hubunganKeluarga: string;
  }[];
  alamatTujuan: string;
  kotaTujuan: string;
  alasanPindah: 'Pindah Rumah / Beli Rumah' | 'Kontrak Habis / Pindah Sewa' | 'Pekerjaan / Mutasi Kantor' | 'Pendidikan' | 'Menikah / Ikut Keluarga' | 'Lainnya';
  noHp?: string;
  nomorSuratPindah?: string;
  keterangan?: string;
  petugasPencatat: string;
  updatedAt?: string; // ISO datetime string waktu detail terakhir dicatat / diubah
  createdAt?: string; // ISO datetime string
}

export interface DeceasedCitizen {
  id: string;
  tanggalMeninggal: string; // YYYY-MM-DD
  jamMeninggal?: string; // HH:mm
  nomorRumah: string;
  nomorKK?: string;
  tipePencatatan?: 'individual' | 'kk';
  nama: string;
  nik: string;
  jenisKelamin: Gender;
  usia: number;
  hubunganKeluarga?: string;
  tempatMeninggal: 'Rumah Sakit' | 'Rumah Duka / Kediaman' | 'Perjalanan' | 'Tempat Lain';
  namaTempatMeninggal?: string;
  penyebabMeninggal: 'Sakit Medis' | 'Usia Lanjut' | 'Kecelakaan' | 'Lainnya';
  tempatPemakaman: string;
  tanggalPemakaman?: string;
  namaPelapor: string;
  hubunganPelapor: string;
  noHpPelapor?: string;
  nomorSuratKematian?: string;
  keterangan?: string;
  petugasPencatat: string;
  updatedAt?: string; // ISO datetime string waktu detail terakhir dicatat / diubah
  createdAt?: string; // ISO datetime string
}

export interface CoverLetter {
  id: string;
  nomorSurat: string;
  tanggalSurat: string; // YYYY-MM-DD
  nomorRumah: string; // e.g. "Blok D No. 01"
  namaPemohon: string;
  nik: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Religion;
  statusKawin: MaritalStatus;
  pekerjaan: string;
  noHp?: string;
  alamatKtp?: string;
  alamatDomisili: string;
  keperluan: string; // e.g. "Pembuatan KTP", "Pengantar SKCK", "Pendaftaran BPJS", etc.
  kategoriKeperluan?: 'KTP / KK' | 'SKCK Kepolisian' | 'BPJS Kesehatan / Bansos' | 'Bank / Finansial' | 'Keterangan Domisili' | 'Keterangan Usaha (SKU)' | 'Pengantar Nikah' | 'Pendidikan / Beasiswa' | 'Lainnya';
  keteranganLain?: string;
  berlakuHingga?: string; // YYYY-MM-DD
  petugasPembuat: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RondaAttendance {
  id: string;
  tanggal: string; // YYYY-MM-DD
  nama: string;
  nomorRumah: string;
  jamHadir: string; // HH:mm
  posJaga?: string;
  keterangan?: string;
  createdAt?: string;
}

export interface AuthUser {
  username: string;
  nama: string;
  jabatan: string;
  loginTime: string;
  role?: 'admin' | 'pengurus' | 'warga';
  isGuest?: boolean;
}

export interface CCTVCamera {
  id: string;
  nomorKamera: string; // e.g. "CAM-01"
  nama: string; // e.g. "Pos Kamling Utama & Gate Masuk"
  lokasi: string; // e.g. "Gerbang Masuk Utama Blok D"
  blokTerkait: string; // e.g. "Blok D1", "Blok D2", "Blok D3", "Blok D4", "Gerbang Utama", "Area Fasum"
  tipeKamera: string; // e.g. "Hikvision ColorVu 4MP / PTZ Outdoor"
  ipAddress?: string;
  streamUrl?: string; // RTSP / HLS / MP4 / Youtube Live / Web Embed stream link
  status: 'online' | 'offline' | 'maintenance' | 'warning';
  kualitas: '1080p FHD' | '2K QHD' | '4K UHD' | '720p HD';
  nightVision: boolean;
  audioSupport: boolean;
  ptzSupport: boolean;
  ptzPreset?: { pan: number; tilt: number; zoom: number };
  lastOnline?: string; // ISO date string
  storageDays: number; // e.g. 14 or 30 days
  petugasTeknisi?: string;
  catatan?: string;
  thumbnailUrl?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface CCTVIncidentLog {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm
  kameraId: string;
  kameraNama: string;
  lokasi: string;
  kategori: 'Mencurigakan' | 'Pelanggaran Kecepatan / Parkir' | 'Hewan Liar' | 'Sampah Liar' | 'Tamu Larut Malam' | 'Insiden / Kerusakan Fasum' | 'Lainnya';
  deskripsi: string;
  pelapor: string;
  statusPenanganan: 'Perlu Verifikasi' | 'Ditindaklanjuti' | 'Selesai / Aman';
  snapshotUrl?: string;
  catatanPetugas?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActiveTab = 'dashboard' | 'warga' | 'pengantar' | 'pindah' | 'meninggal' | 'agenda' | 'statistik' | 'ekspor' | 'ronda' | 'cctv';
