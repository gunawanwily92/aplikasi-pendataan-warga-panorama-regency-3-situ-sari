import React, { useState, useMemo } from 'react';
import {
  CoverLetter,
  MovedCitizen,
  DeceasedCitizen,
  HouseUnit,
  AuthUser,
  ActiveTab
} from '../types/census';
import {
  getAllOutgoingLetters,
  calculateNextLetterSequence,
  LETTER_TYPES,
  LetterType,
  OutgoingLetterRecord,
  formatLetterNumber,
  getRomanMonth,
  parseLetterNumber
} from '../utils/letterNumberUtils';
import { formatDateDDMMYYYY, formatDateNamedMonth } from '../utils/censusHelpers';
import { LogoBlokD } from './LogoBlokD';
import {
  BookOpen,
  Hash,
  Search,
  Filter,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Truck,
  HeartCrack,
  ExternalLink,
  Calendar,
  User,
  ShieldCheck,
  Building,
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

interface LetterAgendaViewProps {
  coverLetters: CoverLetter[];
  movedList: MovedCitizen[];
  deceasedList: DeceasedCitizen[];
  houses: HouseUnit[];
  currentUser: AuthUser | null;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const LetterAgendaView: React.FC<LetterAgendaViewProps> = ({
  coverLetters,
  movedList,
  deceasedList,
  houses,
  currentUser,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Next Sequence Quick Generator State
  const [genType, setGenType] = useState<LetterType>('SP');
  const [genDate, setGenDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [genCopied, setGenCopied] = useState(false);

  // Compute all unified outgoing letters
  const allRecords = useMemo(() => {
    return getAllOutgoingLetters(coverLetters, movedList, deceasedList);
  }, [coverLetters, movedList, deceasedList]);

  // Extract unique years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    allRecords.forEach((r) => {
      if (typeof r.tahun === 'number' && !isNaN(r.tahun) && r.tahun > 0) {
        yearsSet.add(r.tahun);
      }
    });
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [allRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // Filter year
      if (selectedYear !== 'all' && rec.tahun !== parseInt(selectedYear, 10)) {
        return false;
      }
      // Filter type
      if (selectedType !== 'all' && rec.kodeJenis !== selectedType) {
        return false;
      }
      // Filter status
      if (selectedStatus === 'duplicate' && !rec.isDuplicate) return false;
      if (selectedStatus === 'standard' && !rec.isValidStandard) return false;
      if (selectedStatus === 'legacy' && rec.isValidStandard) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNomor = rec.nomorSurat.toLowerCase().includes(q);
        const matchNama = rec.namaWarga.toLowerCase().includes(q);
        const matchNik = rec.nik.toLowerCase().includes(q);
        const matchRumah = rec.nomorRumah.toLowerCase().includes(q);
        const matchKeperluan = rec.keperluan.toLowerCase().includes(q);
        const matchPetugas = (rec.petugas || '').toLowerCase().includes(q);
        return matchNomor || matchNama || matchNik || matchRumah || matchKeperluan || matchPetugas;
      }
      return true;
    });
  }, [allRecords, selectedYear, selectedType, selectedStatus, searchQuery]);

  // Stats calculation
  const totalCount = allRecords.length;
  const spCount = allRecords.filter((r) => r.kodeJenis === 'SP').length;
  const skpdCount = allRecords.filter((r) => r.kodeJenis === 'SKPD').length;
  const skkCount = allRecords.filter((r) => r.kodeJenis === 'SKK').length;
  const duplicateCount = allRecords.filter((r) => r.isDuplicate).length;

  const currentGenYear = genDate ? new Date(genDate).getFullYear() || 2026 : 2026;
  const genSeqInfo = calculateNextLetterSequence({
    coverLetters,
    movedList,
    deceasedList,
    type: genType,
    year: currentGenYear
  });

  const generatedNextNumber = formatLetterNumber({
    sequence: genSeqInfo.nextSequence,
    type: genType,
    unit: 'D',
    date: genDate
  });

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyGenNumber = () => {
    navigator.clipboard.writeText(generatedNextNumber);
    setGenCopied(true);
    setTimeout(() => setGenCopied(false), 2000);
  };

  const handlePrintAgenda = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No Urut',
      'Nomor Surat Resmi',
      'Kode Jenis',
      'Nama Dokumen',
      'Unit',
      'Bulan Romawi',
      'Tahun',
      'Tanggal Terbit',
      'Nama Warga / Pemohon',
      'NIK',
      'Nomor Rumah',
      'Keperluan / Perihal',
      'Petugas Pencatat',
      'Status Format'
    ];

    const rows = filteredRecords.map((r) => [
      r.nomorUrut,
      `"${r.nomorSurat}"`,
      r.kodeJenis,
      `"${r.namaJenis}"`,
      r.kodeUnit,
      r.bulanRomawi,
      r.tahun,
      r.tanggalSurat,
      `"${r.namaWarga}"`,
      `"${r.nik}"`,
      `"${r.nomorRumah}"`,
      `"${r.keperluan.replace(/"/g, '""')}"`,
      `"${r.petugas || '-'}"`,
      r.isValidStandard ? 'Standar Baru' : 'Format Lama'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Agenda_Surat_Keluar_Blok_D_${selectedYear}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Screen Management View (Hidden during print) */}
      <div className="space-y-6 print:hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-400/30">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buku Registrasi & Agenda Penomoran Surat Keluar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Agenda Surat Keluar Blok D
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pencatatan berkala seluruh terbitan nomor surat resmi (Surat Pengantar, Keterangan Pindah Domisili, dan Kematian) agar nomor urut terstruktur rapi, tidak terlewat, dan bebas dari nomor ganda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrintAgenda}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all cursor-pointer shadow-md"
                title="Cetak Fisik Buku Agenda Surat Keluar"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Cetak Agenda</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/40"
                title="Ekspor Data Agenda ke CSV/Excel"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Surat Keluar
              </span>
              <div className="text-xl font-bold text-slate-900 leading-tight">
                {totalCount} <span className="text-xs font-normal text-slate-500">dokumen</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Surat Pengantar (SP)
              </span>
              <div className="text-xl font-bold text-blue-600 leading-tight">
                {spCount} <span className="text-xs font-normal text-slate-500">surat</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Pindah Domisili (SKPD)
              </span>
              <div className="text-xl font-bold text-amber-600 leading-tight">
                {skpdCount} <span className="text-xs font-normal text-slate-500">surat</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <HeartCrack className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Kematian (SKK)
              </span>
              <div className="text-xl font-bold text-rose-600 leading-tight">
                {skkCount} <span className="text-xs font-normal text-slate-500">surat</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              duplicateCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {duplicateCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Audit Nomor Ganda
              </span>
              <div className={`text-sm font-bold leading-tight ${duplicateCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {duplicateCount > 0 ? `${duplicateCount} Terdeteksi Ganda` : 'Bebas Nomor Ganda'}
              </div>
            </div>
          </div>
        </div>

        {/* Next Number Sequence Calculator & Standards Explainer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Kalkulator & Generator Nomor Surat Berikutnya
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Pilih jenis surat dan tanggal untuk melihat nomor urut berikutnya yang otomatis dihitung dari buku agenda.
              </p>
            </div>

            {/* Standard Formula Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Rumus:</span>
              <span className="text-blue-700 font-bold">[Nomor Urut]</span>
              <span>/</span>
              <span className="text-indigo-700 font-bold">[Kode Jenis]</span>
              <span>/</span>
              <span className="text-purple-700 font-bold">D</span>
              <span>/</span>
              <span className="text-pink-700 font-bold">[Bulan Romawi]</span>
              <span>/</span>
              <span className="text-emerald-700 font-bold">[Tahun]</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Input Controls */}
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  1. Jenis Surat:
                </label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value as LetterType)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="SP">SP (Surat Pengantar)</option>
                  <option value="SKPD">SKPD (Keterangan Pindah)</option>
                  <option value="SKK">SKK (Keterangan Kematian)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  2. Tanggal Rencana Terbit:
                </label>
                <input
                  type="date"
                  value={genDate}
                  onChange={(e) => setGenDate(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Generated Output Box */}
            <div className="md:col-span-7 bg-gradient-to-r from-blue-50 to-indigo-50/70 p-3.5 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Nomor Urut Tersedia Berikutnya ({currentGenYear}):
                </span>
                <div className="font-mono font-bold text-base sm:text-lg text-slate-900 tracking-wide">
                  {generatedNextNumber}
                </div>
                <p className="text-[10px] text-slate-500">
                  Nomor urut #{String(genSeqInfo.nextSequence).padStart(3, '0')} • Unit: D (Pengurus Blok D) • Bulan: {getRomanMonth(genDate)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyGenNumber}
                  className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 px-3 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  {genCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Nomor</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (genType === 'SP') onNavigateTab('pengantar');
                    else if (genType === 'SKPD') onNavigateTab('pindah');
                    else if (genType === 'SKK') onNavigateTab('meninggal');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Buka Form {genType}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor surat, nama warga, NIK, rumah, keperluan..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Filter Year */}
            <div className="lg:col-span-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Type */}
            <div className="lg:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="all">Semua Jenis Dokumen ({totalCount})</option>
                <option value="SP">Surat Pengantar (SP - {spCount})</option>
                <option value="SKPD">Pindah Domisili (SKPD - {skpdCount})</option>
                <option value="SKK">Kematian (SKK - {skkCount})</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="all">Semua Format</option>
                <option value="standard">Standar Baru</option>
                <option value="legacy">Format Lama</option>
                <option value="duplicate">Indikasi Ganda ({duplicateCount})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table of Outgoing Letters (Buku Agenda) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                Daftar Registrasi Surat Keluar
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                {filteredRecords.length} Entri
              </span>
            </div>

            <span className="text-xs text-slate-500">
              Menampilkan data terurut dari nomor terbaru
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Catatan Surat Ditemukan</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tidak ada agenda surat keluar yang cocok dengan kriteria filter atau pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Nomor Surat Resmi</th>
                    <th className="py-3 px-3">Jenis Dokumen</th>
                    <th className="py-3 px-3">Nama Warga / Pemohon</th>
                    <th className="py-3 px-3">Rumah Asal</th>
                    <th className="py-3 px-3 min-w-[220px]">Perihal / Keperluan</th>
                    <th className="py-3 px-3">Petugas</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec, index) => {
                    const parsed = parseLetterNumber(rec.nomorSurat);
                    const typeConfig = LETTER_TYPES[rec.kodeJenis] || LETTER_TYPES.SP;

                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          rec.isDuplicate ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        {/* No. Urut Agenda */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                          {String(rec.nomorUrut).padStart(3, '0')}
                        </td>

                        {/* Tanggal */}
                        <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                          {formatDateDDMMYYYY(rec.tanggalSurat)}
                        </td>

                        {/* Nomor Surat Lengkap */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                              {rec.nomorSurat}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(rec.nomorSurat, rec.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all cursor-pointer"
                              title="Salin Nomor Surat"
                            >
                              {copiedId === rec.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Jenis Dokumen */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.badgeBg} ${typeConfig.badgeText} ${typeConfig.borderColor}`}
                          >
                            <span>{typeConfig.code}</span>
                            <span className="font-normal opacity-80">({typeConfig.shortName})</span>
                          </span>
                        </td>

                        {/* Nama Warga */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{rec.namaWarga}</div>
                          <div className="text-[10px] font-mono text-slate-400">{rec.nik}</div>
                        </td>

                        {/* Rumah Asal */}
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                          {rec.nomorRumah || '-'}
                        </td>

                        {/* Keperluan */}
                        <td className="py-3 px-3 text-slate-600 leading-snug">
                          {rec.keperluan}
                        </td>

                        {/* Petugas */}
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                          {rec.petugas || '-'}
                        </td>

                        {/* Status Penomoran */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {rec.isDuplicate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Ganda
                            </span>
                          ) : rec.isValidStandard ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Standar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-medium">
                              Lama
                            </span>
                          )}
                        </td>

                        {/* Aksi Navigasi ke Modul */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onNavigateTab(rec.sourceType)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            title={`Buka modul ${rec.sourceType}`}
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Printable Physical Register Book Document (Format A4 Cetak Resmi) */}
      <div className="hidden print:block bg-white text-black p-4 font-sans text-xs" id="printable-agenda-book">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-black pb-3 mb-4 text-center relative">
          <div className="flex items-center justify-between gap-4">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <LogoBlokD className="w-14 h-14" />
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PENGURUS PAGUYUBAN WARGA BLOK D
              </h2>
              <h1 className="text-base font-black uppercase tracking-tight text-slate-950">
                RUKUN TETANGGA 004 / RUKUN WARGA 012
              </h1>
              <p className="text-[10px] font-semibold text-slate-800">
                PERUMAHAN PANORAMA REGENCY 3 - DESA SITU SARI
              </p>
              <p className="text-[9px] text-slate-600">
                Kecamatan Cileungsi, Kabupaten Bogor, Jawa Barat 16820
              </p>
            </div>
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <LogoBlokD className="w-14 h-14" />
            </div>
          </div>
        </div>

        {/* Judul Dokumen Agenda */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold uppercase underline">
            BUKU AGENDA REGISTRASI PENOMORAN SURAT KELUAR
          </h2>
          <p className="text-[10px] text-slate-700 mt-0.5">
            Tahun Administrasi: {selectedYear === 'all' ? 'Semua Tahun' : selectedYear} • Dicetak Tanggal:{' '}
            {formatDateNamedMonth(new Date())}
          </p>
        </div>

        {/* Tabel Fisik Agenda Surat Keluar */}
        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr className="bg-slate-200 font-bold border-b border-black text-center">
              <th className="border border-black p-1 w-8">No</th>
              <th className="border border-black p-1 w-20">Tanggal</th>
              <th className="border border-black p-1 w-32">Nomor Surat Resmi</th>
              <th className="border border-black p-1 w-16">Jenis</th>
              <th className="border border-black p-1 w-36">Nama Warga / Pemohon</th>
              <th className="border border-black p-1 w-20">Rumah</th>
              <th className="border border-black p-1">Perihal / Keperluan</th>
              <th className="border border-black p-1 w-28">Petugas Terbit</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={r.id} className="border-b border-black">
                <td className="border border-black p-1 text-center font-mono">{i + 1}</td>
                <td className="border border-black p-1 text-center whitespace-nowrap">{formatDateDDMMYYYY(r.tanggalSurat)}</td>
                <td className="border border-black p-1 font-mono font-bold whitespace-nowrap">{r.nomorSurat}</td>
                <td className="border border-black p-1 text-center font-bold">{r.kodeJenis}</td>
                <td className="border border-black p-1 font-semibold">{r.namaWarga}</td>
                <td className="border border-black p-1 text-center">{r.nomorRumah}</td>
                <td className="border border-black p-1">{r.keperluan}</td>
                <td className="border border-black p-1 text-center">{r.petugas || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Lembar Pengesahan */}
        <div className="mt-8 grid grid-cols-2 text-center text-[10px]">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Ketua Paguyuban Blok D</p>
            <div className="h-16" />
            <p className="font-bold underline">Ali Ragil Permana</p>
          </div>
          <div>
            <p>Situ Sari, {formatDateNamedMonth(new Date())}</p>
            <p className="font-bold">Sekretaris Paguyuban Blok D</p>
            <div className="h-16" />
            <p className="font-bold underline">{currentUser?.nama || 'Wily Gunawan'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
