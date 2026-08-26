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
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  ketuaRegu: string;
  petugas: { nama: string; blok: string; noHp: string }[];
  posJaga: string;
  jamMulai: string;
  jamSelesai: string;
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

export interface AuthUser {
  username: string;
  nama: string;
  jabatan: string;
  loginTime: string;
}

export type ActiveTab = 'dashboard' | 'warga' | 'pengantar' | 'pindah' | 'meninggal' | 'agenda' | 'statistik' | 'ekspor';
