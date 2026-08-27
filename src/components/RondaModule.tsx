import React, { useState } from 'react';
import {
  Shield,
  Clock,
  MapPin,
  Users,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Calendar,
  Sparkles,
  Radio,
  FileCheck,
  UserCheck,
  Printer,
  Share2,
  Plus,
  Edit2,
  X,
  Search,
  Check,
  Copy,
  Shuffle,
  Info,
  CalendarDays,
  ShieldCheck,
  BadgeCheck,
  HelpCircle,
  RotateCcw,
  Bell,
  ShieldAlert
} from 'lucide-react';
import { AuthUser, RondaAttendance, HouseUnit, RondaSchedule } from '../types/census';
import { BLOK_LIST } from '../data/masterHouseList';
import { INITIAL_RONDA_SCHEDULE } from '../data/initialData';
import { formatDateIndo } from '../utils/censusHelpers';
import { LogoBlokD } from './LogoBlokD';

interface RondaModuleProps {
  currentUser: AuthUser | null;
  houses: HouseUnit[];
  rondaSchedule: RondaSchedule[];
  attendances: RondaAttendance[];
  onAddAttendance: (attendance: RondaAttendance) => void;
  onDeleteAttendance?: (id: string) => void;
  onUpdateSchedule?: (schedules: RondaSchedule[]) => void;
}

type RondaSubTab = 'jadwal' | 'presensi' | 'riwayat' | 'pos' | 'kontak' | 'cetak';

const KORLAP_LIST = [
  { nama: 'Romadhoni', jabatan: 'Korlap Blok D1 Depan', noHp: '0812-8877-6655', blok: 'Blok D1', noRumah: 'D1/01' },
  { nama: 'Yongki', jabatan: 'Korlap Blok D1 Belakang', noHp: '0813-9988-7766', blok: 'Blok D1', noRumah: 'D1/08' },
  { nama: 'Satria', jabatan: 'Korlap Blok D2 Depan', noHp: '0857-1199-8822', blok: 'Blok D2', noRumah: 'D2/01' },
  { nama: 'Rizki Saputra', jabatan: 'Korlap Blok D2 Belakang, D3 & D4', noHp: '0878-8833-2211', blok: 'Blok D2, D3, D4', noRumah: 'D2/09' },
  { nama: 'Ali Ragil Permana', jabatan: 'Ketua Blok D / Sie Keamanan', noHp: '0812-1122-8844', blok: 'Pengurus RT', noRumah: 'D1/02' },
  { nama: 'Wily Gunawan', jabatan: 'Sekretaris RT / Admin Sistem', noHp: '0812-3456-7890', blok: 'Pengurus RT', noRumah: 'D1/06' },
];

const EMERGENCY_CONTACTS = [
  { instansi: 'Polsek Cileungsi', kategori: 'Kepolisian', nomor: '(021) 8230-110', keterangan: 'Siaga 24 Jam Darurat / Kamtibmas' },
  { instansi: 'Bhabinkamtibmas Situ Sari', kategori: 'Aparat Pembina Desa', nomor: '0813-8899-0011', keterangan: 'Aiptu Budi / Wilayah Situ Sari' },
  { instansi: 'Babinsa Koramil Cileungsi', kategori: 'TNI AD Desa', nomor: '0852-7788-9900', keterangan: 'Serka Ahmad / Keamanan Wilayah' },
  { instansi: 'Pos Security Gerbang Utama PR3', kategori: 'Keamanan Perumahan', nomor: '0819-2233-4455', keterangan: 'Pos Gerbang Utama Panorama Regency 3' },
  { instansi: 'Damkar / Pemadam Kebakaran Cileungsi', kategori: 'Kebakaran & Bencana', nomor: '(021) 8249-1113', keterangan: 'Unit Sektor Cileungsi' },
  { instansi: 'Ambulans Puskesmas Cileungsi', kategori: 'Medis / Darurat Kesehatan', nomor: '119 / (021) 8249-3322', keterangan: 'Layanan Ambulans 24 Jam' },
];

const POS_JAGA_LIST = [
  {
    nomor: '1',
    nama: 'Pos 1: Pos Kamling Utama Blok D',
    lokasi: 'Pertigaan Masuk Utama Blok D1 & D2',
    fokus: 'Pintu gerbang utama, kontrol portal masuk, monitor kendaraan keluar-masuk, dan pusat koordinasi HT.',
    waktu: '22.00 - 04.00 WIB (Khusus Sabtu Malam)',
    perlengkapan: 'Buku Tamu, Senter Sorot, Tongkat T, Kentongan, Kotak P3K, Rompi Reflektor'
  },
  {
    nomor: '2',
    nama: 'Pos 2: Jalur Tengah & Lapangan Blok D2',
    lokasi: 'Area Taman & Lapangan Blok D2',
    fokus: 'Patroli gang D2, cek penerangan jalan lingkungan, pemantauan rumah kosong dan kendaraan terparkir di luar pagar.',
    waktu: '22.30 - 03.30 WIB',
    perlengkapan: 'Senter, Tongkat Patroli, HT'
  },
  {
    nomor: '3',
    nama: 'Pos 3: Titik Pantau Belakang (D3 & D4)',
    lokasi: 'Tembok Pembatas Ujung Blok D3 & D4',
    fokus: 'Pagar pembatas luar perumahan dengan perkebunan/area luar, kontrol lampu penerangan sudut belakang.',
    waktu: '23.00 - 04.00 WIB',
    perlengkapan: 'Senter Sorot Jarak Jauh, Tongkat'
  },
];

const KENTONGAN_CODES = [
  { ketukan: '1x Ketukan Teratur Tiap Jam', arti: 'Tanda Keadaan Lingkungan AMAN Terkendali (Dibunyikan pukul 24.00, 02.00, 04.00)' },
  { ketukan: '2x Ketukan Cepat Berulang (•• ••)', arti: 'Tanda Ada Pencurian / Orang Mencurigakan di Lingkungan' },
  { ketukan: '3x Ketukan Cepat Berulang (••• •••)', arti: 'Tanda Ada Kebakaran / Korsleting Listrik' },
  { ketukan: '4x Ketukan Cepat Berulang (•••• ••••)', arti: 'Tanda Ada Bencana Alam (Pohon Tumbang, Banjir, Tanggul)' },
  { ketukan: 'Ketukan Bertubi-tubi Tanpa Henti (Doro-doro)', arti: 'Tanda BAHAYA BESAR / Seluruh Warga Diharap Segera Keluar Rumah & Berkumpul di Pos' }
];

export const RondaModule: React.FC<RondaModuleProps> = ({
  currentUser,
  houses,
  rondaSchedule,
  attendances,
  onAddAttendance,
  onDeleteAttendance,
  onUpdateSchedule
}) => {
  const isGuest = currentUser?.isGuest || currentUser?.role === 'warga';
  const [activeSubTab, setActiveSubTab] = useState<RondaSubTab>('jadwal');

  // Form check-in state
  const [formNama, setFormNama] = useState(currentUser?.nama && !currentUser.isGuest ? currentUser.nama : '');
  const [formNomorRumah, setFormNomorRumah] = useState('');
  const [formBlok, setFormBlok] = useState<'D1' | 'D2' | 'D3' | 'D4'>('D1');
  const [formPos, setFormPos] = useState('Pos Kamling Utama Blok D');
  const [formKeterangan, setFormKeterangan] = useState('Hadir Siap Jaga Malam');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Filter & Search Riwayat
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');

  // Modal Edit Jadwal (Admin/Pengurus)
  const [editingSchedule, setEditingSchedule] = useState<RondaSchedule | null>(null);
  const [editHari, setEditHari] = useState('');
  const [editKetuaRegu, setEditKetuaRegu] = useState('');
  const [editPosJaga, setEditPosJaga] = useState('');
  const [editJamMulai, setEditJamMulai] = useState('22:00');
  const [editJamSelesai, setEditJamSelesai] = useState('04:00');
  const [editCatatan, setEditCatatan] = useState('');
  const [editPetugasList, setEditPetugasList] = useState<{ nama: string; blok: string; noHp: string; nomorRumah?: string }[]>([]);

  // Current date info
  const today = new Date();
  const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNamesIndo[today.getDay()];
  const isTodaySaturday = today.getDay() === 6;
  const isTodaySundayNight = today.getDay() === 0; // Minggu pagi lanjutan ronda sabtu
  const todayDateStr = today.toISOString().split('T')[0];

  // Calculate which Saturday of the month it is (1st, 2nd, 3rd, 4th, 5th Saturday)
  const getSaturdayWeekOfMonth = (d: Date): number => {
    const dayOfMonth = d.getDate();
    return Math.ceil(dayOfMonth / 7);
  };
  const currentWeekSaturday = getSaturdayWeekOfMonth(today);

  // Ensure schedules are formatted for Saturday
  const effectiveSchedules = rondaSchedule.length > 0 && rondaSchedule.some(s => s && s.hari && typeof s.hari === 'string' && s.hari.toLowerCase().includes('sabtu'))
    ? rondaSchedule
    : INITIAL_RONDA_SCHEDULE;

  const currentSaturdaySchedule = effectiveSchedules.find(s => s.pekan === currentWeekSaturday) || effectiveSchedules[0];
  const todayAttendanceList = attendances.filter((a) => a.tanggal === todayDateStr);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Helper to extract eligible residents from current registered houses census
  const getEligibleResidents = (): { nama: string; blok: string; noHp: string; nomorRumah: string }[] => {
    const list: { nama: string; blok: string; noHp: string; nomorRumah: string }[] = [];
    const seenNames = new Set<string>();

    houses.forEach((house) => {
      const blockMatch = house.nomorRumah ? house.nomorRumah.match(/D[1-4]/i) : null;
      const blokName = blockMatch ? `Blok ${blockMatch[0].toUpperCase()}` : (house.blok ? `Blok ${house.blok}` : 'Blok D');
      const noRumah = house.nomorRumah || '';
      const housePhone = house.kontakDarurat?.noHp || house.nomorTelepon || '';

      if (house.residents && house.residents.length > 0) {
        house.residents.forEach((r) => {
          const isAdult = !r.usia || r.usia >= 17;
          const isMale = r.jenisKelamin === 'Laki-Laki';
          const isHead = r.hubunganKeluarga === 'Kepala Keluarga' || r.hubunganKeluarga === 'Suami';

          if ((isHead || isMale) && isAdult && r.nama && r.nama.trim()) {
            const key = r.nama.trim().toLowerCase();
            if (!seenNames.has(key)) {
              seenNames.add(key);
              list.push({
                nama: r.nama.trim(),
                blok: blokName,
                noHp: r.noHp || housePhone || '-',
                nomorRumah: noRumah
              });
            }
          }
        });
      }

      if (house.kepalaKeluargaNama && house.kepalaKeluargaNama.trim()) {
        const key = house.kepalaKeluargaNama.trim().toLowerCase();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          list.push({
            nama: house.kepalaKeluargaNama.trim(),
            blok: blokName,
            noHp: housePhone || '-',
            nomorRumah: noRumah
          });
        }
      }
    });

    return list;
  };

  // Randomize officers for a specific Saturday based on current registered residents
  const handleRandomizeSingleSchedule = (scheduleIndex: number) => {
    if (!onUpdateSchedule) return;
    const pool = [...getEligibleResidents()];
    if (pool.length === 0) {
      alert('Belum ada data warga terdaftar di database sensus saat ini. Silakan input data warga terlebih dahulu pada menu Sensus.');
      return;
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Pick up to 7 (or all available if pool < 7)
    const teamCount = Math.min(7, pool.length);
    const selected: typeof pool = [];
    for (let i = 0; i < teamCount; i++) {
      selected.push(pool[i]);
    }

    const updatedSchedules = [...effectiveSchedules];
    const target = updatedSchedules[scheduleIndex];

    if (target) {
      updatedSchedules[scheduleIndex] = {
        ...target,
        ketuaRegu: selected.length > 0 ? `Bpk. ${selected[0].nama} (${selected[0].nomorRumah || selected[0].blok})` : 'Belum ditentukan',
        petugas: selected
      };
      onUpdateSchedule(updatedSchedules);
      showToast(`🎲 Berhasil mengacak ${selected.length} petugas dari data warga saat ini untuk ${target.hari}!`);
    }
  };

  // Randomize ALL Saturday schedules (Pekan 1 s/d 5) fairly with up to 7 people each from current resident pool
  const handleRandomizeAllSchedules = () => {
    if (!onUpdateSchedule) return;
    const pool = [...getEligibleResidents()];
    if (pool.length === 0) {
      alert('Belum ada data warga terdaftar di database sensus saat ini. Silakan input data warga terlebih dahulu pada menu Sensus.');
      return;
    }

    if (!confirm(`Acak otomatis jadwal ronda Sabtu dari ${pool.length} warga yang terdaftar saat ini?`)) return;

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const updatedSchedules: RondaSchedule[] = effectiveSchedules.map((sch, idx) => {
      const teamCount = Math.min(7, pool.length);
      const startIdx = (idx * teamCount) % pool.length;
      const team: { nama: string; blok: string; noHp: string; nomorRumah: string }[] = [];

      for (let k = 0; k < teamCount; k++) {
        const person = pool[(startIdx + k) % pool.length];
        if (person) {
          team.push({ ...person });
        }
      }

      return {
        ...sch,
        ketuaRegu: team.length > 0 ? `Bpk. ${team[0].nama} (${team[0].nomorRumah || team[0].blok})` : 'Belum ditentukan',
        petugas: team
      };
    });

    onUpdateSchedule(updatedSchedules);
    showToast(`🎲 Berhasil mengacak petugas dari ${pool.length} warga saat ini untuk seluruh jadwal Sabtu!`);
  };

  // Kosongkan semua susunan petugas ronda
  const handleClearAllSchedules = () => {
    if (!onUpdateSchedule) return;
    if (confirm('Kosongkan semua susunan petugas pada seluruh jadwal ronda Sabtu?')) {
      const cleared: RondaSchedule[] = effectiveSchedules.map((sch) => ({
        ...sch,
        ketuaRegu: 'Belum ditentukan',
        petugas: []
      }));
      onUpdateSchedule(cleared);
      showToast('Seluruh daftar petugas ronda berhasil dikosongkan.');
    }
  };

  // Reset to initial clean schedule
  const handleResetToDefault = () => {
    if (!onUpdateSchedule) return;
    if (confirm('Kembalikan susunan jadwal ronda Sabtu ke pengaturan bersih awal?')) {
      onUpdateSchedule(INITIAL_RONDA_SCHEDULE);
      showToast('Jadwal ronda berhasil direset.');
    }
  };

  // Check-In Submit
  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNomorRumah.trim()) {
      alert('Mohon isi nama lengkap dan nomor rumah Blok D.');
      return;
    }

    setIsSubmitting(true);
    const newRecord: RondaAttendance = {
      id: 'ronda-' + Date.now(),
      tanggal: todayDateStr,
      nama: formNama.trim(),
      nomorRumah: `${formBlok}/${formNomorRumah.trim()}`,
      jamHadir: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      posJaga: formPos,
      keterangan: formKeterangan.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddAttendance(newRecord);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  // Open Edit Modal
  const handleOpenEditSchedule = (sch: RondaSchedule) => {
    setEditingSchedule(sch);
    setEditHari(sch.hari);
    setEditKetuaRegu(sch.ketuaRegu);
    setEditPosJaga(sch.posJaga || 'Pos Kamling Utama Blok D & Patroli Gang D1-D4');
    setEditJamMulai(sch.jamMulai || '22:00');
    setEditJamSelesai(sch.jamSelesai || '04:00');
    setEditCatatan(sch.catatan || '');

    // Initialize 7 slots cleanly without dummy names
    const currentList = (sch.petugas || []).map((p) => ({
      nama: p.nama || '',
      blok: p.blok || 'Blok D1',
      noHp: p.noHp || '',
      nomorRumah: p.nomorRumah || ''
    }));
    while (currentList.length < 7) {
      currentList.push({
        nama: '',
        blok: 'Blok D1',
        noHp: '',
        nomorRumah: ''
      });
    }
    setEditPetugasList(currentList.slice(0, 7));
  };

  // Change individual slot in Edit Modal
  const handleUpdateSlot = (index: number, field: string, value: string) => {
    setEditPetugasList((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value
      };
      return next;
    });
  };

  // Pick resident into slot
  const handlePickResidentIntoSlot = (index: number, residentName: string) => {
    if (!residentName) return;
    const all = getEligibleResidents();
    const found = all.find(r => r.nama === residentName);
    if (found) {
      setEditPetugasList((prev) => {
        const next = [...prev];
        next[index] = {
          nama: found.nama,
          blok: found.blok,
          noHp: found.noHp,
          nomorRumah: found.nomorRumah
        };
        return next;
      });
    }
  };

  // Save Modal Changes
  const handleSaveScheduleModal = () => {
    if (!editingSchedule || !onUpdateSchedule) return;

    // Filter slots with actual names or keep them
    const validPetugas = editPetugasList.filter(p => p.nama && p.nama.trim() !== '');

    const updated: RondaSchedule = {
      ...editingSchedule,
      hari: editHari.trim() || editingSchedule.hari,
      ketuaRegu: editKetuaRegu.trim() || (validPetugas.length > 0 ? `Bpk. ${validPetugas[0].nama}` : 'Belum ditentukan'),
      posJaga: editPosJaga.trim() || 'Pos Kamling Utama Blok D & Patroli Gang D1-D4',
      jamMulai: editJamMulai,
      jamSelesai: editJamSelesai,
      catatan: editCatatan.trim(),
      petugas: validPetugas
    };

    const nextSchedules = effectiveSchedules.map((s) => (s.hari === editingSchedule.hari || s.pekan === editingSchedule.pekan ? updated : s));
    onUpdateSchedule(nextSchedules);
    setEditingSchedule(null);
    showToast(`Perubahan jadwal ${updated.hari} berhasil disimpan!`);
  };

  // WhatsApp Share Generator
  const generateWhatsAppBroadcast = () => {
    const activeSch = currentSaturdaySchedule;
    const lines = [
      `🛡️ *JADWAL RESMI SISKAMLING & RONDA MALAM MINGGU*`,
      `*PAGUYUBAN BLOK D - PANORAMA REGENCY 3*`,
      `Rt.005 Dan Rw.005 Desa Situ Sari, Cileungsi`,
      `----------------------------------------`,
      `📅 *Jadwal:* ${activeSch?.hari || 'Sabtu Malam (Malam Minggu)'}`,
      `⏰ *Waktu Jaga:* ${activeSch?.jamMulai || '22:00'} - ${activeSch?.jamSelesai || '04:00'} WIB`,
      `📍 *Titik Pos:* ${activeSch?.posJaga || 'Pos Kamling Utama Blok D'}`,
      `👮 *Ketua Regu:* ${activeSch?.ketuaRegu || 'Bpk. Korlap Blok D'}`,
      ``,
      `👥 *DAFTAR 7 PETUGAS PIKET SABTU MALAM INI:*`
    ];

    if (activeSch?.petugas && activeSch.petugas.length > 0) {
      activeSch.petugas.forEach((p, idx) => {
        const roleLabel = idx === 0 ? '👑 [Ketua Regu]' : `[Anggota ${idx + 1}]`;
        lines.push(`${idx + 1}. *${p.nama}* (${p.nomorRumah || p.blok}) - ${p.noHp} ${roleLabel}`);
      });
    }

    lines.push(``);
    lines.push(`📋 *Presensi Kehadiran Terkini:* ${todayAttendanceList.length} Petugas Hadir di Pos`);
    todayAttendanceList.forEach((att, idx) => {
      lines.push(`  ✓ ${att.nama} (${att.nomorRumah}) - Pkl ${att.jamHadir} WIB`);
    });

    lines.push(``);
    lines.push(`⚠️ *Himbauan Keamanan:*`);
    lines.push(`1. Harap hadir tepat waktu di pos ronda pukul 22.00 WIB.`);
    lines.push(`2. Portal lingkungan ditutup mulai pukul 23.00 WIB.`);
    lines.push(`3. Jika berhalangan hadir, harap konfirmasi ke Ketua Regu atau Korlap Blok.`);
    lines.push(``);
    lines.push(`Terima kasih atas partisipasi aktif warga menjaga keamanan Blok D! 🙏🛡️`);
    return lines.join('\n');
  };

  // Filtered Riwayat Attendance
  const filteredAttendances = attendances.filter((att) => {
    const matchesSearch =
      att.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.nomorRumah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.keterangan || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = filterTanggal ? att.tanggal === filterTanggal : true;
    return matchesSearch && matchesDate;
  });

  const allEligible = getEligibleResidents();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 1. Header Banner Modul Ronda Khusus Sabtu / Malam Minggu */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-7 rounded-2xl border border-blue-900/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-bold text-amber-300">
                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                <span>Jadwal Khusus: Setiap Hari Sabtu / Malam Minggu</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Kapasitas: 7 Petugas / Sabtu
              </span>
              {isTodaySaturday ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/30 text-rose-300 border border-rose-400/40 animate-pulse flex items-center gap-1">
                  <Radio className="w-3 h-3 text-rose-400" />
                  Malam Minggu Aktif Hari Ini!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                  Hari ini: {todayDayName}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>Siskamling &amp; Jadwal Ronda Sabtu (Malam Minggu)</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Jadwal siskamling rutin warga Blok D (D1, D2, D3, D4) yang dilaksanakan <strong className="text-amber-300">hanya setiap hari Sabtu malam (malam Minggu)</strong> dengan kuota <strong className="text-emerald-300">7 petugas piket per Sabtu</strong>, dilengkapi fitur acak petugas otomatis dan pengeditan fleksibel.
            </p>
          </div>

          {/* Quick Action Button Box */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-xl shrink-0 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Piket Sabtu Pekan Ini</div>
              <div className="text-sm font-bold text-white mt-0.5 truncate max-w-[200px]">
                {currentSaturdaySchedule?.ketuaRegu || 'Regu Sabtu'}
              </div>
              <div className="text-[11px] text-amber-400 font-medium flex items-center justify-center sm:justify-start gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>22.00 - 04.00 WIB (7 Orang)</span>
              </div>
            </div>

            {!isGuest && onUpdateSchedule && (
              <div className="sm:border-l sm:border-slate-700 sm:pl-3 flex flex-col gap-1.5 w-full sm:w-auto">
                <button
                  onClick={handleRandomizeAllSchedules}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                  title="Acak 7 Petugas untuk seluruh jadwal Sabtu"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Acak Semua Jadwal</span>
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                  title="Kembalikan ke standar awal"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Bawaan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('jadwal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'jadwal'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Ronda Sabtu (7 Orang)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('presensi')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'presensi'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Presensi Malam Ini</span>
          {todayAttendanceList.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeSubTab === 'presensi' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {todayAttendanceList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('riwayat')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'riwayat'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Riwayat Presensi ({attendances.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'pos'
              ? 'bg-amber-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Pos Jaga & Sandi Kentongan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kontak')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'kontak'
              ? 'bg-rose-600 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Kontak Darurat & Korlap</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cetak')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'cetak'
              ? 'bg-slate-800 text-white shadow-sm font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Jadwal A4</span>
        </button>
      </div>

      {/* 3. SUBTAB CONTENT: JADWAL RONDA SABTU (7 ORANG PETUGAS) */}
      {activeSubTab === 'jadwal' && (
        <div className="space-y-6">
          {/* Quick Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  Rotasi Bulanan (Pekan 1 s/d 5)
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Total {allEligible.length} Warga Terdaftar di Sistem
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                Jadwal Ronda Siskamling Khusus Hari Sabtu (Malam Minggu)
              </h3>
              <p className="text-xs text-slate-500">
                Setiap regu piket beranggotakan <strong className="text-slate-800 font-bold">tepat 7 orang warga</strong> (1 Ketua Regu + 6 Anggota) bertugas pukul 22.00 - 04.00 WIB.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!isGuest && onUpdateSchedule && (
                <>
                  <button
                    onClick={handleRandomizeAllSchedules}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                    title="Acak otomatis petugas ronda dari data sensus warga saat ini"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Acak dari Data Warga</span>
                  </button>
                  <button
                    onClick={handleClearAllSchedules}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    title="Kosongkan seluruh petugas dari jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Kosongkan Petugas</span>
                  </button>
                </>
              )}
              <button
                onClick={() => handleCopy(generateWhatsAppBroadcast(), 'wa-schedule')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                {copiedText === 'wa-schedule' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedText === 'wa-schedule' ? 'Tersalin!' : 'Bagikan ke WhatsApp'}</span>
              </button>
              <button
                onClick={() => setActiveSubTab('cetak')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak A4</span>
              </button>
            </div>
          </div>

          {/* Grid Jadwal 5 Pekan Sabtu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {effectiveSchedules.map((sch, schIdx) => {
              const isCurrentWeek = sch.pekan === currentWeekSaturday;

              return (
                <div
                  key={sch.hari || schIdx}
                  className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 ${
                    isCurrentWeek && isTodaySaturday
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20 bg-emerald-50/10'
                      : 'border-slate-200 shadow-sm hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Card Jadwal */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center text-sm">
                          S{sch.pekan || schIdx + 1}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                            <span>{sch.hari}</span>
                            {isCurrentWeek && isTodaySaturday && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full animate-pulse">
                                Bertugas Malam Ini
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 font-mono text-slate-700">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {sch.jamMulai || '22:00'} - {sch.jamSelesai || '04:00'} WIB
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold font-mono">7 Orang Petugas</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons per Card */}
                      {!isGuest && onUpdateSchedule && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRandomizeSingleSchedule(schIdx)}
                            className="p-2 text-amber-700 hover:bg-amber-50 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Acak 7 Petugas untuk Sabtu ini saja"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Acak</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditSchedule(sch)}
                            className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Edit Susunan 7 Petugas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Ketua Regu & Lokasi */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Ketua Regu / Penanggung Jawab:</span>
                        <span className="font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md text-[11px]">
                          {sch.ketuaRegu || 'Bpk. Korlap Blok D'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{sch.posJaga || 'Pos Kamling Utama Blok D'}</span>
                        </span>
                        {sch.catatan && (
                          <span className="text-slate-400 italic truncate max-w-[160px]">{sch.catatan}</span>
                        )}
                      </div>
                    </div>

                    {/* 7 Daftar Petugas Piket */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Susunan 7 Petugas Ronda:</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono font-normal">Slot 1 s/d 7</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {sch.petugas && sch.petugas.length > 0 ? (
                          sch.petugas.slice(0, 7).map((pet, idx) => {
                            const isKetua = idx === 0;
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                  isKetua
                                    ? 'bg-blue-50/60 border-blue-200 font-semibold'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                      isKetua ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div className="truncate">
                                    <div className="font-bold text-slate-900 truncate text-[11px]">
                                      {pet.nama}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                      <span>{pet.nomorRumah ? `${pet.blok}/${pet.nomorRumah}` : pet.blok}</span>
                                      {isKetua && (
                                        <span className="text-blue-700 font-bold text-[9px] bg-blue-100 px-1 rounded">
                                          Ketua
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <span className="text-[10px] font-mono text-slate-500 shrink-0 font-medium">
                                  {pet.noHp || '-'}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
                            Belum ada susunan 7 petugas. Klik &quot;Acak&quot; atau &quot;Edit&quot; untuk mengisi.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SUBTAB CONTENT: PRESENSI MALAM INI */}
      {activeSubTab === 'presensi' && (
        <div className="space-y-6">
          {/* Status Bar Malam Ini */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isTodaySaturday
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                isTodaySaturday ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <strong className="block font-extrabold text-sm">
                  {isTodaySaturday
                    ? `🛡️ Siskamling Malam Minggu Aktif! (${todayAttendanceList.length} Petugas Hadir)`
                    : `ℹ️ Jadwal Rutin Ronda adalah Setiap Hari Sabtu / Malam Minggu (Hari ini: ${todayDayName})`}
                </strong>
                <span className="text-[11px] opacity-90">
                  Petugas piket yang tiba di pos ronda dapat mengisi presensi digital di bawah ini.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(generateWhatsAppBroadcast(), 'wa-presensi')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all text-xs"
              >
                {copiedText === 'wa-presensi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'wa-presensi' ? 'Tersalin!' : 'Salin Laporan WA'}</span>
              </button>
            </div>
          </div>

          {/* Form Check-In & Daftar Hadir Malam Ini */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Check-In Ronda (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Form Presensi Kehadiran Ronda Malam
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Petugas piket / warga yang hadir mengisi presensi kedatangan di pos
                  </p>
                </div>
              </div>

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Presensi siskamling berhasil dicatat ke cloud database. Terima kasih atas dedikasinya!</span>
                </div>
              )}

              <form onSubmit={handleCheckIn} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nama Lengkap Petugas / Warga <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Romadhoni / Bpk. Joko"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-medium text-slate-900 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Blok <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formBlok}
                      onChange={(e) => setFormBlok(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-medium text-slate-900"
                    >
                      {BLOK_LIST.map((b) => (
                        <option key={b} value={b}>
                          Blok {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      No. Rumah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formNomorRumah}
                      onChange={(e) => setFormNomorRumah(e.target.value)}
                      placeholder="Contoh: 05 / 12A"
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-medium text-slate-900 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Pos / Titik Jaga
                  </label>
                  <select
                    value={formPos}
                    onChange={(e) => setFormPos(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-medium text-slate-900"
                  >
                    <option value="Pos Kamling Utama Blok D">Pos Kamling Utama Blok D</option>
                    <option value="Pos 2: Jalur Tengah / Lapangan D2">Pos 2: Jalur Tengah / Lapangan D2</option>
                    <option value="Pos 3: Area Belakang D3 & D4">Pos 3: Area Belakang D3 & D4</option>
                    <option value="Patroli Keliling Mobile Gang D1-D4">Patroli Keliling Mobile Gang D1-D4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Catatan / Kondisi Keamanan
                  </label>
                  <input
                    type="text"
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    placeholder="Contoh: Hadir Siap Jaga Malam / Portal Terkunci Aman"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-medium text-slate-900 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Kirim Presensi Kehadiran Ronda'}</span>
                </button>
              </form>
            </div>

            {/* Daftar Kehadiran Warga Malam Ini (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Daftar Warga Hadir Ronda (Malam Ini)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {todayDayName}, {formatDateIndo(todayDateStr)}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
                  {todayAttendanceList.length} Warga Hadir
                </span>
              </div>

              {todayAttendanceList.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">Belum ada presensi ronda untuk malam ini</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Silakan isi form presensi saat Anda tiba di pos ronda untuk mencatat kehadiran siskamling lingkungan.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {todayAttendanceList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                          {item.nama.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{item.nama}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {item.nomorRumah}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="text-emerald-700 font-semibold">{item.posJaga || 'Pos Utama'}</span>
                            <span>•</span>
                            <span>{item.keterangan || 'Hadir'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                          {item.jamHadir} WIB
                        </span>
                        {!isGuest && onDeleteAttendance && (
                          <button
                            onClick={() => onDeleteAttendance(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus Presensi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB CONTENT: RIWAYAT PRESENSI & LOG */}
      {activeSubTab === 'riwayat' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Riwayat & Log Presensi Kehadiran Ronda Malam
              </h3>
              <p className="text-xs text-slate-500">
                Seluruh catatan presensi siskamling yang tersimpan di cloud database
              </p>
            </div>

            {/* Filter Tanggal & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / nomor rumah..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 w-48"
                />
              </div>

              <input
                type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
              />

              {filterTanggal && (
                <button
                  onClick={() => setFilterTanggal('')}
                  className="text-xs text-rose-600 hover:underline cursor-pointer font-semibold"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {filteredAttendances.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Tidak ada data riwayat presensi yang cocok</div>
              <p className="text-[11px] text-slate-500">
                Presensi yang dicatat melalui form presensi akan otomatis muncul di riwayat ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Warga / Petugas</th>
                    <th className="py-2.5 px-3">Blok / Rumah</th>
                    <th className="py-2.5 px-3">Jam Hadir</th>
                    <th className="py-2.5 px-3">Pos Jaga</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                    {!isGuest && onDeleteAttendance && <th className="py-2.5 px-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendances.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {formatDateIndo(item.tanggal)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                          {item.nomorRumah}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{item.jamHadir} WIB</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.posJaga || 'Pos Utama'}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{item.keterangan || '-'}</td>
                      {!isGuest && onDeleteAttendance && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan presensi ${item.nama}?`)) {
                                onDeleteAttendance(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            title="Hapus Data Presensi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. SUBTAB CONTENT: POS JAGA & SANDI KENTONGAN */}
      {activeSubTab === 'pos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POS_JAGA_LIST.map((pos) => (
              <div key={pos.nomor} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      Pos {pos.nomor}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {pos.waktu}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{pos.nama}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{pos.lokasi}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 leading-relaxed">
                    {pos.fokus}
                  </p>
                </div>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-700">Perlengkapan Pos:</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{pos.perlengkapan}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Panduan Sandi Tanda Suara Kentongan Pos Kamling
                </h3>
                <p className="text-[11px] text-slate-300">
                  Kode ketukan resmi yang dibunyikan petugas ronda di pos kamling dan saat patroli
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {KENTONGAN_CODES.map((code, idx) => (
                <div key={idx} className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="font-bold text-amber-400">{code.ketukan}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{code.arti}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. SUBTAB CONTENT: KONTAK DARURAT & KORLAP */}
      {activeSubTab === 'kontak' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Koordinator Lapangan &amp; Sie Keamanan Blok D
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kontak pengurus dan koordinator wilayah Blok D1 s/d D4
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {KORLAP_LIST.map((k, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{k.nama}</div>
                    <div className="text-[11px] text-blue-700 font-semibold">{k.jabatan}</div>
                    <div className="text-[10px] text-slate-500">{k.blok} • Rumah {k.noRumah}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-700 font-bold">{k.noHp}</span>
                    <a
                      href={`https://wa.me/${k.noHp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Nomor Darurat Kamtibmas &amp; Instansi Terkait Cileungsi
                </h3>
                <p className="text-[11px] text-slate-500">
                  Siaga 24 jam untuk penanganan darurat kamtibmas, medis, dan bencana
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {EMERGENCY_CONTACTS.map((ec, idx) => (
                <div key={idx} className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {ec.kategori}
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-1">{ec.instansi}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{ec.keterangan}</div>
                  </div>
                  <div className="pt-2 border-t border-rose-100 flex items-center justify-between">
                    <span className="font-mono text-xs text-rose-700 font-black">{ec.nomor}</span>
                    <button
                      onClick={() => handleCopy(ec.nomor, `tel-${idx}`)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                    >
                      {copiedText === `tel-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === `tel-${idx}` ? 'Disalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. SUBTAB CONTENT: CETAK JADWAL A4 KHUSUS SABTU */}
      {activeSubTab === 'cetak' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Cetak Dokumen Jadwal Ronda Sabtu (7 Petugas / Regu)
              </h3>
              <p className="text-xs text-slate-500">
                Format dokumen A4 siap cetak & tempel di pos kamling atau untuk arsip kepengurusan RT
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>
          </div>

          {/* Printable Layout Sheet */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm space-y-6 text-slate-900 print:p-0 print:border-none print:shadow-none">
            {/* Kop Surat Siskamling */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center gap-4">
              <LogoBlokD className="w-14 h-14 rounded-xl shrink-0" />
              <div className="flex-1 text-center">
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-900">
                  PAGUYUBAN WARGA BLOK D • PANORAMA REGENCY 3
                </h2>
                <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase">
                  SEKSI KEAMANAN & KETERTIBAN LINGKUNGAN (SISKAMLING)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perumahan Panorama Regency 3, Rt.005 Dan Rw.005, Desa Situ Sari, Kec. Cileungsi, Kab. Bogor
                </p>
              </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center space-y-1">
              <h4 className="text-sm sm:text-base font-black tracking-wide uppercase underline">
                JADWAL RESMI SISKAMLING SETIAP HARI SABTU / MALAM MINGGU
              </h4>
              <p className="text-xs text-slate-700 font-semibold">
                Jam Operasional: 22.00 s/d 04.00 WIB • Kapasitas: 7 Petugas Tiap Sabtu • Pos Kamling Utama Blok D
              </p>
            </div>

            {/* Tabel Jadwal 5 Pekan Sabtu */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-3 border-r border-slate-300 w-32">Jadwal Sabtu</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-44">Ketua Regu</th>
                    <th className="py-2 px-3 border-r border-slate-300">Susunan 7 Petugas Piket</th>
                    <th className="py-2 px-3 border-r border-slate-300 w-36">Pos Jaga</th>
                    <th className="py-2 px-3 w-28">Jam Jaga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {effectiveSchedules.map((sch, idx) => (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-300 bg-slate-50/50">
                        {sch.hari}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-300">
                        {sch.ketuaRegu || 'Belum ditentukan'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                          {sch.petugas && sch.petugas.length > 0 ? (
                            sch.petugas.slice(0, 7).map((p, pIdx) => (
                              <div key={pIdx} className="flex items-center gap-1">
                                <span className="font-bold text-slate-800">{pIdx + 1}.</span>
                                <span className="font-medium text-slate-900">{p.nama}</span>
                                <span className="text-slate-500 text-[10px]">({p.nomorRumah ? `${p.blok}/${p.nomorRumah}` : p.blok})</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">Belum ada susunan petugas</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-300 text-[11px]">
                        {sch.posJaga || 'Pos Kamling Utama'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                        {sch.jamMulai || '22:00'} - {sch.jamSelesai || '04:00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Catatan & Tanda Tangan */}
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
              <div className="space-y-1 text-slate-600">
                <div className="font-bold text-slate-800">Catatan & Tata Tertib:</div>
                <p className="text-[11px] leading-relaxed">
                  1. Petugas ronda wajib hadir tepat waktu di pos kamling pukul 22.00 WIB setiap Sabtu malam.<br />
                  2. Jika berhalangan hadir, harap melapor kepada Ketua Regu / Korlap Blok minimal 6 jam sebelumnya.<br />
                  3. Keliling patroli menyisir Blok D1-D4 dilakukan berkala setiap 1 jam sekali.
                </p>
              </div>

              <div className="text-center space-y-12">
                <div className="text-[11px] text-slate-600">
                  Situ Sari, Cileungsi, {formatDateIndo(todayDateStr)}<br />
                  <strong>Seksi Keamanan & Ketertiban Blok D</strong>
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 w-44 mx-auto">
                  ( Bpk. Ali Ragil Permana )
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL EDIT JADWAL 7 PETUGAS (PENGURUS / ADMIN) */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-5 sm:p-6 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Edit {editingSchedule.hari} (Kapasitas: 7 Petugas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur susunan nama, nomor rumah, dan kontak untuk 7 petugas piket Sabtu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingSchedule(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Info Jadwal & Ketua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Jadwal / Pekan</label>
                  <input
                    type="text"
                    value={editHari}
                    onChange={(e) => setEditHari(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ketua Regu (Penanggung Jawab)</label>
                  <input
                    type="text"
                    value={editKetuaRegu}
                    onChange={(e) => setEditKetuaRegu(e.target.value)}
                    placeholder="Contoh: Bpk. Romadhoni"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Jam Mulai</label>
                    <input
                      type="time"
                      value={editJamMulai}
                      onChange={(e) => setEditJamMulai(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Jam Selesai</label>
                    <input
                      type="time"
                      value={editJamSelesai}
                      onChange={(e) => setEditJamSelesai(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pos Jaga & Patroli</label>
                  <input
                    type="text"
                    value={editPosJaga}
                    onChange={(e) => setEditPosJaga(e.target.value)}
                    placeholder="Pos Kamling Utama Blok D"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Edit 7 Slots Petugas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Daftar 7 Petugas Piket Sabtu:</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Tepat 7 Orang
                  </span>
                </div>

                <div className="space-y-2.5">
                  {editPetugasList.map((pet, idx) => {
                    const isKetua = idx === 0;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border space-y-2 ${
                          isKetua ? 'bg-blue-50/40 border-blue-200' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center ${
                                isKetua ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800">
                              {isKetua ? 'Petugas 1 (Ketua Regu)' : `Petugas ${idx + 1}`}
                            </span>
                          </div>

                          {/* Quick picker from registered citizens */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 hidden sm:inline">Pilih dari Database:</span>
                            <select
                              onChange={(e) => handlePickResidentIntoSlot(idx, e.target.value)}
                              className="text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none text-slate-700 max-w-[180px]"
                              defaultValue=""
                            >
                              <option value="" disabled>-- Pilih Warga Sensus --</option>
                              {allEligible.map((r, rIdx) => (
                                <option key={rIdx} value={r.nama}>
                                  {r.nama} ({r.nomorRumah || r.blok})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <input
                              type="text"
                              value={pet.nama}
                              onChange={(e) => handleUpdateSlot(idx, 'nama', e.target.value)}
                              placeholder="Nama Petugas"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-900"
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={pet.nomorRumah || pet.blok}
                              onChange={(e) => handleUpdateSlot(idx, 'nomorRumah', e.target.value)}
                              placeholder="Blok / No. Rumah (misal: D1/05)"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 text-slate-700"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={pet.noHp}
                              onChange={(e) => handleUpdateSlot(idx, 'noHp', e.target.value)}
                              placeholder="No. HP / WhatsApp"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono text-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveScheduleModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan 7 Petugas Jadwal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
