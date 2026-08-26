import React, { useState } from 'react';
import { DeceasedCitizen, HouseUnit, AuthUser, Gender, Resident, CoverLetter, MovedCitizen } from '../types/census';
import { getAllResidents, formatDateDDMMYYYY, formatDateNamedMonth, formatDateTimeIndo, formatRelativeTimeIndo } from '../utils/censusHelpers';
import { calculateNextLetterSequence, formatLetterNumber } from '../utils/letterNumberUtils';
import { LogoBlokD } from './LogoBlokD';
import {
  HeartCrack,
  Search,
  Plus,
  Edit2,
  Trash2,
  Printer,
  MessageSquare,
  Building,
  MapPin,
  Calendar,
  Phone,
  FileText,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  Copy,
  Clock,
  HeartHandshake,
  Lock
} from 'lucide-react';

interface DeceasedCitizensViewProps {
  deceasedList: DeceasedCitizen[];
  coverLetters?: CoverLetter[];
  movedList?: MovedCitizen[];
  houses: HouseUnit[];
  currentUser: AuthUser | null;
  onAddDeceased: (data: DeceasedCitizen, removeResidentOption?: { houseId: string; residentId?: string; residentIds?: string[] }) => void;
  onUpdateDeceased: (data: DeceasedCitizen) => void;
  onDeleteDeceased: (id: string) => void;
}

export const DeceasedCitizensView: React.FC<DeceasedCitizensViewProps> = ({
  deceasedList,
  coverLetters = [],
  movedList = [],
  houses,
  currentUser,
  onAddDeceased,
  onUpdateDeceased,
  onDeleteDeceased
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPenyebab, setFilterPenyebab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'individual' | 'kk'>('individual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeceasedCitizen | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DeceasedCitizen | null>(null);
  const [letterPrintItem, setLetterPrintItem] = useState<DeceasedCitizen | null>(null);
  const [whatsappShareItem, setWhatsappShareItem] = useState<DeceasedCitizen | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [tipePencatatan, setTipePencatatan] = useState<'individual' | 'kk'>('individual');
  const [selectedSourceType, setSelectedSourceType] = useState<'existing' | 'manual'>('existing');
  const [selectedExistingResidentKey, setSelectedExistingResidentKey] = useState<string>('');
  const [autoRemoveFromActive, setAutoRemoveFromActive] = useState<boolean>(true);

  const [tanggalMeninggal, setTanggalMeninggal] = useState(new Date().toISOString().slice(0, 10));
  const [jamMeninggal, setJamMeninggal] = useState('10:00');
  const [nomorRumah, setNomorRumah] = useState('');
  const [nomorKK, setNomorKK] = useState('');
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('L');
  const [usia, setUsia] = useState<number | ''>('');
  const [hubunganKeluarga, setHubunganKeluarga] = useState('Kepala Keluarga');
  const [tempatMeninggal, setTempatMeninggal] = useState<DeceasedCitizen['tempatMeninggal']>('Rumah Duka / Kediaman');
  const [namaTempatMeninggal, setNamaTempatMeninggal] = useState('');
  const [penyebabMeninggal, setPenyebabMeninggal] = useState<DeceasedCitizen['penyebabMeninggal']>('Sakit Medis');
  const [tempatPemakaman, setTempatPemakaman] = useState('');
  const [tanggalPemakaman, setTanggalPemakaman] = useState(new Date().toISOString().slice(0, 10));
  const [namaPelapor, setNamaPelapor] = useState('');
  const [hubunganPelapor, setHubunganPelapor] = useState('Keluarga Kandung');
  const [noHpPelapor, setNoHpPelapor] = useState('');
  const [nomorSuratKematian, setNomorSuratKematian] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [petugasPencatat, setPetugasPencatat] = useState(
    currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : 'Wily Gunawan (Sekertaris Blok D)'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`${label} disalin ke clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getAutoLetterNumber = (dateStr: string) => {
    const targetYear = dateStr ? new Date(dateStr).getFullYear() || new Date().getFullYear() : new Date().getFullYear();
    const seqInfo = calculateNextLetterSequence({
      coverLetters,
      movedList,
      deceasedList,
      type: 'SKK',
      year: targetYear
    });
    return formatLetterNumber({
      sequence: seqInfo.nextSequence,
      type: 'SKK',
      unit: 'D',
      date: dateStr
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTipePencatatan('individual');
    setSelectedSourceType('existing');
    setSelectedExistingResidentKey('');
    setAutoRemoveFromActive(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    setTanggalMeninggal(todayStr);
    setJamMeninggal('10:00');
    setNomorRumah('');
    setNomorKK('');
    setNama('');
    setNik('');
    setJenisKelamin('L');
    setUsia('');
    setHubunganKeluarga('Kepala Keluarga');
    setTempatMeninggal('Rumah Duka / Kediaman');
    setNamaTempatMeninggal('');
    setPenyebabMeninggal('Sakit Medis');
    setTempatPemakaman('');
    setTanggalPemakaman(todayStr);
    setNamaPelapor('');
    setHubunganPelapor('Keluarga Kandung');
    setNoHpPelapor('');
    setNomorSuratKematian(getAutoLetterNumber(todayStr));
    setKeterangan('');
    setPetugasPencatat(currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : 'Wily Gunawan (Sekertaris Blok D)');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DeceasedCitizen) => {
    setEditingItem(item);
    setTipePencatatan(item.tipePencatatan || 'individual');
    setSelectedSourceType('manual');
    setTanggalMeninggal(item.tanggalMeninggal);
    setJamMeninggal(item.jamMeninggal || '10:00');
    setNomorRumah(item.nomorRumah);
    setNomorKK(item.nomorKK || '');
    setNama(item.nama);
    setNik(item.nik);
    setJenisKelamin(item.jenisKelamin);
    setUsia(item.usia || '');
    setHubunganKeluarga(item.hubunganKeluarga || 'Kepala Keluarga');
    setTempatMeninggal(item.tempatMeninggal);
    setNamaTempatMeninggal(item.namaTempatMeninggal || '');
    setPenyebabMeninggal(item.penyebabMeninggal);
    setTempatPemakaman(item.tempatPemakaman);
    setTanggalPemakaman(item.tanggalPemakaman || item.tanggalMeninggal);
    setNamaPelapor(item.namaPelapor);
    setHubunganPelapor(item.hubunganPelapor);
    setNoHpPelapor(item.noHpPelapor || '');
    setNomorSuratKematian(item.nomorSuratKematian || '');
    setKeterangan(item.keterangan || '');
    setPetugasPencatat(item.petugasPencatat || (currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : ''));
    setIsModalOpen(true);
  };

  const handleSelectExistingResident = (compositeKey: string) => {
    setSelectedExistingResidentKey(compositeKey);
    if (!compositeKey) return;

    const [houseId, residentId] = compositeKey.split(':::');
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;
    const targetResident = targetHouse.residents.find((r) => r.id === residentId);
    if (!targetResident) return;

    setNomorRumah(targetHouse.nomorRumah);
    setNomorKK(targetHouse.nomorKK || '');
    setNama(targetResident.nama);
    setNik(targetResident.nik);
    setJenisKelamin(targetResident.jenisKelamin);
    setHubunganKeluarga(targetResident.hubunganKeluarga);

    // Calculate approximate age from birth date if available
    if (targetResident.tanggalLahir) {
      const birthYear = new Date(targetResident.tanggalLahir).getFullYear();
      const currYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear > 1900) {
        setUsia(currYear - birthYear);
      }
    }

    // Default pelapor from family
    const otherResident = targetHouse.residents.find((r) => r.id !== targetResident.id);
    if (otherResident) {
      setNamaPelapor(otherResident.nama);
      setHubunganPelapor(otherResident.hubunganKeluarga);
      setNoHpPelapor(otherResident.noHp !== '-' ? otherResident.noHp : '');
    } else {
      setNamaPelapor(targetHouse.kontakDarurat?.nama || '');
      setHubunganPelapor(targetHouse.kontakDarurat?.hubungan || 'Keluarga');
      setNoHpPelapor(targetHouse.kontakDarurat?.noHp || '');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nomorRumah.trim() || !tempatPemakaman.trim() || !namaPelapor.trim()) {
      alert('Mohon lengkapi seluruh field wajib (*): Nama, Nomor Rumah, Tempat Pemakaman, dan Nama Pelapor!');
      return;
    }

    const nowISO = new Date().toISOString();
    const payload: DeceasedCitizen = {
      id: editingItem ? editingItem.id : `dec-${Date.now()}`,
      tanggalMeninggal,
      jamMeninggal,
      nomorRumah,
      nomorKK: nomorKK.trim() || '-',
      tipePencatatan,
      nama: nama.trim(),
      nik: nik.trim() || '-',
      jenisKelamin,
      usia: Number(usia) || 0,
      hubunganKeluarga,
      tempatMeninggal,
      namaTempatMeninggal: namaTempatMeninggal.trim() || (tempatMeninggal === 'Rumah Duka / Kediaman' ? `Kediaman ${nomorRumah}` : 'Rumah Sakit'),
      penyebabMeninggal,
      tempatPemakaman: tempatPemakaman.trim(),
      tanggalPemakaman,
      namaPelapor: namaPelapor.trim(),
      hubunganPelapor: hubunganPelapor.trim(),
      noHpPelapor: noHpPelapor.trim() || '-',
      nomorSuratKematian: nomorSuratKematian.trim() || `474.3/${Math.floor(100 + Math.random() * 900)}/RT05-RW05/${new Date().getFullYear()}`,
      keterangan: keterangan.trim(),
      petugasPencatat,
      updatedAt: nowISO,
      createdAt: editingItem?.createdAt || nowISO
    };

    if (editingItem) {
      onUpdateDeceased(payload);
      showToast(`Data kematian atas nama ${payload.nama} berhasil diperbarui.`);
    } else {
      let removalInfo: { houseId: string; residentId?: string; residentIds?: string[] } | undefined;
      if (selectedSourceType === 'existing' && selectedExistingResidentKey && autoRemoveFromActive) {
        const [houseId, residentId] = selectedExistingResidentKey.split(':::');
        removalInfo = { houseId, residentId };
      }
      onAddDeceased(payload, removalInfo);
      showToast(`Catatan kematian atas nama ${payload.nama} berhasil dicatat.`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteDeceased(itemToDelete.id);
      showToast(`Catatan kematian ${itemToDelete.nama} berhasil dihapus.`);
      setItemToDelete(null);
    }
  };

  const filteredList = deceasedList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.nik.toLowerCase().includes(q) ||
      (item.nomorKK && item.nomorKK.toLowerCase().includes(q)) ||
      item.nomorRumah.toLowerCase().includes(q) ||
      item.tempatPemakaman.toLowerCase().includes(q) ||
      item.namaPelapor.toLowerCase().includes(q);

    const matchPenyebab = filterPenyebab === 'all' || item.penyebabMeninggal === filterPenyebab;
    return matchSearch && matchPenyebab;
  });

  // Grouped by KK
  const groupedByKK = React.useMemo(() => {
    const map = new Map<string, {
      kkKey: string;
      nomorKK: string;
      nomorRumah: string;
      records: DeceasedCitizen[];
    }>();

    filteredList.forEach((item) => {
      const key = (item.nomorKK && item.nomorKK !== '-' && item.nomorKK !== '')
        ? `KK:${item.nomorKK}`
        : `RUMAH:${item.nomorRumah}`;

      if (!map.has(key)) {
        map.set(key, {
          kkKey: key,
          nomorKK: item.nomorKK && item.nomorKK !== '-' ? item.nomorKK : '-',
          nomorRumah: item.nomorRumah,
          records: [item]
        });
      } else {
        map.get(key)!.records.push(item);
      }
    });

    return Array.from(map.values());
  }, [filteredList]);

  const generateWhatsAppBroadcast = (item: DeceasedCitizen) => {
    const greeting = 'Inna lillahi wa inna ilaihi raji\'un / Turut Berduka Cita Sedalam-dalamnya';
    return encodeURIComponent(
      `🕊️ *BERITA DUKA CITA - WARGA BLOK D*\n` +
      `🏘️ *Panorama Regency 3 Situ Sari*\n` +
      `📍 _Wilayah Administrasi Rt.005 Dan Rw.005_\n\n` +
      `${greeting}\n\n` +
      `Telah berpulang ke Rahmatullah, tetangga/warga kita:\n` +
      `👤 *Nama:* *${item.nama}*\n` +
      `🎂 *Usia:* ${item.usia ? `${item.usia} Tahun` : '-'}\n` +
      `🏠 *Alamat Duka:* ${item.nomorRumah}, Panorama Regency 3 Blok D\n` +
      `📋 *No. KK:* ${item.nomorKK || '-'}\n` +
      `📅 *Waktu Meninggal:* ${item.tanggalMeninggal ? formatDateDDMMYYYY(item.tanggalMeninggal) : '-'} (Pukul ${item.jamMeninggal || '10:00'} WIB)\n` +
      `🏥 *Tempat:* ${item.namaTempatMeninggal || item.tempatMeninggal}\n` +
      `📍 *Rencana Pemakaman:* ${item.tempatPemakaman}\n` +
      `🗓️ *Hari/Tgl Pemakaman:* ${item.tanggalPemakaman ? formatDateDDMMYYYY(item.tanggalPemakaman) : (item.tanggalMeninggal ? formatDateDDMMYYYY(item.tanggalMeninggal) : '-')}\n\n` +
      `Semoga almarhum/almarhumah diampuni segala dosa dan kekhilafannya, diterima amal ibadahnya di sisi Allah SWT, serta keluarga yang ditinggalkan diberikan ketabahan dan keikhlasan. Aamiin YRA.\n\n` +
      `_Pengurus Paguyuban Blok D • Panorama Regency 3_`
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Screen Management View (Hidden during print) */}
      <div className="space-y-6 print:hidden">
        {/* Header Banner & Stats */}
        <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center">
                <HeartCrack className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Buku Catatan Warga Meninggal Dunia
                </h2>
                <p className="text-xs sm:text-sm text-rose-200/80">
                  Data kependudukan warga Blok D yang telah wafat, penerbitan surat pengantar kematian RT/RW, & siaran duka cita.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Warga Meninggal</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-rose-900/50">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-800/40">
            <div className="text-[11px] text-rose-300 font-medium">Total Catatan Kematian</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{deceasedList.length} <span className="text-xs font-normal text-rose-200">Jiwa</span></div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-800/40">
            <div className="text-[11px] text-rose-300 font-medium">Sakit Medis</div>
            <div className="text-xl sm:text-2xl font-black text-rose-300 mt-0.5">
              {deceasedList.filter((d) => d.penyebabMeninggal === 'Sakit Medis').length}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-800/40">
            <div className="text-[11px] text-rose-300 font-medium">Usia Lanjut</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              {deceasedList.filter((d) => d.penyebabMeninggal === 'Usia Lanjut').length}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-800/40">
            <div className="text-[11px] text-rose-300 font-medium">Kecelakaan / Lainnya</div>
            <div className="text-xl sm:text-2xl font-black text-blue-300 mt-0.5">
              {deceasedList.filter((d) => d.penyebabMeninggal === 'Kecelakaan' || d.penyebabMeninggal === 'Lainnya').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama almarhum/ah, No. KK, NIK, rumah (contoh: D.18), atau nama pelapor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
          />
        </div>

        {/* View Mode Toggle (Individual vs Berdasarkan No KK) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-white text-rose-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan per individu"
            >
              <User className="w-3.5 h-3.5 text-rose-600" />
              <span>Individual ({filteredList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kk'
                  ? 'bg-white text-rose-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kelompokkan berdasarkan Nomor Kartu Keluarga (KK)"
            >
              <Users className="w-3.5 h-3.5 text-rose-600" />
              <span>Berdasarkan No. KK ({groupedByKK.length})</span>
            </button>
          </div>

          {/* Penyebab Filter */}
          <select
            value={filterPenyebab}
            onChange={(e) => setFilterPenyebab(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:border-rose-500 outline-none shrink-0"
          >
            <option value="all">Semua Penyebab ({deceasedList.length})</option>
            <option value="Sakit Medis">Sakit Medis</option>
            <option value="Usia Lanjut">Usia Lanjut</option>
            <option value="Kecelakaan">Kecelakaan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Deceased Citizens Display */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <HeartCrack className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak ada catatan warga meninggal</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterPenyebab !== 'all'
              ? 'Tidak ditemukan data yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'
              : 'Belum ada data kematian warga Blok D yang dicatat dalam sistem.'}
          </p>
        </div>
      ) : viewMode === 'individual' ? (
        /* INDIVIDUAL VIEW CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-rose-300 p-5 shadow-sm hover:shadow-md transition-all space-y-4 relative"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-base">{item.nama}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    {item.usia > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        {item.usia} Thn
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.penyebabMeninggal}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-mono">NIK: {item.nik}</span>
                    <span>•</span>
                    <span className="font-semibold text-blue-700">{item.hubunganKeluarga || 'Kepala Keluarga'}</span>
                    {item.nomorKK && item.nomorKK !== '-' && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => handleCopy(item.nomorKK!, 'No. KK')}
                          className="font-mono text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          title="Salin Nomor KK"
                        >
                          <Copy className="w-3 h-3" />
                          <span>KK: {item.nomorKK}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.tanggalMeninggal}
                  </span>
                </div>
              </div>

              {/* Location & Burial Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    D
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Kediaman / Rumah di Blok D:</div>
                    <div className="font-bold text-slate-800">{item.nomorRumah}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <MapPin className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Tempat Wafat & Pemakaman:</div>
                    <div className="font-semibold text-slate-800">{item.namaTempatMeninggal || item.tempatMeninggal} (Pukul {item.jamMeninggal || '10:00'} WIB)</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">Makam: <strong>{item.tempatPemakaman}</strong></div>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-rose-50/40 p-2.5 rounded-xl border border-rose-100">
                <div>
                  <span className="text-slate-400 text-[10px] block">Pelapor / Keluarga:</span>
                  <span className="font-bold text-slate-800">{item.namaPelapor}</span> ({item.hubunganPelapor})
                </div>
                {item.noHpPelapor && item.noHpPelapor !== '-' && (
                  <div>
                    <span className="text-slate-400 text-[10px] block">Kontak Pelapor:</span>
                    <span className="font-mono text-emerald-700 font-semibold">{item.noHpPelapor}</span>
                  </div>
                )}
              </div>

              {item.nomorSuratKematian && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>No. Surat Keterangan Kematian RT: <strong className="font-mono text-slate-800">{item.nomorSuratKematian}</strong></span>
                </div>
              )}

              {item.keterangan && (
                <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  "{item.keterangan}"
                </div>
              )}

              {/* Timestamp & Recorder Detail */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>
                    Terakhir Diperbarui: <strong className="text-slate-700">{formatDateTimeIndo(item.updatedAt || item.tanggalMeninggal)}</strong>
                  </span>
                  {item.updatedAt && (
                    <span className="text-[10px] text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      {formatRelativeTimeIndo(item.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  Petugas: <span className="text-slate-600 font-medium">{item.petugasPencatat || 'Pengurus RT'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/?text=${generateWhatsAppBroadcast(item)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-emerald-200"
                  title="Bagikan Berita Duka Cita ke Grup WhatsApp Warga"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Siaran WA</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLetterPrintItem(item)}
                    className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-blue-200 cursor-pointer"
                    title="Cetak Surat Keterangan Kematian RT/RW"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Surat Kematian RT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* BERDASARKAN NOMOR KK VIEW */
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between px-1">
            <span>Menampilkan data dikelompokkan berdasarkan <strong>Nomor Kartu Keluarga (KK) & Rumah</strong>:</span>
            <span className="font-semibold text-slate-700">{groupedByKK.length} Keluarga / KK</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {groupedByKK.map((group) => {
              const firstItem = group.records[0];
              return (
                <div
                  key={group.kkKey}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-rose-300 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* KK Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                          {group.nomorRumah}
                        </span>
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">
                          Keluarga Rumah: {group.nomorRumah}
                        </h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                          {group.records.length} Catatan Wafat
                        </span>
                      </div>

                      {group.nomorKK && group.nomorKK !== '-' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <button
                            onClick={() => handleCopy(group.nomorKK, 'Nomor KK')}
                            className="font-mono text-slate-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                            title="Klik untuk Salin Nomor KK"
                          >
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>No. KK: <strong className="text-slate-800">{group.nomorKK}</strong></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* List of Deceased Members in this KK */}
                  <div className="space-y-3">
                    {group.records.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{item.nama}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                              {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                            {item.usia > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                {item.usia} Thn
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-600">
                              ({item.hubunganKeluarga || 'Anggota'})
                            </span>
                          </div>

                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 self-start sm:self-auto">
                            Tgl Wafat: {item.tanggalMeninggal}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            Tempat: <strong>{item.namaTempatMeninggal || item.tempatMeninggal}</strong> (Penyebab: {item.penyebabMeninggal})
                          </div>
                          <div>
                            Makam: <strong>{item.tempatPemakaman}</strong>
                          </div>
                          <div>
                            Pelapor: <strong>{item.namaPelapor}</strong> ({item.hubunganPelapor})
                          </div>
                          {item.nomorSuratKematian && (
                            <div className="font-mono text-[11px] text-blue-700">
                              Surat RT: {item.nomorSuratKematian}
                            </div>
                          )}
                        </div>

                        {/* Actions for this individual inside KK */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/?text=${generateWhatsAppBroadcast(item)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-emerald-200"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Siaran WA</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setLetterPrintItem(item)}
                            className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-blue-200 cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak Surat RT</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-500 hover:text-blue-600 bg-white rounded border border-slate-200 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 bg-white rounded border border-slate-200 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit Timestamp Banner */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        Terakhir Diperbarui: <strong className="text-slate-700">{formatDateTimeIndo(firstItem.updatedAt || firstItem.tanggalMeninggal)}</strong>
                      </span>
                      {firstItem.updatedAt && (
                        <span className="text-[10px] text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {formatRelativeTimeIndo(firstItem.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Petugas: <span className="text-slate-600 font-medium">{firstItem.petugasPencatat || 'Pengurus RT'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* Modal: Input / Edit Warga Meninggal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn print:hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-800 flex items-center justify-center font-bold">
                  <HeartCrack className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingItem ? 'Edit Data Warga Meninggal' : 'Formulir Pencatatan Warga Meninggal Dunia'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sistem Administrasi Kependudukan Rt.005 Dan Rw.005 Blok D
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Option Selector: Pick from active resident OR manual input */}
              {!editingItem && (
                <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 space-y-3">
                  <div className="font-bold text-slate-800 text-xs">Pilih Kategori Pencatatan:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipePencatatan('individual')}
                      className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tipePencatatan === 'individual'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100/50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Individual (Perorangan)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipePencatatan('kk')}
                      className={`p-2 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tipePencatatan === 'kk'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Berdasarkan No. KK</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-rose-200/80">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceType"
                        checked={selectedSourceType === 'existing'}
                        onChange={() => setSelectedSourceType('existing')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Pilih dari Data Warga Aktif</span>
                    </label>

                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceType"
                        checked={selectedSourceType === 'manual'}
                        onChange={() => setSelectedSourceType('manual')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Input Manual Baru</span>
                    </label>
                  </div>

                  {selectedSourceType === 'existing' && (
                    <div className="space-y-2 pt-1 border-t border-rose-200/80">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Pilih Nama Warga yang Wafat:
                      </label>
                      <select
                        value={selectedExistingResidentKey}
                        onChange={(e) => handleSelectExistingResident(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-rose-300 rounded-xl text-xs font-medium text-slate-800 focus:border-rose-600 outline-none"
                      >
                        <option value="">-- Pilih Nama Warga / Rumah --</option>
                        {houses.map((house) =>
                          house.residents.map((res) => (
                            <option key={`${house.id}:::${res.id}`} value={`${house.id}:::${res.id}`}>
                              {res.nama} ({house.nomorRumah} - {res.hubunganKeluarga} / NIK: {res.nik})
                            </option>
                          ))
                        )}
                      </select>

                      <label className="flex items-center gap-2 text-[11px] font-semibold text-rose-900 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoRemoveFromActive}
                          onChange={(e) => setAutoRemoveFromActive(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span>Keluarkan otomatis nama almarhum/ah dari daftar data rumah aktif</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Main Fields Grid (All mandatory with required attribute) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Meninggal Dunia *</label>
                  <input
                    type="date"
                    value={tanggalMeninggal}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setTanggalMeninggal(newDate);
                      if (!editingItem) {
                        setNomorSuratKematian(getAutoLetterNumber(newDate));
                      }
                    }}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pukul / Jam Meninggal *</label>
                  <input
                    type="time"
                    value={jamMeninggal}
                    onChange={(e) => setJamMeninggal(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Rumah di Blok D *</label>
                  <input
                    type="text"
                    value={nomorRumah}
                    onChange={(e) => setNomorRumah(e.target.value)}
                    placeholder="Contoh: Blok D1 No. 18"
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    value={nomorKK}
                    onChange={(e) => setNomorKK(e.target.value)}
                    placeholder="16 digit No. KK..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Almarhum / Almarhumah *</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama lengkap yang wafat..."
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="16 digit NIK..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin *</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as Gender)}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Usia Saat Meninggal (Tahun) *</label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={usia}
                    onChange={(e) => setUsia(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="Usia..."
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hubungan dalam Keluarga</label>
                  <select
                    value={hubunganKeluarga}
                    onChange={(e) => setHubunganKeluarga(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua / Mertua">Orang Tua / Mertua</option>
                    <option value="Famili Lain">Famili Lain</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Penyebab Kematian *</label>
                  <select
                    value={penyebabMeninggal}
                    onChange={(e) => setPenyebabMeninggal(e.target.value as DeceasedCitizen['penyebabMeninggal'])}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-semibold"
                  >
                    <option value="Sakit Medis">Sakit Medis</option>
                    <option value="Usia Lanjut">Usia Lanjut / Tua</option>
                    <option value="Kecelakaan">Kecelakaan Lalu Lintas / Kerja</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tempat Meninggal *</label>
                  <select
                    value={tempatMeninggal}
                    onChange={(e) => setTempatMeninggal(e.target.value as DeceasedCitizen['tempatMeninggal'])}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  >
                    <option value="Rumah Duka / Kediaman">Rumah Duka / Kediaman</option>
                    <option value="Rumah Sakit">Rumah Sakit</option>
                    <option value="Perjalanan">Perjalanan ke Rumah Sakit</option>
                    <option value="Tempat Lain">Tempat Lain</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Detail Nama Tempat Meninggal</label>
                  <input
                    type="text"
                    value={namaTempatMeninggal}
                    onChange={(e) => setNamaTempatMeninggal(e.target.value)}
                    placeholder="Contoh: RS Hermina Mekarsari / Kediaman Blok D1 No. 18"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lokasi / Tempat Pemakaman *</label>
                  <input
                    type="text"
                    value={tempatPemakaman}
                    onChange={(e) => setTempatPemakaman(e.target.value)}
                    placeholder="Contoh: TPU Desa Situ Sari (Makam Muslim) / Luar Kota"
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Pemakaman *</label>
                  <input
                    type="date"
                    value={tanggalPemakaman}
                    onChange={(e) => setTanggalPemakaman(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Pelapor & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Pelapor / Keluarga Penanggung Jawab *</label>
                  <input
                    type="text"
                    value={namaPelapor}
                    onChange={(e) => setNamaPelapor(e.target.value)}
                    placeholder="Nama pelapor kematian..."
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hubungan Pelapor dengan Almarhum/ah *</label>
                  <select
                    value={hubunganPelapor}
                    onChange={(e) => setHubunganPelapor(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  >
                    <option value="Keluarga Kandung">Keluarga Kandung</option>
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Anak Kandung">Anak Kandung</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Saudara / Kerabat">Saudara / Kerabat</option>
                    <option value="Pengurus RT / Warga">Pengurus RT / Warga</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / HP Pelapor</label>
                  <input
                    type="text"
                    value={noHpPelapor}
                    onChange={(e) => setNoHpPelapor(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Nomor Surat Keterangan Kematian (SKK) *</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      <Lock className="w-2.5 h-2.5 text-rose-600" />
                      Otomatis
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={nomorSuratKematian}
                    className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 cursor-not-allowed select-all focus:outline-none"
                    title="Nomor surat SKK digenerate otomatis berdasarkan agenda penomoran sistem dan tidak dapat diedit manual."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Nomor urut resmi berikutnya dari sistem (Format: [No]/SKK/D/[Bulan]/[Tahun])
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Jenazah disemayamkan di kediaman duka Blok D1 No. 18 sebelum dimakamkan ba'da Dzuhur..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Petugas Pencatat Data</label>
                  <input
                    type="text"
                    value={petugasPencatat}
                    onChange={(e) => setPetugasPencatat(e.target.value)}
                    placeholder="Nama Pengurus RT..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Catatan Kematian'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cetak Surat Pengantar Kematian RT */}
      {letterPrintItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl space-y-6 my-6 max-h-[96vh] overflow-y-auto">
            {/* Header Dialog (Screen only) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Surat Keterangan Kematian RT/RW</h3>
                  <p className="text-[11px] text-slate-500">Pratinjau & Cetak Dokumen Resmi Rt.005 Dan Rw.005</p>
                </div>
              </div>

              {/* Action Buttons: Print / PDF & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition-all cursor-pointer ring-1 ring-rose-500"
                  title="Cetak langsung ke Printer atau Simpan sebagai PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Cetak PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLetterPrintItem(null)}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
                  title="Tutup Pratinjau Surat"
                >
                  <X className="w-4 h-4" />
                  <span>Tutup</span>
                </button>
              </div>
            </div>

            {/* Official Letter Paper */}
            <div id="printable-deceased-letter" className="border border-slate-300 p-6 sm:p-8 rounded-xl bg-white text-slate-900 space-y-4 sm:space-y-5 print:space-y-2.5 font-serif leading-relaxed print:leading-snug text-sm shadow-sm print:border-none print:p-0">
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-double border-slate-900 pb-3 print:pb-2 gap-4">
                <LogoBlokD className="w-14 h-14 sm:w-16 sm:h-16 print:w-14 print:h-14 shrink-0" />
                <div className="flex-1 text-center space-y-0.5">
                  <div className="text-[11px] font-sans uppercase tracking-widest text-slate-600 font-semibold">
                    Pemerintah Kabupaten Bogor • Kecamatan Cileungsi • Desa Situ Sari
                  </div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 font-sans">
                    PANORAMA REGENCY 3 SITU SARI
                  </h1>
                  <div className="text-xs sm:text-sm font-sans uppercase font-bold text-rose-800 tracking-wider">
                    BLOK D
                  </div>
                  <div className="text-[11px] font-sans text-slate-600">
                    Wilayah Administrasi: Rt.005 Dan Rw.005 • Kab. Bogor 16820
                  </div>
                </div>
                <div className="w-14 sm:w-16 hidden sm:block"></div>
              </div>

              {/* Title of Letter */}
              <div className="text-center space-y-0.5 pt-1 print:pt-0.5">
                <h2 className="font-bold text-base underline uppercase tracking-wide font-sans">
                  SURAT KETERANGAN KEMATIAN
                </h2>
                <div className="text-xs font-sans text-slate-600 font-mono">
                  Nomor: {letterPrintItem.nomorSuratKematian || 'S-KMTN/BLOK-D/RT05-RW05/' + new Date().getFullYear()}
                </div>
              </div>

              {/* Body text */}
              <div className="space-y-3 print:space-y-2 text-xs font-sans text-slate-800 leading-normal print:leading-tight">
                <p>
                  Yang bertanda tangan di bawah ini Pengurus Blok D bersama Pengurus Rt.005 Dan Rw.005 Perumahan Panorama Regency 3, Desa Situ Sari, Kecamatan Cileungsi, Kabupaten Bogor, dengan ini menerangkan bahwa:
                </p>

                <div className="pl-2 sm:pl-4 font-sans">
                  <table className="w-full text-xs font-sans border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Nama Lengkap</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-900 align-top">{letterPrintItem.nama}</td>
                      </tr>
                      {letterPrintItem.nomorKK && letterPrintItem.nomorKK !== '-' && (
                        <tr>
                          <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Nomor Kartu Keluarga (KK)</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-semibold text-slate-900 align-top">{letterPrintItem.nomorKK}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">NIK</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-semibold text-slate-900 align-top">{letterPrintItem.nik}</td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Jenis Kelamin</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Usia Saat Meninggal</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.usia ? `${letterPrintItem.usia} Tahun` : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Alamat Rumah Duka</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.nomorRumah}, Wilayah Rt.005 Dan Rw.005 Panorama Regency 3, Situ Sari, Cileungsi
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="pt-1 print:pt-0.5 font-medium">Telah meninggal dunia pada:</p>

                <div className="pl-2 sm:pl-4 font-sans">
                  <table className="w-full text-xs font-sans border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Hari, Tanggal</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-900 align-top">
                          {letterPrintItem.tanggalMeninggal ? formatDateNamedMonth(letterPrintItem.tanggalMeninggal) : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Pukul / Jam</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.jamMeninggal || '10:00'} WIB
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Tempat Meninggal</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.namaTempatMeninggal || letterPrintItem.tempatMeninggal}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Penyebab Kematian</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.penyebabMeninggal}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Dimakamkan di</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.tempatPemakaman}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="pt-1 print:pt-0.5 font-medium">Berdasarkan laporan dari:</p>

                <div className="pl-2 sm:pl-4 font-sans">
                  <table className="w-full text-xs font-sans border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Nama Pelapor</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-900 align-top">{letterPrintItem.namaPelapor}</td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Hubungan Keluarga</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">{letterPrintItem.hubunganPelapor}</td>
                      </tr>
                      {letterPrintItem.noHpPelapor && letterPrintItem.noHpPelapor !== '-' && (
                        <tr>
                          <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Kontak Pelapor</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">{letterPrintItem.noHpPelapor}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="pt-1 print:pt-0.5">
                  Surat keterangan kematian ini dibuat dengan sebenarnya atas dasar laporan keluarga dan saksi, untuk dipergunakan sebagaimana mestinya dalam pengurusan akta kematian di Disdukcapil / administrasi lainnya.
                </p>
              </div>

              {/* Tanggal di Posisi Atas Kanan Tanda Tangan */}
              <div className="flex justify-end text-xs font-sans text-slate-800 pt-2 pb-1 print:pt-1 print:pb-0.5">
                <div>Situ Sari, {letterPrintItem.tanggalMeninggal ? formatDateNamedMonth(letterPrintItem.tanggalMeninggal) : formatDateNamedMonth(new Date().toISOString().slice(0, 10))}</div>
              </div>

              {/* Signature Block - 4 Separate Columns */}
              <div className="grid grid-cols-4 text-center text-xs font-sans text-slate-900 gap-2 pt-1 print:pt-0.5">
                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Ketua RW 005</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px]">
                      ( .............................. )
                    </div>
                  </div>
                </div>

                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Ketua RT 005</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px]">
                      ( .............................. )
                    </div>
                  </div>
                </div>

                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Pengurus Blok D</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px] uppercase">
                      ( {currentUser ? currentUser.nama : 'Ali Ragil Permana'} )
                    </div>
                  </div>
                </div>

                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Warga Bersangkutan</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px] uppercase">
                      ( {letterPrintItem.namaPelapor} )
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions (Screen only) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden text-xs text-slate-500">
              <span className="text-[11px]">💡 Tips: Pada dialog cetak browser, pilih tujuan <strong>"Save as PDF"</strong> untuk menyimpan sebagai dokumen digital atau pilih printer Anda.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLetterPrintItem(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn print:hidden">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hapus Catatan Kematian?</h3>
                <p className="text-xs text-rose-400">Data kematian akan dihapus</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus arsip pencatatan kematian atas nama <strong className="text-white">{itemToDelete.nama}</strong> ({itemToDelete.nomorRumah})?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-rose-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-rose-800 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
