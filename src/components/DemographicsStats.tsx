import React from 'react';
import { HouseUnit, MovedCitizen, DeceasedCitizen } from '../types/census';
import { getAllResidents, calculateAge } from '../utils/censusHelpers';
import {
  Users,
  BarChart3,
  PieChart,
  Heart,
  Briefcase,
  Zap,
  Droplets,
  ShieldCheck,
  Home,
  Truck,
  HeartCrack,
  MapPin,
  Activity,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Calendar,
  GraduationCap,
  Droplet,
  Wifi
} from 'lucide-react';

interface DemographicsStatsProps {
  houses: HouseUnit[];
  movedList?: MovedCitizen[];
  deceasedList?: DeceasedCitizen[];
}

export const DemographicsStats: React.FC<DemographicsStatsProps> = ({
  houses,
  movedList = [],
  deceasedList = []
}) => {
  const allResidents = getAllResidents(houses);
  const totalJiwa = allResidents.length;

  // Gender Warga Aktif
  const totalLaki = allResidents.filter((r) => r.resident.jenisKelamin === 'L').length;
  const totalPerempuan = allResidents.filter((r) => r.resident.jenisKelamin === 'P').length;
  const pctLaki = totalJiwa > 0 ? Math.round((totalLaki / totalJiwa) * 100) : 0;
  const pctPerempuan = totalJiwa > 0 ? Math.round((totalPerempuan / totalJiwa) * 100) : 0;

  // Age Breakdown Warga Aktif
  let ageBalita = 0; // 0-5
  let ageAnak = 0; // 6-12
  let ageRemaja = 0; // 13-17
  let ageProduktif = 0; // 18-59
  let ageLansia = 0; // 60+

  allResidents.forEach(({ resident: r }) => {
    const age = calculateAge(r.tanggalLahir);
    if (age <= 5) ageBalita++;
    else if (age <= 12) ageAnak++;
    else if (age <= 17) ageRemaja++;
    else if (age <= 59) ageProduktif++;
    else ageLansia++;
  });

  // Occupations
  const occupationMap: Record<string, number> = {};
  allResidents.forEach(({ resident: r }) => {
    const job = r.pekerjaan?.trim() || 'Lainnya / Tidak Disebutkan';
    occupationMap[job] = (occupationMap[job] || 0) + 1;
  });
  const sortedJobs = Object.entries(occupationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  // Education Breakdown
  const pendidikanMap: Record<string, number> = {};
  allResidents.forEach(({ resident: r }) => {
    const p = r.pendidikan?.trim() || 'Belum / Tidak Sekolah';
    pendidikanMap[p] = (pendidikanMap[p] || 0) + 1;
  });
  const sortedPendidikan = Object.entries(pendidikanMap).sort((a, b) => b[1] - a[1]);

  // Blood Type Breakdown
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

  // BPJS Status
  const bpjsMap: Record<string, number> = {};
  allResidents.forEach(({ resident: r }) => {
    const b = r.statusBpjs || 'Tidak Aktif';
    bpjsMap[b] = (bpjsMap[b] || 0) + 1;
  });

  // Housing Occupancy
  const occupancyMap: Record<string, number> = {};
  houses.forEach((h) => {
    occupancyMap[h.statusHunian] = (occupancyMap[h.statusHunian] || 0) + 1;
  });

  // Electricity
  const listrikMap: Record<string, number> = {};
  houses.forEach((h) => {
    listrikMap[h.dayaListrik] = (listrikMap[h.dayaListrik] || 0) + 1;
  });

  // Wifi / Internet
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
  const totalRumahWifi = houses.length - (wifiMap['Tanpa Wifi'] || 0);
  const pctRumahWifi = houses.length > 0 ? Math.round((totalRumahWifi / houses.length) * 100) : 0;

  // ==========================================
  // STATISTIK & GRAFIK WARGA PINDAH
  // ==========================================
  const totalBerkasPindah = movedList.length;
  const totalJiwaPindah = movedList.reduce((acc, curr) => acc + (curr.jumlahJiwaPindah || 1), 0);

  // Alasan Pindah Map
  const alasanPindahMap: Record<string, number> = {};
  movedList.forEach((m) => {
    const alasan = m.alasanPindah || 'Lainnya';
    const jiwa = m.jumlahJiwaPindah || 1;
    alasanPindahMap[alasan] = (alasanPindahMap[alasan] || 0) + jiwa;
  });
  const sortedAlasanPindah = Object.entries(alasanPindahMap).sort((a, b) => b[1] - a[1]);

  // Kota Tujuan Map
  const kotaTujuanMap: Record<string, number> = {};
  movedList.forEach((m) => {
    const kota = m.kotaTujuan?.trim() || 'Lainnya / Luar Daerah';
    const jiwa = m.jumlahJiwaPindah || 1;
    kotaTujuanMap[kota] = (kotaTujuanMap[kota] || 0) + jiwa;
  });
  const sortedKotaTujuan = Object.entries(kotaTujuanMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Tipe Pencatatan Pindah (Individual vs KK)
  const pindahKkCount = movedList.filter((m) => m.tipePencatatan === 'kk' || (m.jumlahJiwaPindah && m.jumlahJiwaPindah > 1)).length;
  const pindahIndivCount = movedList.filter((m) => m.tipePencatatan === 'individual' || (!m.tipePencatatan && m.jumlahJiwaPindah === 1)).length;

  // ==========================================
  // STATISTIK & GRAFIK WARGA MENINGGAL
  // ==========================================
  const totalJiwaMeninggal = deceasedList.length;
  const meninggalLaki = deceasedList.filter((d) => d.jenisKelamin === 'L').length;
  const meninggalPerempuan = deceasedList.filter((d) => d.jenisKelamin === 'P').length;

  // Penyebab Kematian Map
  const penyebabMap: Record<string, number> = {};
  deceasedList.forEach((d) => {
    const p = d.penyebabMeninggal || 'Lainnya';
    penyebabMap[p] = (penyebabMap[p] || 0) + 1;
  });
  const sortedPenyebab = Object.entries(penyebabMap).sort((a, b) => b[1] - a[1]);

  // Tempat Meninggal Map
  const tempatMeninggalMap: Record<string, number> = {};
  deceasedList.forEach((d) => {
    const t = d.tempatMeninggal || 'Lainnya';
    tempatMeninggalMap[t] = (tempatMeninggalMap[t] || 0) + 1;
  });

  // Kelompok Usia Meninggal
  let decLansia = 0; // 60+
  let decDewasa = 0; // 18-59
  let decAnak = 0; // <18
  deceasedList.forEach((d) => {
    const age = Number(d.usia) || 0;
    if (age >= 60) decLansia++;
    else if (age >= 18) decDewasa++;
    else decAnak++;
  });

  // Tempat Pemakaman Map
  const makamMap: Record<string, number> = {};
  deceasedList.forEach((d) => {
    const m = d.tempatPemakaman?.trim() || 'TPU / Makam Keluarga';
    makamMap[m] = (makamMap[m] || 0) + 1;
  });
  const sortedMakam = Object.entries(makamMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 space-y-7">
      {/* Top Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-slate-900">
              Statistik Demografi & Dinamika Kependudukan
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analisis data demografi warga aktif, mutasi keluar (pindah), serta data mortalitas (meninggal dunia) Blok D Panorama Regency 3.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            Warga Aktif: <span className="text-blue-700 font-mono">{totalJiwa} Jiwa</span>
          </div>
          <div className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
            Pindah: <span className="font-mono">{totalJiwaPindah} Jiwa</span>
          </div>
          <div className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
            Wafat: <span className="font-mono">{totalJiwaMeninggal} Jiwa</span>
          </div>
        </div>
      </div>

      {/* Ringkasan Rekapitulasi Dinamika Mutasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-4.5 rounded-2xl border border-blue-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Warga Tetap Aktif</span>
            <div className="text-2xl font-black text-blue-950 font-mono">{totalJiwa} <span className="text-xs font-medium text-slate-500">Jiwa</span></div>
            <p className="text-[10px] text-blue-600 font-medium">Tersebar di {houses.length} unit rumah Blok D</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white p-4.5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Warga Pindah Keluar</span>
            <div className="text-2xl font-black text-amber-950 font-mono">{totalJiwaPindah} <span className="text-xs font-medium text-slate-500">Jiwa</span></div>
            <p className="text-[10px] text-amber-700 font-medium">Total {totalBerkasPindah} berkas mutasi keluar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-white p-4.5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Warga Meninggal Dunia</span>
            <div className="text-2xl font-black text-rose-950 font-mono">{totalJiwaMeninggal} <span className="text-xs font-medium text-slate-500">Jiwa</span></div>
            <p className="text-[10px] text-rose-700 font-medium">Surat keterangan kematian terarsip</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
            <HeartCrack className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEKSI 1: GRAFIK & ANALISIS MUTASI WARGA PINDAH & WAFAT */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-amber-500 rounded-full"></div>
          <h3 className="text-base font-extrabold text-slate-900">
            Grafik Mutasi Warga Pindah Keluar ({totalJiwaPindah} Jiwa / {totalBerkasPindah} Berkas)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1.1 Alasan Pindah Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Distribusi Berdasarkan Alasan Pindah
              </h4>
              <span className="text-[11px] text-slate-500 font-medium font-mono">
                {totalJiwaPindah} Jiwa
              </span>
            </div>

            {totalJiwaPindah === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada data warga pindah yang tercatat.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {sortedAlasanPindah.map(([alasan, count], idx) => {
                  const pct = totalJiwaPindah > 0 ? Math.round((count / totalJiwaPindah) * 100) : 0;
                  const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-sky-500', 'bg-slate-400'];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={alasan} className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span className="truncate max-w-[220px] sm:max-w-xs">{alasan}</span>
                        <span className="font-mono text-slate-900">{count} Jiwa ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 1.2 Kota / Daerah Tujuan Terbanyak & Tipe Berkas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Kota / Wilayah Tujuan Terbanyak
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">Top Destinasi</span>
              </div>

              {sortedKotaTujuan.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada data destinasi pindah.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {sortedKotaTujuan.map(([kota, count]) => {
                    const pct = totalJiwaPindah > 0 ? Math.round((count / totalJiwaPindah) * 100) : 0;
                    return (
                      <div key={kota} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{kota}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                            {count} Jiwa
                          </span>
                          <span className="text-[10px] text-slate-400">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick KPI Tipe Berkas Pindah */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-slate-500 text-[10px] block">Pindah Per Kartu Keluarga:</span>
                <strong className="text-amber-900 font-mono text-sm">{pindahKkCount} Berkas KK</strong>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[10px] block">Pindah Individu:</span>
                <strong className="text-slate-900 font-mono text-sm">{pindahIndivCount} Orang</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEKSI 2: GRAFIK & ANALISIS WARGA MENINGGAL DUNIA */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-rose-500 rounded-full"></div>
          <h3 className="text-base font-extrabold text-slate-900">
            Grafik Mortalitas & Warga Meninggal Dunia ({totalJiwaMeninggal} Jiwa)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 2.1 Penyebab Meninggal */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <HeartCrack className="w-4 h-4 text-rose-600" />
              Penyebab Kematian
            </h4>

            {totalJiwaMeninggal === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada data warga wafat.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {sortedPenyebab.map(([penyebab, count], idx) => {
                  const pct = totalJiwaMeninggal > 0 ? Math.round((count / totalJiwaMeninggal) * 100) : 0;
                  const colors = ['bg-rose-500', 'bg-purple-500', 'bg-amber-500', 'bg-slate-500'];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={penyebab} className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{penyebab}</span>
                        <span className="font-mono text-slate-900">{count} Orang ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(6, pct)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2.2 Kelompok Usia Wafat & Gender */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-rose-600" />
                Distribusi Usia saat Wafat
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Lansia (60+ Thn):</span>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {decLansia} Jiwa
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Usia Dewasa (18 - 59 Thn):</span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {decDewasa} Jiwa
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Anak / Remaja (&lt; 18 Thn):</span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                    {decAnak} Jiwa
                  </span>
                </div>
              </div>
            </div>

            {/* Gender Ratio Wafat */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-blue-700 text-[10px] font-bold block">Laki-laki</span>
                <strong className="text-blue-950 font-mono text-sm">{meninggalLaki} Jiwa</strong>
              </div>
              <div className="p-2 bg-pink-50/70 border border-pink-200 rounded-xl">
                <span className="text-pink-700 text-[10px] font-bold block">Perempuan</span>
                <strong className="text-pink-950 font-mono text-sm">{meninggalPerempuan} Jiwa</strong>
              </div>
            </div>
          </div>

          {/* 2.3 Tempat Wafat & Tempat Pemakaman */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-600" />
              Tempat Wafat & TPU Pemakaman
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Lokasi Tempat Wafat:</span>
                <div className="space-y-1.5">
                  {Object.entries(tempatMeninggalMap).map(([lokasi, count]) => (
                    <div key={lokasi} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="font-medium text-slate-700">{lokasi}</span>
                      <span className="font-mono font-bold text-slate-900">{count} Jiwa</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Lokasi TPU / Pemakaman:</span>
                <div className="space-y-1.5">
                  {sortedMakam.map(([m, count]) => (
                    <div key={m} className="flex justify-between items-center bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                      <span className="font-medium text-rose-950 truncate max-w-[170px]">{m}</span>
                      <span className="font-mono font-bold text-rose-900 shrink-0">{count} Jiwa</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEKSI 3: PROFIL DEMOGRAFI UMUM WARGA AKTIF */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="text-base font-extrabold text-slate-900">
            Profil Demografi Warga Aktif ({totalJiwa} Jiwa / {houses.length} Rumah)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3.1 Age Distribution Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Distribusi Kelompok Usia Warga Aktif
            </h4>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Balita (0 - 5 Thn)', count: ageBalita, color: 'bg-pink-500' },
                { label: 'Anak-Anak (6 - 12 Thn)', count: ageAnak, color: 'bg-amber-500' },
                { label: 'Remaja / Pelajar (13 - 17 Thn)', count: ageRemaja, color: 'bg-blue-500' },
                { label: 'Usia Produktif (18 - 59 Thn)', count: ageProduktif, color: 'bg-emerald-500' },
                { label: 'Lansia (60+ Thn)', count: ageLansia, color: 'bg-purple-500' }
              ].map((item) => {
                const pct = totalJiwa > 0 ? Math.round((item.count / totalJiwa) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono">{item.count} Jiwa ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.2 Gender Ratio */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              Proporsi Jenis Kelamin Warga Aktif
            </h4>

            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center space-y-1">
                <span className="text-2xl">👦</span>
                <div className="text-xs font-semibold text-blue-900">Laki-laki</div>
                <div className="text-2xl font-black text-blue-950 font-mono">{totalLaki}</div>
                <div className="text-xs font-bold text-blue-700">{pctLaki}%</div>
              </div>

              <div className="bg-pink-50 p-4 rounded-xl border border-pink-200 text-center space-y-1">
                <span className="text-2xl">👧</span>
                <div className="text-xs font-semibold text-pink-900">Perempuan</div>
                <div className="text-2xl font-black text-pink-950 font-mono">{totalPerempuan}</div>
                <div className="text-xs font-bold text-pink-700">{pctPerempuan}%</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Sex Ratio: <strong>{totalPerempuan > 0 ? (totalLaki / totalPerempuan).toFixed(2) : '1.00'}</strong> (Rasio perbandingan jumlah laki-laki terhadap 1 perempuan).
            </div>
          </div>

          {/* 3.3 Top Professions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Profesi & Mata Pencaharian Terbanyak
            </h4>

            <div className="space-y-2.5 text-xs">
              {sortedJobs.map(([job, count]) => {
                const pct = totalJiwa > 0 ? Math.round((count / totalJiwa) * 100) : 0;
                return (
                  <div key={job} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-800">{job}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                        {count} Orang
                      </span>
                      <span className="text-[10px] text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.4 BPJS Healthcare Coverage */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Kepesertaan BPJS Kesehatan Warga
            </h4>

            <div className="space-y-2.5 text-xs">
              {Object.entries(bpjsMap).map(([status, count]) => {
                const pct = totalJiwa > 0 ? Math.round((count / totalJiwa) * 100) : 0;
                return (
                  <div key={status} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{status}</span>
                      <span className="font-mono text-blue-700 font-bold">{count} Jiwa ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.7 Tingkat Pendidikan Warga Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Tingkat Pendidikan Terakhir ({totalJiwa} Jiwa)
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                {sortedPendidikan.length} Jenjang
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {sortedPendidikan.map(([jenjang, count], idx) => {
                const pct = totalJiwa > 0 ? Math.round((count / totalJiwa) * 100) : 0;
                const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-sky-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-400'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={jenjang} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{jenjang}</span>
                      <span className="font-mono text-indigo-700 font-bold">{count} Jiwa ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.8 Distribusi Golongan Darah Warga */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  Distribusi Golongan Darah ({totalJiwa} Jiwa)
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  Data Medis
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {['A', 'B', 'AB', 'O'].map((goldar) => {
                  const count = golDarahMap[goldar] || 0;
                  const pct = totalJiwa > 0 ? Math.round((count / totalJiwa) * 100) : 0;
                  return (
                    <div key={goldar} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
                      <div className="text-xs font-bold text-rose-950">Golongan Darah {goldar}</div>
                      <div className="text-2xl font-black font-mono text-rose-700 my-0.5">{count}</div>
                      <div className="text-[11px] font-semibold text-rose-600">{pct}% Jiwa</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-600 mt-3">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>Belum Diketahui / Belum Cek:</span>
              </span>
              <span className="font-bold font-mono text-slate-900">
                {golDarahMap['Belum Tahu / -'] || 0} Jiwa ({totalJiwa > 0 ? Math.round(((golDarahMap['Belum Tahu / -'] || 0) / totalJiwa) * 100) : 0}%)
              </span>
            </div>
          </div>

          {/* 3.5 Status Hunian & Kepemilikan Rumah */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-amber-600" />
              Status Hunian Rumah Blok D ({houses.length} Unit)
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(occupancyMap).map(([status, count]) => (
                <div key={status} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] uppercase font-bold text-slate-500">{status}</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">{count} Unit</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.6 Listrik & Sumber Air */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Sarana Listrik & Sumber Air Bersih
            </h4>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Daya Listrik PLN Terpasang:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(listrikMap).map(([daya, count]) => (
                  <div key={daya} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                    <div className="font-bold text-amber-950">{daya}</div>
                    <div className="text-xs font-semibold text-amber-800">{count} Rumah</div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  Mayoritas Sumber Air:
                </span>
                <span className="font-bold text-slate-900">Sumur Bor / Jetpump Mandiri</span>
              </div>
            </div>
          </div>

          {/* 3.9 Layanan Wifi & Internet Rumah */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2 lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-blue-600" />
                  Distribusi Layanan Wifi & Internet Rumah ({houses.length} Rumah)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Statistik penetrasi dan pangsa pasar provider internet di Blok D Panorama Regency 3
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200">
                  {totalRumahWifi} Rumah Berlangganan Wifi ({pctRumahWifi}%)
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200">
                  {wifiMap['Tanpa Wifi'] || 0} Rumah Tanpa Wifi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {wifiList.map((provider) => {
                const count = wifiMap[provider] || 0;
                const pct = houses.length > 0 ? Math.round((count / houses.length) * 100) : 0;
                const isNoWifi = provider === 'Tanpa Wifi';
                return (
                  <div
                    key={provider}
                    className={`p-3 rounded-xl border transition-all ${
                      isNoWifi
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-blue-50/40 border-blue-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${isNoWifi ? 'text-slate-600' : 'text-blue-950'}`}>
                        {provider}
                      </span>
                      {!isNoWifi && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className={`text-2xl font-black font-mono ${isNoWifi ? 'text-slate-700' : 'text-blue-700'}`}>
                        {count}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`${isNoWifi ? 'bg-slate-400' : 'bg-blue-600'} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
