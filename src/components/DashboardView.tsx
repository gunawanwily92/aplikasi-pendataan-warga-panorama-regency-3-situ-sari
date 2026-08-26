import React from 'react';
import { HouseUnit, ActiveTab, MovedCitizen, DeceasedCitizen, AuthUser } from '../types/census';
import { getAllResidents, calculateAge } from '../utils/censusHelpers';
import { TOTAL_OFFICIAL_HOUSES, BLOK_TOTAL_UNITS, BLOK_LIST } from '../data/masterHouseList';
import {
  Users,
  Home,
  Car,
  PlusCircle,
  Download,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  Baby,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Zap,
  Droplets,
  Truck,
  Layers,
  HeartCrack,
  MapPin,
  TrendingDown,
  ArrowRight,
  Activity,
  FileText,
  GraduationCap,
  Droplet,
  Wifi,
  Globe,
  Lock,
  PhoneCall,
  Info,
  Clock,
  Shield
} from 'lucide-react';

interface DashboardViewProps {
  houses: HouseUnit[];
  movedList?: MovedCitizen[];
  deceasedList?: DeceasedCitizen[];
  currentUser?: AuthUser | null;
  onOpenAddModal: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectHouse: (house: HouseUnit) => void;
  onOpenLoginModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  houses,
  movedList = [],
  deceasedList = [],
  currentUser,
  onOpenAddModal,
  onNavigateTab,
  onOpenLoginModal,
}) => {
  const isGuest = currentUser?.isGuest || currentUser?.role === 'warga';
  const allResidents = getAllResidents(houses);
  const totalJiwa = allResidents.length;
  const totalLaki = allResidents.filter((r) => r.resident.jenisKelamin === 'L').length;
  const totalPerempuan = allResidents.filter((r) => r.resident.jenisKelamin === 'P').length;

  const totalHouses = houses.length;
  const occupiedHouses = houses.filter((h) => h.statusHunian === 'tetap' || h.statusHunian === 'kontrak' || h.statusHunian === 'usaha').length;
  const emptyHouses = houses.filter((h) => h.statusHunian === 'kosong').length;
  const surveyDone = houses.filter((h) => h.statusSensus === 'Sudah Sensus').length;
  const surveyPercentage = Math.round((surveyDone / TOTAL_OFFICIAL_HOUSES) * 100);

  // Count houses per block
  const blockStats = {
    D1: houses.filter((h) => h.nomorRumah.toLowerCase().includes('d1') || h.id.startsWith('D1')).length,
    D2: houses.filter((h) => h.nomorRumah.toLowerCase().includes('d2') || h.id.startsWith('D2')).length,
    D3: houses.filter((h) => h.nomorRumah.toLowerCase().includes('d3') || h.id.startsWith('D3')).length,
    D4: houses.filter((h) => h.nomorRumah.toLowerCase().includes('d4') || h.id.startsWith('D4')).length,
  };

  // Total Vehicles
  let totalMobil = 0;
  let totalMotor = 0;
  houses.forEach((h) => {
    h.vehicles.forEach((v) => {
      if (v.jenis === 'Mobil') totalMobil++;
      else totalMotor++;
    });
  });

  // Special Categories
  const totalBalita = allResidents.filter((r) => {
    const age = calculateAge(r.resident.tanggalLahir);
    return age <= 5 || r.resident.kategoriKhusus?.includes('Balita');
  }).length;

  const totalLansia = allResidents.filter((r) => {
    const age = calculateAge(r.resident.tanggalLahir);
    return age >= 60 || r.resident.kategoriKhusus?.includes('Lansia');
  }).length;

  const totalKtpLuar = allResidents.filter((r) => r.resident.statusKtp.includes('Luar')).length;
  const totalKtpBlokD = allResidents.filter((r) => r.resident.statusKtp.includes('Blok D')).length;

  // Additional stats for demographics/utilities
  const totalMilikSendiri = houses.filter((h) => h.kepemilikan.includes('Milik Sendiri')).length;
  const totalSewaKontrak = houses.filter((h) => h.kepemilikan.includes('Sewa') || h.statusHunian === 'kontrak').length;
  const totalBpjsAktif = allResidents.filter((r) => r.resident.statusBpjs?.startsWith('Aktif')).length;

  // ========================================================
  // STATISTIK WIFI & INTERNET RUMAH
  // ========================================================
  const wifiList: string[] = ['Tanpa Wifi', 'Home Fiber', 'Hira', 'Bnetfit', 'My Republic', 'Wifi Lain'];
  const wifiMap: Record<string, number> = {
    'Tanpa Wifi': 0,
    'Home Fiber': 0,
    'Hira': 0,
    'Bnetfit': 0,
    'My Republic': 0,
    'Wifi Lain': 0
  };
  houses.forEach((h) => {
    const w = h.wifi || 'Tanpa Wifi';
    wifiMap[w] = (wifiMap[w] || 0) + 1;
  });
  const totalRumahWifi = totalHouses - (wifiMap['Tanpa Wifi'] || 0);
  const pctRumahWifi = totalHouses > 0 ? Math.round((totalRumahWifi / totalHouses) * 100) : 0;

  // ========================================================
  // STATISTIK PENDIDIKAN & GOLONGAN DARAH
  // ========================================================
  const pendidikanMap: Record<string, number> = {};
  allResidents.forEach(({ resident: r }) => {
    const p = r.pendidikan?.trim() || 'Belum / Tidak Sekolah';
    pendidikanMap[p] = (pendidikanMap[p] || 0) + 1;
  });
  const sortedPendidikan = Object.entries(pendidikanMap).sort((a, b) => b[1] - a[1]);

  const golDarahMap: Record<string, number> = {
    'A': 0,
    'B': 0,
    'AB': 0,
    'O': 0,
    'Belum Tahu / -': 0
  };
  allResidents.forEach(({ resident: r }) => {
    const raw = r.golonganDarah?.trim();
    if (raw === 'A' || raw === 'B' || raw === 'AB' || raw === 'O') {
      golDarahMap[raw] = (golDarahMap[raw] || 0) + 1;
    } else {
      golDarahMap['Belum Tahu / -'] = (golDarahMap['Belum Tahu / -'] || 0) + 1;
    }
  });
  const sortedGolDarah = Object.entries(golDarahMap);

  // ========================================================
  // STATISTIK & GRAFIK MUTASI (WARGA PINDAH & MENINGGAL)
  // ========================================================
  const totalBerkasPindah = movedList.length;
  const totalJiwaPindah = movedList.reduce((acc, curr) => acc + (curr.jumlahJiwaPindah || 1), 0);

  // Alasan Pindah Aggregation
  const alasanPindahMap: Record<string, number> = {};
  movedList.forEach((m) => {
    const alasan = m.alasanPindah || 'Lainnya';
    const jiwa = m.jumlahJiwaPindah || 1;
    alasanPindahMap[alasan] = (alasanPindahMap[alasan] || 0) + jiwa;
  });
  const sortedAlasanPindah = Object.entries(alasanPindahMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Warga Meninggal Aggregation
  const totalJiwaMeninggal = deceasedList.length;
  const penyebabMap: Record<string, number> = {};
  deceasedList.forEach((d) => {
    const p = d.penyebabMeninggal || 'Lainnya';
    penyebabMap[p] = (penyebabMap[p] || 0) + 1;
  });
  const sortedPenyebab = Object.entries(penyebabMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  let decLansia = 0;
  let decDewasa = 0;
  deceasedList.forEach((d) => {
    const age = Number(d.usia) || 0;
    if (age >= 60) decLansia++;
    else decDewasa++;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Public Citizen Notice Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white">Ringkasan Publik Warga Blok D</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wide">
                  Akses Terbuka
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5 leading-relaxed">
                Menampilkan ringkasan kependudukan, statistik hunian, sarana wifi & sarana lingkungan Perumahan Panorama Regency 3 Blok D secara transparan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenLoginModal && (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Login Pengurus RT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Welcome & Census Progress Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Sistem Informasi Data & Kependudukan Lingkungan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Panorama Regency 3 Situ Sari — Blok D
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Portal pendataan kependudukan, pemetaan unit rumah, administrasi KK, data kendaraan, mutasi warga pindah, serta statistik demografi warga.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isGuest ? (
              <>
                <button
                  onClick={() => onNavigateTab('warga')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-950/40 transition-all cursor-pointer ring-1 ring-blue-500/50"
                >
                  <Users className="w-4 h-4" />
                  <span>Daftar Rumah & Warga</span>
                </button>

                <button
                  onClick={() => onNavigateTab('statistik')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer ring-1 ring-emerald-500/50"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Statistik Demografi</span>
                </button>

                <button
                  onClick={() => onNavigateTab('pengantar')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Panduan Surat RT</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-950/40 transition-all cursor-pointer ring-1 ring-blue-500/50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Input Data Baru</span>
                </button>

                <button
                  onClick={() => onNavigateTab('pengantar')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer ring-1 ring-emerald-500/50"
                >
                  <FileText className="w-4 h-4" />
                  <span>+ Buat Surat Pengantar</span>
                </button>

                <button
                  onClick={() => onNavigateTab('warga')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Data Warga</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Census Progress Meter */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-slate-300">Progres Pendataan Blok D (Acuan 110 Unit):</span>
            <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
              {surveyDone} dari {TOTAL_OFFICIAL_HOUSES} Unit Master ({surveyPercentage}%)
            </span>
          </div>

          <div className="w-full sm:w-72 bg-slate-800 rounded-full h-2.5 p-0.5 border border-slate-700 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, surveyPercentage)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Official Master Data Block Breakdown Grid */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Master Data Acuan Unit Rumah Blok D (Total {TOTAL_OFFICIAL_HOUSES} Unit Resmi)
              </h3>
              <p className="text-[11px] text-slate-500">
                Acuan baku nomor rumah untuk form data & administrasi warga
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium">
            Tercatat di sistem: <strong className="text-slate-900">{totalHouses} Unit</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {BLOK_LIST.map((blok) => {
            const totalOfficial = BLOK_TOTAL_UNITS[blok];
            const recordedCount = blockStats[blok];
            const pct = Math.round((recordedCount / totalOfficial) * 100);

            return (
              <div
                key={blok}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-blue-900">Blok {blok}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {totalOfficial} Unit
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <div className="text-[11px]">
                    No: {blok === 'D1' ? '1 s/d 45' : blok === 'D2' ? '1-48 (12A, 12B)' : blok === 'D3' ? '1 s/d 9' : '1 s/d 6'}
                  </div>
                  <div className="mt-1 font-semibold text-slate-800 flex items-center justify-between">
                    <span>Terdata:</span>
                    <span className="font-mono text-blue-700">{recordedCount} / {totalOfficial}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pusat Informasi & Panduan Layanan Warga */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-5 sm:p-6 rounded-2xl border border-slate-700/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Pusat Informasi & Layanan Warga Blok D
              </h3>
              <p className="text-[11px] text-slate-300">
                Panduan praktis administrasi RT, kontak pengurus, dan keamanan lingkungan
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold self-start sm:self-auto">
            Rt.005 Dan Rw.005 Panorama Regency 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Pengurusan Surat Pengantar */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/70 space-y-2.5">
            <div className="font-bold text-blue-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Pengurusan Surat Pengantar RT</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Warga yang memerlukan Surat Pengantar RT (KTP/KK, SKCK, BPJS, Bank, SKU, Domisili, Nikah) dapat menghubungi Pengurus RT dengan melampirkan foto KTP & KK.
            </p>
            {!isGuest ? (
              <button
                onClick={() => onNavigateTab('pengantar')}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Kelola Surat Pengantar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="text-[11px] text-blue-300 pt-1 font-semibold">
                Hubungi Sekertaris / Pengurus RT
              </div>
            )}
          </div>

          {/* Card 2: Jadwal Ronda & Keamanan */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/70 space-y-2.5">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Siskamling & Ronda Malam Minggu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Kegiatan siskamling ronda malam warga berlangsung di Pos Kamling Utama Blok D pukul 22.00 s/d 04.00 WIB.
            </p>
            {new Date().getDay() === 6 ? (
              <button
                onClick={() => onNavigateTab('ronda')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>🚨 Buka Jadwal & Presensi Ronda Malam Ini</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Menu Ronda Aktif Khusus Hari Sabtu</span>
              </div>
            )}
          </div>

          {/* Card 3: Pelaporan Warga Baru / Pindah */}
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/70 space-y-2.5">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lapor Warga Baru & Pindah</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Warga baru pindah masuk atau warga yang akan pindah domisili wajib melapor 1x24 jam kepada Ketua RT / Pengurus untuk sinkronisasi database kependudukan.
            </p>
            <div className="text-[11px] text-amber-300 pt-1 font-semibold">
              Lapor ke Ketua Blok D / Korlap Wilayah
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Houses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Unit Rumah</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {totalHouses}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-emerald-700 font-bold">{occupiedHouses} Dihuni</span>
              <span>•</span>
              <span className="text-rose-600 font-medium">{emptyHouses} Kosong</span>
            </div>
          </div>
        </div>

        {/* Total Residents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Warga (Jiwa)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {totalJiwa}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-blue-700 font-semibold">{totalLaki} L</span>
              <span>•</span>
              <span className="text-pink-600 font-semibold">{totalPerempuan} P</span>
            </div>
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Kendaraan</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {totalMobil + totalMotor}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-indigo-700 font-semibold">{totalMobil} Mobil</span>
              <span>•</span>
              <span className="text-slate-600 font-semibold">{totalMotor} Motor</span>
            </div>
          </div>
        </div>

        {/* Status KTP Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status KTP Warga</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {totalKtpBlokD}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-amber-700 font-semibold">KTP Blok D ({totalJiwa > 0 ? Math.round((totalKtpBlokD / totalJiwa) * 100) : 0}%)</span>
              <span>•</span>
              <span className="text-slate-500">{totalKtpLuar} KTP Luar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Demographic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-slate-900">{totalBalita}</div>
            <div className="text-[11px] text-slate-500 font-medium">Balita / Anak (≤5 th)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-slate-900">{totalLansia}</div>
            <div className="text-[11px] text-slate-500 font-medium">Lansia (≥60 th)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-slate-900">{totalBpjsAktif}</div>
            <div className="text-[11px] text-slate-500 font-medium">BPJS Aktif</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-slate-900">{totalMilikSendiri}</div>
            <div className="text-[11px] text-slate-500 font-medium">Rumah Milik Sendiri</div>
          </div>
        </div>
      </div>

      {/* Ringkasan Sarana & Fasilitas Lingkungan */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-800">Sarana & Utilitas Lingkungan Blok D:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Listrik: Rata-rata 1300 VA & 2200 VA</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Sumber Air: Sumur Bor / Jetpump Mandiri</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wifi: {totalRumahWifi} Rumah ({pctRumahWifi}%)</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Car className="w-3.5 h-3.5 text-slate-600" />
            <span>Kendaraan: {totalMobil} Mobil, {totalMotor} Motor</span>
          </span>
        </div>
      </div>

      {/* Ringkasan Penetrasi Layanan Wifi & Internet Rumah */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Ringkasan Provider Wifi & Layanan Internet Rumah Blok D
              </h3>
              <p className="text-[11px] text-slate-500">
                Data penyedia akses internet warga aktif di Panorama Regency 3 Blok D ({totalHouses} Unit Rumah)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
              {totalRumahWifi} Rumah Berlangganan ({pctRumahWifi}%)
            </span>
            <button
              onClick={() => onNavigateTab('statistik')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Demografi Lengkap</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {wifiList.map((provider) => {
            const count = wifiMap[provider] || 0;
            const pct = totalHouses > 0 ? Math.round((count / totalHouses) * 100) : 0;
            const isNoWifi = provider === 'Tanpa Wifi';
            return (
              <div
                key={provider}
                className={`p-3 rounded-xl border transition-all ${
                  isNoWifi
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-gradient-to-b from-blue-50/50 to-white border-blue-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] font-bold truncate ${isNoWifi ? 'text-slate-600' : 'text-blue-950'}`}>
                    {provider}
                  </span>
                  {!isNoWifi && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-xl font-black font-mono ${isNoWifi ? 'text-slate-700' : 'text-blue-700'}`}>
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200/70 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`${isNoWifi ? 'bg-slate-400' : 'bg-blue-600'} h-full rounded-full`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Section: Total Pendidikan & Total Golongan Darah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan Total Pendidikan */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Ringkasan Jenjang Pendidikan Warga
                </h3>
                <p className="text-[11px] text-slate-500">
                  Distribusi kualifikasi pendidikan warga aktif ({totalJiwa} Jiwa)
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('statistik')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {sortedPendidikan.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              Belum ada data pendidikan tercatat
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {sortedPendidikan.slice(0, 5).map(([jenjang, count], idx) => {
                const pct = totalJiwa > 0 ? Math.round((count / totalJiwa) * 100) : 0;
                const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-sky-600', 'bg-teal-600', 'bg-emerald-600', 'bg-slate-500'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={jenjang} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span className="truncate pr-2">{jenjang}</span>
                      <span className="font-mono text-slate-900 font-bold shrink-0">{count} Jiwa ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Terdata: <strong>{sortedPendidikan.length} Kategori Jenjang</strong></span>
                <span className="text-indigo-700 font-semibold cursor-pointer" onClick={() => onNavigateTab('statistik')}>
                  Lihat Statistik Demografi →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Ringkasan Total Golongan Darah */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Total Golongan Darah Warga Aktif
                </h3>
                <p className="text-[11px] text-slate-500">
                  Data donor & kesiapan medis darurat RT ({totalJiwa} Jiwa)
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('statistik')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['A', 'B', 'AB', 'O'].map((goldar) => {
              const count = golDarahMap[goldar] || 0;
              const pct = totalJiwa > 0 ? Math.round((count / totalJiwa) * 100) : 0;
              return (
                <div key={goldar} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-center flex flex-col justify-between">
                  <div className="text-[11px] font-bold text-rose-900 uppercase">Gol {goldar}</div>
                  <div className="text-xl font-extrabold font-mono text-rose-700 my-0.5">{count}</div>
                  <div className="text-[10px] font-semibold text-rose-600">{pct}% Jiwa</div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Belum Diketahui / Cek: <strong>{golDarahMap['Belum Tahu / -'] || 0} Jiwa</strong></span>
            </span>
            <span className="text-[11px] text-slate-500">
              {totalJiwa > 0 ? Math.round(((golDarahMap['Belum Tahu / -'] || 0) / totalJiwa) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
          {!isGuest ? 'Menu Akses Pengurus RT' : 'Layanan & Informasi Warga Blok D'}
        </h3>
        {!isGuest ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <button
              onClick={() => onNavigateTab('warga')}
              className="p-3.5 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span>Data Warga & Rumah</span>
            </button>

            <button
              onClick={() => onNavigateTab('statistik')}
              className="p-3.5 bg-slate-50 hover:bg-sky-50/70 hover:border-sky-300 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-1.5 transition-all cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <span>Statistik Demografi</span>
            </button>

            <button
              onClick={() => onNavigateTab('pengantar')}
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Layanan Surat RT</span>
            </button>

            <button
              onClick={() => onNavigateTab('pindah')}
              className="p-3.5 bg-slate-50 hover:bg-amber-50/70 hover:border-amber-300 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-1.5 transition-all cursor-pointer"
            >
              <Truck className="w-5 h-5 text-amber-600" />
              <span>Warga Pindah</span>
            </button>

            <button
              onClick={() => onNavigateTab('ekspor')}
              className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 text-slate-800 font-bold rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1"
            >
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Ekspor & Cetak</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Akses Warga Terproteksi</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Warga dapat melihat ringkasan statistik, fasilitas lingkungan, dan transparansi data Rt.005 Dan Rw.005 secara umum.
                </p>
              </div>
            </div>

            {new Date().getDay() === 6 ? (
              <button
                onClick={() => onNavigateTab('ronda')}
                className="p-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl flex items-start gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>Jadwal & Presensi Ronda Sabtu</span>
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">Malam Ini</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Klik di sini untuk mengisi daftar hadir siskamling & jadwal jaga malam pos kamling.
                  </p>
                </div>
              </button>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Jadwal Ronda Siskamling</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Menu presensi dan jadwal piket pos kamling diaktifkan secara otomatis setiap hari Sabtu malam.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
