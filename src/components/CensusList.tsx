import React, { useState } from 'react';
import { HouseUnit, Resident } from '../types/census';
import { calculateAge, generateWhatsAppMessage, formatDateIndo, formatDateTimeIndo, formatRelativeTimeIndo, getCitizenRegistrationNumber } from '../utils/censusHelpers';
import { Home, Users, Search, Phone, Edit2, Trash2, CreditCard, MessageSquare, Shield, Check, Copy, FileText, ChevronDown, ChevronUp, UserCheck, AlertCircle, AlertTriangle, X, Clock, MapPin, Wifi } from 'lucide-react';

interface CensusListProps {
  houses: HouseUnit[];
  searchQuery: string;
  onEditHouse: (house: HouseUnit) => void;
  onDeleteHouse: (houseId: string) => void;
  onViewCitizenCard: (house: HouseUnit) => void;
}

export const CensusList: React.FC<CensusListProps> = ({
  houses,
  searchQuery,
  onEditHouse,
  onDeleteHouse,
  onViewCitizenCard
}) => {
  const [viewMode, setViewMode] = useState<'house' | 'individual'>('house');
  const [filterBlok, setFilterBlok] = useState<string>('all');
  const [filterHunian, setFilterHunian] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterKtp, setFilterKtp] = useState<string>('all');
  const [expandedHouseIds, setExpandedHouseIds] = useState<Record<string, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [houseToDelete, setHouseToDelete] = useState<HouseUnit | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedHouseIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(`${label}: ${text}`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleConfirmDelete = () => {
    if (houseToDelete) {
      const nomor = houseToDelete.nomorRumah;
      onDeleteHouse(houseToDelete.id);
      setHouseToDelete(null);
      setSuccessToast(`Data rumah ${nomor} berhasil dihapus dari sistem.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Filter Houses (Direktori Data Warga hanya menampilkan rumah yang memiliki jiwa > 0)
  const filteredHouses = houses.filter((house) => {
    // Hapus / sembunyikan rumah dari direktori jika terdapat 0 jiwa
    if (!house.residents || house.residents.length === 0) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();

    // Match search query
    const matchHouseNo = house.nomorRumah.toLowerCase().includes(q);
    const matchKK = house.nomorKK.toLowerCase().includes(q);
    const matchKKName = house.kepalaKeluargaNama.toLowerCase().includes(q);
    const matchPetugas = house.petugasSensus.toLowerCase().includes(q);
    const matchCatatan = house.catatanRumah.toLowerCase().includes(q);

    const matchResidents = house.residents.some((r) =>
      r.nama.toLowerCase().includes(q) ||
      r.nik.toLowerCase().includes(q) ||
      r.pekerjaan.toLowerCase().includes(q) ||
      r.noHp.toLowerCase().includes(q) ||
      (r.tempatLahir && r.tempatLahir.toLowerCase().includes(q))
    );

    const matchVehicles = house.vehicles.some((v) =>
      v.platNomor.toLowerCase().includes(q) ||
      v.merkModel.toLowerCase().includes(q)
    );

    const matchesSearch = !q || matchHouseNo || matchKK || matchKKName || matchResidents || matchVehicles || matchPetugas || matchCatatan;

    // Filter Blok
    const matchesBlok =
      filterBlok === 'all' ||
      house.nomorRumah.toLowerCase().includes(`blok ${filterBlok.toLowerCase()}`) ||
      house.nomorRumah.toLowerCase().includes(filterBlok.toLowerCase()) ||
      house.id.toUpperCase().startsWith(filterBlok.toUpperCase());

    // Filter Hunian
    const matchesHunian = filterHunian === 'all' || house.statusHunian === filterHunian;

    // Filter Special Category
    const matchesCategory =
      filterCategory === 'all' ||
      house.residents.some((r) => r.kategoriKhusus && r.kategoriKhusus.includes(filterCategory as any));

    // Filter KTP
    const matchesKtp =
      filterKtp === 'all' ||
      house.residents.some((r) => (filterKtp === 'blokd' ? r.statusKtp.includes('Blok D') : r.statusKtp.includes('Luar')));

    return matchesSearch && matchesBlok && matchesHunian && matchesCategory && matchesKtp;
  });

  // Extract all individuals
  const individualList: { resident: Resident; house: HouseUnit }[] = [];
  filteredHouses.forEach((h) => {
    h.residents.forEach((r) => {
      individualList.push({ resident: r, house: h });
    });
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Toast Copy Notice */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Berhasil disalin: <strong>{copiedText}</strong></span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Direktori Data Warga Blok D
            </h2>
            <p className="text-xs text-slate-500">
              Total <strong className="text-blue-700">{filteredHouses.length}</strong> Rumah / KK dan <strong className="text-blue-700">{individualList.length}</strong> Jiwa Warga terdaftar.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('house')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'house'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Per Rumah / KK</span>
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Per Individu (Jiwa)</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Blok Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blok Rumah:</label>
            <select
              value={filterBlok}
              onChange={(e) => setFilterBlok(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="all">Semua Blok (110 Unit Acuan)</option>
              <option value="D1">Blok D1 (45 Unit)</option>
              <option value="D2">Blok D2 (50 Unit • 1-48, 12A, 12B)</option>
              <option value="D3">Blok D3 (9 Unit)</option>
              <option value="D4">Blok D4 (6 Unit)</option>
            </select>
          </div>

          {/* Status Hunian */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Hunian:</label>
            <select
              value={filterHunian}
              onChange={(e) => setFilterHunian(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="all">Semua Status Hunian</option>
              <option value="tetap">Dihuni Tetap (Pemilik)</option>
              <option value="kontrak">Sewa / Kontrak</option>
              <option value="usaha">Tempat Usaha</option>
              <option value="renovasi">Renovasi</option>
              <option value="kosong">Kosong / Belum Dihuni</option>
            </select>
          </div>

          {/* Kategori Khusus */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kategori Khusus / Posyandu:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="Balita">Balita (0 - 5 Thn)</option>
              <option value="Lansia">Lansia (60+ Thn)</option>
              <option value="Ibu Hamil">Ibu Hamil</option>
              <option value="Pelajar">Pelajar / Siswa</option>
              <option value="Disabilitas">Disabilitas</option>
            </select>
          </div>

          {/* Domisili KTP */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status Domisili KTP:</label>
            <select
              value={filterKtp}
              onChange={(e) => setFilterKtp(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="all">Semua Status KTP</option>
              <option value="blokd">KTP Sesuai Alamat Blok D</option>
              <option value="luar">KTP Luar (Domisili Sementara)</option>
            </select>
          </div>
        </div>
      </div>

      {/* List Output */}
      {viewMode === 'house' ? (
        <div className="space-y-3.5">
          {filteredHouses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Tidak ada data rumah yang cocok dengan filter / pencarian.</p>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau reset filter.</p>
            </div>
          ) : (
            filteredHouses.map((house) => {
              const isExpanded = expandedHouseIds[house.id] ?? false;
              const kepalaKeluarga = house.residents.find((r) => r.hubunganKeluarga === 'Kepala Keluarga');

              return (
                <div
                  key={house.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all overflow-hidden"
                >
                  {/* House Item Header */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {house.nomorRumah.replace(/Blok\s*D/i, 'D').replace('No. ', '').trim()}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {house.nomorRumah}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              house.statusHunian === 'tetap'
                                ? 'bg-emerald-100 text-emerald-800'
                                : house.statusHunian === 'kontrak'
                                ? 'bg-amber-100 text-amber-800'
                                : house.statusHunian === 'usaha'
                                ? 'bg-blue-100 text-blue-800'
                                : house.statusHunian === 'renovasi'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {house.statusHunian.toUpperCase()}
                          </span>
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                            {house.kepemilikan}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                          <span>
                            KK: <strong className="text-slate-800">{house.kepalaKeluargaNama || 'Kosong'}</strong>
                          </span>
                          {house.nomorKK && house.nomorKK !== '-' && (
                            <button
                              onClick={() => handleCopy(house.nomorKK, 'No. KK')}
                              className="font-mono text-slate-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                              title="Salin No. KK"
                            >
                              <Copy className="w-3 h-3" />
                              <span>No. KK: {house.nomorKK}</span>
                            </button>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-700 font-semibold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            {house.residents.length} Jiwa
                          </span>
                        </div>

                        {/* Last Updated / Censused Detail */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/80">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Terakhir Diubah/Data: <strong className="text-slate-800">{formatDateTimeIndo(house.updatedAt || house.tanggalSensus)}</strong></span>
                          </span>
                          {house.updatedAt && (
                            <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              {formatRelativeTimeIndo(house.updatedAt)}
                            </span>
                          )}
                          <span className="text-slate-400">Petugas: <strong className="text-slate-700">{house.petugasSensus || '-'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => onViewCitizenCard(house)}
                        className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        title="Lihat Bukti Data & Kartu Warga Digital"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <a
                        href={`https://wa.me/?text=${generateWhatsAppMessage(house)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Bagikan Ringkasan ke WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onEditHouse(house)}
                        className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                        title="Edit Data Rumah"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setHouseToDelete(house)}
                        className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Hapus Data Rumah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(house.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer ml-1"
                      >
                        <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Family Members & Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      {/* Family Members Grid */}
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Daftar Anggota Keluarga ({house.residents.length} Jiwa)</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            Petugas Data: {house.petugasSensus || '-'} (Tgl: {house.tanggalSensus || '-'})
                          </span>
                        </h4>

                        {house.residents.length === 0 ? (
                          <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-slate-200">
                            Rumah ini belum berpenghuni atau belum ada data anggota keluarga yang diinput.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {house.residents.map((r, i) => (
                              <div
                                key={r.id || i}
                                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                      <span>{r.nama}</span>
                                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                        {r.hubunganKeluarga}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleCopy(r.nik, 'NIK')}
                                      className="font-mono text-[11px] text-slate-500 hover:text-blue-700 flex items-center gap-1 mt-0.5 cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>NIK: {r.nik || '-'}</span>
                                    </button>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    r.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                  }`}>
                                    {r.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 text-[11px] pt-1 border-t border-slate-100">
                                  <div>
                                    <span className="text-slate-400">TTL / Usia: </span>
                                    <span className="font-medium text-slate-800">{r.tempatLahir}, {r.tanggalLahir} ({calculateAge(r.tanggalLahir)} Thn)</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Agama: </span>
                                    <span className="font-medium text-slate-800">{r.agama}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Pekerjaan: </span>
                                    <span className="font-medium text-slate-800">{r.pekerjaan || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Pendidikan: </span>
                                    <span className="font-medium text-slate-800">{r.pendidikan || '-'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">BPJS: </span>
                                    <span className="font-medium text-slate-800">{r.statusBpjs}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Status Domisili: </span>
                                    <span className="font-medium text-slate-800">{r.statusKtp}</span>
                                  </div>
                                  {r.statusKtp?.includes('Luar') && r.alamatKtpLuar && (
                                    <div className="col-span-2 pt-1 border-t border-slate-100 flex items-start gap-1 text-[11px] text-amber-900 bg-amber-50/70 p-1.5 rounded-lg">
                                      <MapPin className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                      <span><strong className="font-semibold">Alamat Sesuai KTP:</strong> {r.alamatKtpLuar}</span>
                                    </div>
                                  )}
                                </div>

                                {r.noHp && r.noHp !== '-' && (
                                  <div className="pt-1 flex items-center justify-between text-[11px]">
                                    <span className="font-mono text-slate-700 flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-emerald-600" />
                                      {r.noHp}
                                    </span>
                                    <a
                                      href={`https://wa.me/${r.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-700 hover:underline font-semibold"
                                    >
                                      Chat WhatsApp →
                                    </a>
                                  </div>
                                )}

                                {r.kategoriKhusus && r.kategoriKhusus.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {r.kategoriKhusus.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full"
                                      >
                                        ⭐ {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Vehicles & House Spec Quick row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-700 block mb-1.5">Data Kendaraan Terdaftar:</span>
                          {house.vehicles.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">Tidak ada data kendaraan</span>
                          ) : (
                            <div className="space-y-1">
                              {house.vehicles.map((v, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px]">
                                  <span>{v.jenis} {v.merkModel} ({v.warna})</span>
                                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    {v.platNomor}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-700 block mb-1.5">Info Sarana & Keamanan:</span>
                          <div className="space-y-1 text-[11px] text-slate-600">
                            <div>No. Registrasi: <button onClick={() => handleCopy(getCitizenRegistrationNumber(house), 'No. Registrasi')} className="font-mono font-bold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer" title="Klik untuk salin no registrasi"><span>{getCitizenRegistrationNumber(house)}</span><Copy className="w-2.5 h-2.5" /></button></div>
                            <div>Listrik: <strong className="text-slate-800">{house.dayaListrik}</strong> | Air: <strong className="text-slate-800">{house.sumberAir}</strong> | Wifi: <strong className="text-blue-700">{house.wifi || 'Tanpa Wifi'}</strong></div>
                            {house.tanggalPindahMasuk && (
                              <div>Pindah Masuk: <strong className="text-slate-800">{formatDateIndo(house.tanggalPindahMasuk)}</strong></div>
                            )}
                            <div>Wilayah: <strong className="text-slate-800">RT {house.rt || '005'} / RW {house.rw || '005'}</strong></div>
                            <div>Kontak Darurat: <strong className="text-slate-800">{house.kontakDarurat?.nama || '-'}</strong> ({house.kontakDarurat?.noHp || '-'})</div>
                            {house.catatanRumah && <div className="text-amber-800 italic">Catatan: {house.catatanRumah}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Individual / All Citizen View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Nama & NIK</th>
                  <th className="p-3.5">Nomor Rumah</th>
                  <th className="p-3.5">Hub. Keluarga</th>
                  <th className="p-3.5">L/P & Usia</th>
                  <th className="p-3.5">Pendidikan</th>
                  <th className="p-3.5">Pekerjaan</th>
                  <th className="p-3.5">No. HP / WA</th>
                  <th className="p-3.5">BPJS & Domisili</th>
                  <th className="p-3.5">Terakhir Diubah</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {individualList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      Tidak ada data warga yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  individualList.map(({ resident: r, house: h }) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{r.nama}</div>
                        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                          <span>NIK: {r.nik || '-'}</span>
                        </div>
                        {r.kategoriKhusus && r.kategoriKhusus.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {r.kategoriKhusus.map((k) => (
                              <span key={k} className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                                {k}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-semibold text-blue-700">
                        {h.nomorRumah}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px] border border-slate-200">
                          {r.hubunganKeluarga}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${r.jenisKelamin === 'L' ? 'text-blue-700' : 'text-pink-700'}`}>
                          {r.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                        <div className="text-slate-500 text-[10px]">{calculateAge(r.tanggalLahir)} Tahun</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {r.pendidikan || '-'}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        {r.pekerjaan || '-'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {r.noHp && r.noHp !== '-' ? (
                          <a
                            href={`https://wa.me/${r.noHp.replace(/\D/g, '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {r.noHp}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3.5 text-[11px]">
                        <div>{r.statusBpjs}</div>
                        <div className="text-slate-500 text-[10px]">{r.statusKtp}</div>
                        {r.statusKtp?.includes('Luar') && r.alamatKtpLuar && (
                          <div className="text-[10px] text-amber-800 font-medium truncate max-w-[180px]" title={`Alamat KTP: ${r.alamatKtpLuar}`}>
                            📍 {r.alamatKtpLuar}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px]">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{formatDateTimeIndo(r.updatedAt || h.updatedAt || h.tanggalSensus)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Petugas: <span className="text-slate-600 font-medium">{h.petugasSensus || '-'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditHouse(h)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] transition-all cursor-pointer border border-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setHouseToDelete(h)}
                            className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus Data Rumah Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Hapus Data */}
      {houseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/80 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Hapus Data Warga?</h3>
                  <p className="text-xs text-rose-400 font-medium">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHouseToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor Rumah:</span>
                <strong className="text-blue-400 text-sm font-mono">{houseToDelete.nomorRumah}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kepala Keluarga:</span>
                <strong className="text-white">{houseToDelete.kepalaKeluargaNama}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jumlah Anggota Keluarga:</span>
                <span className="text-slate-200">{houseToDelete.residents.length} Jiwa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Hunian:</span>
                <span className="capitalize text-slate-300">{houseToDelete.statusHunian}</span>
              </div>
              {houseToDelete.nomorKK && houseToDelete.nomorKK !== '-' && (
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Kartu Keluarga:</span>
                  <span className="font-mono text-slate-300">{houseToDelete.nomorKK}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh data kependudukan, NIK warga, data kendaraan, dan riwayat data untuk unit rumah <strong className="text-white">{houseToDelete.nomorRumah}</strong> akan dihapus secara permanen dari database lokal.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setHouseToDelete(null)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Sukses Hapus */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-700 text-xs animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
};
