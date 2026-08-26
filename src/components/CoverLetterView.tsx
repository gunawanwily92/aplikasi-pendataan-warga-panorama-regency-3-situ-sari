import React, { useState } from 'react';
import { CoverLetter, HouseUnit, AuthUser, Gender, Religion, MaritalStatus, Resident, MovedCitizen, DeceasedCitizen } from '../types/census';
import { getAllResidents, formatDateDDMMYYYY, formatDateNamedMonth, formatDateTimeIndo } from '../utils/censusHelpers';
import { calculateNextLetterSequence, formatLetterNumber } from '../utils/letterNumberUtils';
import { LogoBlokD } from './LogoBlokD';
import {
  FileText,
  PlusCircle,
  Search,
  Printer,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  MessageSquare,
  Copy,
  Calendar,
  Building,
  User,
  CreditCard,
  Briefcase,
  AlertTriangle,
  Send,
  HelpCircle,
  Sparkles,
  MapPin,
  Tag,
  Lock
} from 'lucide-react';

interface CoverLetterViewProps {
  coverLetters: CoverLetter[];
  movedList?: MovedCitizen[];
  deceasedList?: DeceasedCitizen[];
  houses: HouseUnit[];
  currentUser: AuthUser | null;
  onAddCoverLetter: (letter: CoverLetter) => void;
  onUpdateCoverLetter: (letter: CoverLetter) => void;
  onDeleteCoverLetter: (letterId: string) => void;
}

const COMMON_PURPOSES = [
  { label: 'SKCK Kepolisian', category: 'SKCK Kepolisian' as const, text: 'Pengurusan Surat Keterangan Catatan Kepolisian (SKCK) untuk melengkapi persyaratan administrasi pekerjaan / instansi.' },
  { label: 'Pembuatan / Ganti e-KTP', category: 'KTP / KK' as const, text: 'Pengurusan permohonan penerbitan / penggantian KTP Elektronik (e-KTP) di Kantor Kecamatan Cileungsi / Disdukcapil Kab. Bogor.' },
  { label: 'Pembaruan Kartu Keluarga', category: 'KTP / KK' as const, text: 'Pengurusan penerbitan / perubahan data Kartu Keluarga (KK) baru di Kantor Desa Situ Sari & Disdukcapil Kab. Bogor.' },
  { label: 'Pendaftaran BPJS Kesehatan', category: 'BPJS Kesehatan / Bansos' as const, text: 'Persyaratan pendaftaran / pengaktifan kepesertaan jaminan BPJS Kesehatan / BPJS Ketenagakerjaan.' },
  { label: 'Buka Rekening Bank / KPR', category: 'Bank / Finansial' as const, text: 'Persyaratan pembukaan rekening tabungan / giro perbankan dan kelengkapan berkas administrasi finansial.' },
  { label: 'Keterangan Domisili Tinggal', category: 'Keterangan Domisili' as const, text: 'Keterangan domisili bertempat tinggal resmi di wilayah Perumahan Panorama Regency 3 Blok D (Rt.005 Dan Rw.005).' },
  { label: 'Surat Keterangan Usaha (SKU)', category: 'Keterangan Usaha (SKU)' as const, text: 'Keterangan memiliki dan menjalankan kegiatan usaha mikro/kecil perorangan di wilayah tempat tinggal Blok D.' },
  { label: 'Pengantar Nikah (N1-N4)', category: 'Pengantar Nikah' as const, text: 'Pengurusan berkas pengantar pernikahan (Surat Keterangan Untuk Nikah / N1-N4) ke Kantor Desa Situ Sari & KUA Kecamatan Cileungsi.' },
  { label: 'Pengajuan Beasiswa Sekolah', category: 'Pendidikan / Beasiswa' as const, text: 'Persyaratan administrasi pengajuan bantuan beasiswa pendidikan dan keringanan biaya sekolah / perkuliahan.' },
  { label: 'Keterangan Belum Punya Rumah', category: 'Bank / Finansial' as const, text: 'Keterangan belum memiliki rumah tinggal sendiri untuk kelengkapan administrasi program subsidi perumahan.' },
  { label: 'Pengurusan Paspor', category: 'Lainnya' as const, text: 'Persyaratan kelengkapan administrasi pembuatan / penggantian paspor Republik Indonesia di Kantor Imigrasi.' }
];

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  coverLetters,
  movedList = [],
  deceasedList = [],
  houses,
  currentUser,
  onAddCoverLetter,
  onUpdateCoverLetter,
  onDeleteCoverLetter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<CoverLetter | null>(null);
  const [letterPrintItem, setLetterPrintItem] = useState<CoverLetter | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    selectedResidentKey: string;
    nomorSurat: string;
    tanggalSurat: string;
    nomorRumah: string;
    namaPemohon: string;
    nik: string;
    jenisKelamin: Gender;
    tempatLahir: string;
    tanggalLahir: string;
    agama: Religion;
    statusKawin: MaritalStatus;
    pekerjaan: string;
    noHp: string;
    alamatKtp: string;
    alamatDomisili: string;
    kategoriKeperluan: CoverLetter['kategoriKeperluan'];
    keperluan: string;
    keteranganLain: string;
    berlakuHingga: string;
  }>({
    selectedResidentKey: '',
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    nomorRumah: '',
    namaPemohon: '',
    nik: '',
    jenisKelamin: 'L',
    tempatLahir: 'Bogor',
    tanggalLahir: '1990-01-01',
    agama: 'Islam',
    statusKawin: 'Kawin',
    pekerjaan: 'Karyawan Swasta',
    noHp: '',
    alamatKtp: '',
    alamatDomisili: 'Perumahan Panorama Regency 3 Blok D, Rt.005 Dan Rw.005, Desa Situ Sari, Kec. Cileungsi, Kab. Bogor 16820',
    kategoriKeperluan: 'SKCK Kepolisian',
    keperluan: 'Pengurusan Surat Keterangan Catatan Kepolisian (SKCK) untuk melengkapi persyaratan administrasi pekerjaan.',
    keteranganLain: 'Yang bersangkutan adalah warga tetap beritikad baik dan tidak pernah tersangkut perkara kriminal/hukum.',
    berlakuHingga: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });

  const allResidents = getAllResidents(houses);

  const getCleanOfficerName = (rawName?: string): string => {
    if (!rawName) return currentUser ? currentUser.nama : 'Ali Ragil Permana';
    // Remove any parenthetical roles e.g. "Ali Ragil Permana (Ketua Paguyuban Blok D)" -> "Ali Ragil Permana"
    return rawName.replace(/\s*\([^)]*\)/g, '').trim() || rawName;
  };

  const getAutoLetterNumber = (dateStr: string) => {
    const targetYear = dateStr ? new Date(dateStr).getFullYear() || new Date().getFullYear() : new Date().getFullYear();
    const seqInfo = calculateNextLetterSequence({
      coverLetters,
      movedList,
      deceasedList,
      type: 'SP',
      year: targetYear
    });
    return formatLetterNumber({
      sequence: seqInfo.nextSequence,
      type: 'SP',
      unit: 'D',
      date: dateStr
    });
  };

  const handleOpenAddModal = () => {
    setEditingLetter(null);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const expiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    setFormState({
      selectedResidentKey: '',
      nomorSurat: getAutoLetterNumber(todayStr),
      tanggalSurat: todayStr,
      nomorRumah: 'Blok D1 No. 01',
      namaPemohon: '',
      nik: '',
      jenisKelamin: 'L',
      tempatLahir: 'Bogor',
      tanggalLahir: '1990-01-01',
      agama: 'Islam',
      statusKawin: 'Kawin',
      pekerjaan: 'Karyawan Swasta',
      noHp: '',
      alamatKtp: 'Perumahan Panorama Regency 3 Blok D1 No. 01, Rt.005 Dan Rw.005, Desa Situ Sari, Kec. Cileungsi, Kab. Bogor',
      alamatDomisili: 'Perumahan Panorama Regency 3 Blok D1 No. 01, Rt.005 Dan Rw.005, Desa Situ Sari, Kec. Cileungsi, Kab. Bogor',
      kategoriKeperluan: 'SKCK Kepolisian',
      keperluan: 'Pengurusan Surat Keterangan Catatan Kepolisian (SKCK) untuk keperluan kelengkapan berkas administrasi pekerjaan.',
      keteranganLain: 'Yang bersangkutan adalah warga beritikad baik dan tidak pernah tersangkut perkara kriminal/hukum di lingkungan kami.',
      berlakuHingga: expiry.toISOString().slice(0, 10)
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (letter: CoverLetter) => {
    setEditingLetter(letter);
    setFormState({
      selectedResidentKey: '',
      nomorSurat: letter.nomorSurat,
      tanggalSurat: letter.tanggalSurat,
      nomorRumah: letter.nomorRumah,
      namaPemohon: letter.namaPemohon,
      nik: letter.nik,
      jenisKelamin: letter.jenisKelamin,
      tempatLahir: letter.tempatLahir,
      tanggalLahir: letter.tanggalLahir,
      agama: letter.agama,
      statusKawin: letter.statusKawin,
      pekerjaan: letter.pekerjaan,
      noHp: letter.noHp || '',
      alamatKtp: letter.alamatKtp || letter.alamatDomisili,
      alamatDomisili: letter.alamatDomisili,
      kategoriKeperluan: letter.kategoriKeperluan || 'Lainnya',
      keperluan: letter.keperluan,
      keteranganLain: letter.keteranganLain || '',
      berlakuHingga: letter.berlakuHingga || ''
    });
    setIsModalOpen(true);
  };

  const handleSelectResident = (residentKey: string) => {
    if (!residentKey) return;
    const [houseId, residentId] = residentKey.split(':::');
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;

    const res = targetHouse.residents.find((r) => r.id === residentId);
    if (!res) return;

    const domisiliAddress = `Perumahan Panorama Regency 3 ${targetHouse.nomorRumah}, Rt.005 Dan Rw.005, Desa Situ Sari, Kec. Cileungsi, Kab. Bogor 16820`;

    setFormState((prev) => ({
      ...prev,
      selectedResidentKey: residentKey,
      nomorRumah: targetHouse.nomorRumah,
      namaPemohon: res.nama,
      nik: res.nik,
      jenisKelamin: res.jenisKelamin,
      tempatLahir: res.tempatLahir || 'Bogor',
      tanggalLahir: res.tanggalLahir || '1990-01-01',
      agama: res.agama || 'Islam',
      statusKawin: res.statusKawin || 'Kawin',
      pekerjaan: res.pekerjaan || 'Karyawan Swasta',
      noHp: res.noHp && res.noHp !== '-' ? res.noHp : prev.noHp,
      alamatKtp: res.statusKtp.includes('Sesuai Alamat') ? domisiliAddress : (res.alamatKtpLuar?.trim() || prev.alamatKtp || domisiliAddress),
      alamatDomisili: domisiliAddress
    }));
  };

  const handleSelectQuickPurpose = (purpose: typeof COMMON_PURPOSES[number]) => {
    setFormState((prev) => ({
      ...prev,
      kategoriKeperluan: purpose.category,
      keperluan: purpose.text
    }));
  };

  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.namaPemohon.trim()) {
      alert('Mohon isi nama lengkap pemohon surat!');
      return;
    }
    if (!formState.keperluan.trim()) {
      alert('Mohon isi maksud / keperluan surat pengantar!');
      return;
    }

    const now = new Date().toISOString();

    if (editingLetter) {
      const updated: CoverLetter = {
        ...editingLetter,
        nomorSurat: formState.nomorSurat.trim() || getAutoLetterNumber(formState.tanggalSurat),
        tanggalSurat: formState.tanggalSurat,
        nomorRumah: formState.nomorRumah.trim(),
        namaPemohon: formState.namaPemohon.trim(),
        nik: formState.nik.trim(),
        jenisKelamin: formState.jenisKelamin,
        tempatLahir: formState.tempatLahir.trim(),
        tanggalLahir: formState.tanggalLahir,
        agama: formState.agama,
        statusKawin: formState.statusKawin,
        pekerjaan: formState.pekerjaan.trim(),
        noHp: formState.noHp.trim(),
        alamatKtp: formState.alamatKtp.trim(),
        alamatDomisili: formState.alamatDomisili.trim(),
        kategoriKeperluan: formState.kategoriKeperluan,
        keperluan: formState.keperluan.trim(),
        keteranganLain: formState.keteranganLain.trim(),
        berlakuHingga: formState.berlakuHingga,
        petugasPembuat: currentUser ? currentUser.nama : (editingLetter.petugasPembuat ? getCleanOfficerName(editingLetter.petugasPembuat) : 'Ali Ragil Permana'),
        updatedAt: now
      };
      onUpdateCoverLetter(updated);
    } else {
      const newLetter: CoverLetter = {
        id: `surt-${Date.now()}`,
        nomorSurat: formState.nomorSurat.trim() || getAutoLetterNumber(formState.tanggalSurat),
        tanggalSurat: formState.tanggalSurat,
        nomorRumah: formState.nomorRumah.trim(),
        namaPemohon: formState.namaPemohon.trim(),
        nik: formState.nik.trim(),
        jenisKelamin: formState.jenisKelamin,
        tempatLahir: formState.tempatLahir.trim(),
        tanggalLahir: formState.tanggalLahir,
        agama: formState.agama,
        statusKawin: formState.statusKawin,
        pekerjaan: formState.pekerjaan.trim(),
        noHp: formState.noHp.trim(),
        alamatKtp: formState.alamatKtp.trim(),
        alamatDomisili: formState.alamatDomisili.trim(),
        kategoriKeperluan: formState.kategoriKeperluan,
        keperluan: formState.keperluan.trim(),
        keteranganLain: formState.keteranganLain.trim(),
        berlakuHingga: formState.berlakuHingga,
        petugasPembuat: currentUser ? currentUser.nama : 'Ali Ragil Permana',
        createdAt: now,
        updatedAt: now
      };
      onAddCoverLetter(newLetter);
    }

    setIsModalOpen(false);
  };

  const handlePrintDocument = (letter: CoverLetter) => {
    setLetterPrintItem(letter);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleCopyText = (letter: CoverLetter) => {
    const text = `*SURAT PENGANTAR Rt.005 Dan Rw.005 - BLOK D*\nNomor: ${letter.nomorSurat}\nTanggal: ${formatDateNamedMonth(letter.tanggalSurat)}\n\n*DATA PEMOHON:*\n• Nama: ${letter.namaPemohon}\n• NIK: ${letter.nik}\n• Tempat/Tgl Lahir: ${letter.tempatLahir}, ${formatDateNamedMonth(letter.tanggalLahir)}\n• Jenis Kelamin: ${letter.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}\n• Agama: ${letter.agama}\n• Status Kawin: ${letter.statusKawin}\n• Pekerjaan: ${letter.pekerjaan}\n• Alamat Domisili: ${letter.alamatDomisili}\n\n*MAKSUD / KEPERLUAN:*\n${letter.keperluan}\n\n*KETERANGAN:*\n${letter.keteranganLain || 'Warga berkelakuan baik dan berdomisili resmi di Panorama Regency 3 Blok D.'}\n\n_Pengurus Paguyuban Blok D - Panorama Regency 3 Situ Sari_`;
    navigator.clipboard.writeText(text);
    setCopiedId(letter.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const generateWhatsAppShare = (letter: CoverLetter) => {
    const text = `*SURAT PENGANTAR RESMI BLOK D - PANORAMA REGENCY 3*\nNomor: ${letter.nomorSurat}\n\nKepada Yth. Bapak/Ibu Petugas,\n\nDengan ini menerangkan bahwa warga kami:\n• Nama: *${letter.namaPemohon}*\n• NIK: ${letter.nik}\n• Rumah: ${letter.nomorRumah}\n• Keperluan: *${letter.keperluan}*\n\nTercatat sebagai warga resmi Blok D Panorama Regency 3 (Rt.005 Dan Rw.005 Desa Situ Sari). Surat fisik bertandatangan & cap basah siap diverifikasi. Terima kasih.`;
    return `https://wa.me/${letter.noHp ? letter.noHp.replace(/^0/, '62') : ''}?text=${encodeURIComponent(text)}`;
  };

  // Filtered Letters
  const filteredLetters = coverLetters.filter((letter) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      letter.namaPemohon.toLowerCase().includes(q) ||
      letter.nik.toLowerCase().includes(q) ||
      letter.nomorSurat.toLowerCase().includes(q) ||
      letter.nomorRumah.toLowerCase().includes(q) ||
      letter.keperluan.toLowerCase().includes(q);

    const matchCategory = filterCategory === 'all' || letter.kategoriKeperluan === filterCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Screen Management View (Hidden during print) */}
      <div className="space-y-6 print:hidden">
        {/* Top Banner & Action */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold border border-blue-400/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Layanan Administrasi Surat Warga</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pembuatan Surat Pengantar Warga
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
              Buat dan cetak surat pengantar resmi Blok D (Rt.005 Dan Rw.005) untuk berbagai keperluan warga (KTP, KK, SKCK, BPJS, Bank, Usaha, Nikah, Beasiswa, dll.) dalam format 1 lembar A4 siap print.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-950/50 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Surat Pengantar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Total Surat</span>
            <strong className="text-lg font-black text-slate-900">{coverLetters.length} Surat</strong>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">SKCK & Pekerjaan</span>
            <strong className="text-lg font-black text-slate-900">
              {coverLetters.filter((l) => l.kategoriKeperluan === 'SKCK Kepolisian').length}
            </strong>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">KTP / KK / BPJS</span>
            <strong className="text-lg font-black text-slate-900">
              {coverLetters.filter((l) => l.kategoriKeperluan === 'KTP / KK' || l.kategoriKeperluan === 'BPJS Kesehatan / Bansos').length}
            </strong>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Bank & Usaha</span>
            <strong className="text-lg font-black text-slate-900">
              {coverLetters.filter((l) => l.kategoriKeperluan === 'Bank / Finansial' || l.kategoriKeperluan === 'Keterangan Usaha (SKU)').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pemohon, NIK, nomor surat, atau keperluan..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Kategori:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="all">Semua Kategori ({coverLetters.length})</option>
            <option value="SKCK Kepolisian">SKCK Kepolisian</option>
            <option value="KTP / KK">KTP / KK</option>
            <option value="BPJS Kesehatan / Bansos">BPJS / Bansos</option>
            <option value="Bank / Finansial">Bank / Finansial</option>
            <option value="Keterangan Domisili">Keterangan Domisili</option>
            <option value="Keterangan Usaha (SKU)">Keterangan Usaha (SKU)</option>
            <option value="Pengantar Nikah">Pengantar Nikah</option>
            <option value="Pendidikan / Beasiswa">Pendidikan / Beasiswa</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Letters List / Cards */}
      {filteredLetters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Belum Ada Surat Pengantar</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
              {searchQuery || filterCategory !== 'all'
                ? 'Tidak ditemukan surat pengantar yang sesuai kata kunci pencarian.'
                : 'Klik tombol "+ Buat Surat Pengantar" di atas untuk membuat surat pengantar baru bagi warga.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
              }}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLetters.map((letter) => (
            <div
              key={letter.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all p-4 shadow-sm hover:shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {letter.kategoriKeperluan || 'Surat Pengantar'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        {letter.nomorSurat}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1">
                      {letter.namaPemohon}
                    </h3>
                  </div>

                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold shrink-0">
                    {letter.nomorRumah}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK Pemohon:</span>
                    <span className="font-mono font-semibold text-slate-800">{letter.nik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Terbit:</span>
                    <span className="font-medium text-slate-800">{formatDateNamedMonth(letter.tanggalSurat)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Maksud / Kebutuhan:</span>
                    <p className="font-semibold text-slate-900 line-clamp-2 leading-relaxed">
                      {letter.keperluan}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLetterPrintItem(letter);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title="Pratinjau & Cetak Surat 1 Lembar A4"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Surat A4</span>
                  </button>

                  <a
                    href={generateWhatsAppShare(letter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-semibold border border-emerald-200 transition-all"
                    title="Kirim Salinan ke WhatsApp Pemohon"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kirim WA</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyText(letter)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    title="Salin Teks Ringkasan Surat"
                  >
                    {copiedId === letter.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(letter)}
                    className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    title="Edit Data Surat"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(letter.id)}
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    title="Hapus Surat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Modal: Form Buat / Edit Surat Pengantar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {editingLetter ? 'Edit Surat Pengantar' : 'Form Buat Surat Pengantar Warga'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Administrasi Surat Pengantar Resmi Blok D (Rt.005 Dan Rw.005)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveLetter} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Quick Resident Auto-Fill Selector */}
              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Pilih Cepat dari Data Warga Terdaftar (Auto-Fill):
                  </span>
                  <span className="text-[10px] text-blue-700">Opsional</span>
                </div>
                <select
                  value={formState.selectedResidentKey}
                  onChange={(e) => handleSelectResident(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Pilih Warga Blok D untuk Isi Otomatis --</option>
                  {houses.map((h) =>
                    h.residents.map((r) => (
                      <option key={`${h.id}:::${r.id}`} value={`${h.id}:::${r.id}`}>
                        {r.nama} ({h.nomorRumah} - NIK: {r.nik}) - {r.hubunganKeluarga}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Letter Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">Nomor Surat Pengantar *</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      <Lock className="w-2.5 h-2.5 text-blue-600" />
                      Otomatis
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formState.nomorSurat}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 cursor-not-allowed select-all focus:outline-none"
                    title="Nomor surat digenerate otomatis berdasarkan agenda penomoran sistem dan tidak dapat diedit manual."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Nomor urut resmi berikutnya dari sistem (Format: [No]/SP/D/[Bulan]/[Tahun])
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Surat *</label>
                  <input
                    type="date"
                    required
                    value={formState.tanggalSurat}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormState((prev) => ({
                        ...prev,
                        tanggalSurat: newDate,
                        nomorSurat: !editingLetter ? getAutoLetterNumber(newDate) : prev.nomorSurat
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Rumah / Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Blok D1 No. 01"
                    value={formState.nomorRumah}
                    onChange={(e) => setFormState({ ...formState, nomorRumah: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Applicant Personal Data */}
              <div className="border border-slate-200 p-3.5 rounded-xl space-y-3 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Identitas Pemohon Surat
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Pemohon *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap sesuai KTP"
                      value={formState.namaPemohon}
                      onChange={(e) => setFormState({ ...formState, namaPemohon: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nomor Induk Kependudukan (NIK) *</label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="16 Digit NIK"
                      value={formState.nik}
                      onChange={(e) => setFormState({ ...formState, nik: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin *</label>
                    <select
                      value={formState.jenisKelamin}
                      onChange={(e) => setFormState({ ...formState, jenisKelamin: e.target.value as Gender })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Agama *</label>
                    <select
                      value={formState.agama}
                      onChange={(e) => setFormState({ ...formState, agama: e.target.value as Religion })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tempat Lahir *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bogor / Jakarta"
                      value={formState.tempatLahir}
                      onChange={(e) => setFormState({ ...formState, tempatLahir: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tanggal Lahir *</label>
                    <input
                      type="date"
                      required
                      value={formState.tanggalLahir}
                      onChange={(e) => setFormState({ ...formState, tanggalLahir: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Status Perkawinan *</label>
                    <select
                      value={formState.statusKawin}
                      onChange={(e) => setFormState({ ...formState, statusKawin: e.target.value as MaritalStatus })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Kawin">Kawin</option>
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Pekerjaan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Karyawan Swasta / Wiraswasta"
                      value={formState.pekerjaan}
                      onChange={(e) => setFormState({ ...formState, pekerjaan: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="Contoh: 081298765432"
                      value={formState.noHp}
                      onChange={(e) => setFormState({ ...formState, noHp: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Alamat Sesuai KTP *</label>
                    <textarea
                      rows={2}
                      required
                      value={formState.alamatKtp}
                      onChange={(e) => setFormState({ ...formState, alamatKtp: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Alamat Domisili Blok D *</label>
                    <textarea
                      rows={2}
                      required
                      value={formState.alamatDomisili}
                      onChange={(e) => setFormState({ ...formState, alamatDomisili: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Purpose & Needs */}
              <div className="border border-slate-200 p-3.5 rounded-xl space-y-3 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Maksud / Kebutuhan Pengantar Surat
                </h4>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Pilihan Cepat Keperluan Populer:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_PURPOSES.map((cp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuickPurpose(cp)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                          formState.kategoriKeperluan === cp.category && formState.keperluan === cp.text
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {cp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kategori Keperluan *</label>
                    <select
                      value={formState.kategoriKeperluan}
                      onChange={(e) =>
                        setFormState({ ...formState, kategoriKeperluan: e.target.value as CoverLetter['kategoriKeperluan'] })
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="SKCK Kepolisian">SKCK Kepolisian</option>
                      <option value="KTP / KK">KTP / KK</option>
                      <option value="BPJS Kesehatan / Bansos">BPJS Kesehatan / Bansos</option>
                      <option value="Bank / Finansial">Bank / Finansial</option>
                      <option value="Keterangan Domisili">Keterangan Domisili</option>
                      <option value="Keterangan Usaha (SKU)">Keterangan Usaha (SKU)</option>
                      <option value="Pengantar Nikah">Pengantar Nikah</option>
                      <option value="Pendidikan / Beasiswa">Pendidikan / Beasiswa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Masa Berlaku Hingga</label>
                    <input
                      type="date"
                      value={formState.berlakuHingga}
                      onChange={(e) => setFormState({ ...formState, berlakuHingga: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Deskripsi Lengkap Maksud / Kebutuhan Pemohon *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Jelaskan kebutuhan / tujuan pembuatan surat pengantar ini dengan rinci dan jelas..."
                      value={formState.keperluan}
                      onChange={(e) => setFormState({ ...formState, keperluan: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Catatan / Keterangan Tambahan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Warga berkelakuan baik dan tidak memiliki catatan kriminal/hukum."
                      value={formState.keteranganLain}
                      onChange={(e) => setFormState({ ...formState, keteranganLain: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-950/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingLetter ? 'Simpan Perubahan' : 'Terbitkan Surat Pengantar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pratinjau & Cetak Surat Pengantar 1 Lembar A4 */}
      {letterPrintItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden my-auto">
            {/* Header Dialog (Hidden on Print) */}
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">
                  Pratinjau Cetak Surat Pengantar (Standar 1 Lembar A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLetterPrintItem(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letter Paper Layout */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0">
              <div
                id="printable-cover-letter"
                className="max-w-[210mm] mx-auto border border-slate-300 p-6 sm:p-8 rounded-xl bg-white text-slate-900 space-y-4 sm:space-y-5 print:space-y-2.5 font-serif leading-relaxed print:leading-snug text-sm shadow-sm print:border-none print:p-0"
              >
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
                    <div className="text-xs sm:text-sm font-sans uppercase font-bold text-blue-800 tracking-wider">
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
                    SURAT PENGANTAR
                  </h2>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    Nomor: {letterPrintItem.nomorSurat}
                  </p>
                </div>

                {/* Body text */}
                <div className="space-y-3 print:space-y-2 text-xs font-sans text-slate-800 leading-normal print:leading-tight">
                  <p>
                    Yang bertanda tangan di bawah ini Pengurus Paguyuban Blok D bersama Ketua Rt.005 Dan Rw.005 Perumahan Panorama Regency 3, Desa Situ Sari, Kecamatan Cileungsi, Kabupaten Bogor, menerangkan dengan sebenarnya bahwa:
                  </p>

                  <div className="pl-2 sm:pl-4 font-sans">
                    <table className="w-full text-xs font-sans border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Nama Lengkap</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-bold text-slate-900 align-top">{letterPrintItem.namaPemohon}</td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">NIK / No. KTP</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-semibold text-slate-900 align-top">{letterPrintItem.nik}</td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Jenis Kelamin</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">
                            {letterPrintItem.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Tempat, Tanggal Lahir</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">
                            {letterPrintItem.tempatLahir}, {formatDateNamedMonth(letterPrintItem.tanggalLahir)}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Kewarganegaraan / Agama</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">WNI / {letterPrintItem.agama}</td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Status Perkawinan</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">{letterPrintItem.statusKawin}</td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Pekerjaan</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">{letterPrintItem.pekerjaan}</td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Alamat Sesuai KTP</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">
                            {letterPrintItem.alamatKtp || letterPrintItem.alamatDomisili}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top">Alamat Domisili</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-medium text-slate-900 align-top">
                            {letterPrintItem.alamatDomisili}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="pt-1 print:pt-0.5">
                    Adalah benar-benar warga yang bertempat tinggal di lingkungan kami dan sepanjang pengetahuan kami yang bersangkutan berkelakuan baik serta tidak tersangkut perkara pidana/tindakan melanggar hukum.
                  </p>

                  {/* Kebutuhan / Keperluan Block */}
                  <div className="p-2.5 print:p-2 bg-slate-50 border border-slate-300 rounded-lg">
                    <table className="w-full text-xs font-sans border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-44 sm:w-48 py-0.5 font-bold text-slate-900 align-top">Maksud / Keperluan</td>
                          <td className="w-4 py-0.5 font-bold text-slate-900 align-top text-center">:</td>
                          <td className="py-0.5 font-bold text-slate-900 align-top">{letterPrintItem.keperluan}</td>
                        </tr>
                        {letterPrintItem.keteranganLain && (
                          <tr>
                            <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top text-[11px]">Keterangan Lain</td>
                            <td className="w-4 py-0.5 text-slate-700 align-top text-center text-[11px]">:</td>
                            <td className="py-0.5 text-slate-700 align-top text-[11px]">{letterPrintItem.keteranganLain}</td>
                          </tr>
                        )}
                        {letterPrintItem.berlakuHingga && (
                          <tr>
                            <td className="w-44 sm:w-48 py-0.5 text-slate-700 align-top text-[11px]">Masa Berlaku</td>
                            <td className="w-4 py-0.5 text-slate-700 align-top text-center text-[11px]">:</td>
                            <td className="py-0.5 text-slate-700 align-top text-[11px]">Berlaku s/d {formatDateNamedMonth(letterPrintItem.berlakuHingga)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <p className="pt-1 print:pt-0.5">
                    Demikian Surat Pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
                  </p>
                </div>

                {/* Tanggal di Posisi Atas Kanan Tanda Tangan */}
                <div className="flex justify-end text-xs font-sans text-slate-800 pt-2 pb-1 print:pt-1 print:pb-0.5">
                  <div>Situ Sari, {formatDateNamedMonth(letterPrintItem.tanggalSurat)}</div>
                </div>

                {/* Signature Block - 4 Separate Columns */}
                <div className="grid grid-cols-4 text-center text-xs font-sans text-slate-900 gap-2 pt-1 print:pt-0.5">
                  <div className="space-y-12 sm:space-y-14 print:space-y-10 flex flex-col justify-between">
                    <div>
                      <strong>Ketua RW 005</strong>
                    </div>
                    <div>
                      <div className="font-bold underline text-[11px]">
                        ( .............................. )
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12 sm:space-y-14 print:space-y-10 flex flex-col justify-between">
                    <div>
                      <strong>Ketua RT 005</strong>
                    </div>
                    <div>
                      <div className="font-bold underline text-[11px]">
                        ( .............................. )
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12 sm:space-y-14 print:space-y-10 flex flex-col justify-between">
                    <div>
                      <strong>Pengurus Blok D</strong>
                    </div>
                    <div>
                      <div className="font-bold underline text-[11px] uppercase">
                        ( {getCleanOfficerName(letterPrintItem.petugasPembuat)} )
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12 sm:space-y-14 print:space-y-10 flex flex-col justify-between">
                    <div>
                      <strong>Pemohon / Warga</strong>
                    </div>
                    <div>
                      <div className="font-bold underline text-[11px] uppercase">
                        ( {letterPrintItem.namaPemohon} )
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Surat */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn print:hidden">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Surat Pengantar?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data surat pengantar ini dari arsip sistem?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCoverLetter(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-950/20 transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
