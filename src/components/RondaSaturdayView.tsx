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
  UserCheck
} from 'lucide-react';
import { AuthUser, RondaAttendance, HouseUnit } from '../types/census';
import { BLOK_LIST } from '../data/masterHouseList';

interface RondaSaturdayViewProps {
  currentUser: AuthUser | null;
  houses: HouseUnit[];
  attendances: RondaAttendance[];
  onAddAttendance: (attendance: RondaAttendance) => void;
  onDeleteAttendance?: (id: string) => void;
}

export const RondaSaturdayView: React.FC<RondaSaturdayViewProps> = ({
  currentUser,
  attendances,
  onAddAttendance,
  onDeleteAttendance,
}) => {
  const isGuest = currentUser?.isGuest || currentUser?.role === 'warga';

  // Form check-in state
  const [formNama, setFormNama] = useState(currentUser?.nama && !currentUser.isGuest ? currentUser.nama : '');
  const [formNomorRumah, setFormNomorRumah] = useState('');
  const [formBlok, setFormBlok] = useState<'D1' | 'D2' | 'D3' | 'D4'>('D1');
  const [formPos, setFormPos] = useState('Pos Kamling Utama Blok D');
  const [formKeterangan, setFormKeterangan] = useState('Hadir Siap Jaga Malam');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Today formatted string
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAttendanceList = attendances.filter((a) => a.tanggal === todayDateStr);

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

  const korlapList = [
    { nama: 'Romadhoni', jabatan: 'Korlap Blok D1 Depan', noHp: '0812-xxxx-xxxx', blok: 'Blok D1' },
    { nama: 'Yongki', jabatan: 'Korlap Blok D1 Belakang', noHp: '0813-xxxx-xxxx', blok: 'Blok D1' },
    { nama: 'Satria', jabatan: 'Korlap Blok D2 Depan', noHp: '0857-xxxx-xxxx', blok: 'Blok D2' },
    { nama: 'Rizki Saputra', jabatan: 'Korlap Blok D2 Belakang, D3 & D4', noHp: '0878-xxxx-xxxx', blok: 'Blok D2, D3, D4' },
    { nama: 'Ali Ragil Permana', jabatan: 'Ketua Blok D', noHp: '0812-xxxx-xxxx', blok: 'Pengurus RT' },
  ];

  const posJagaList = [
    {
      nama: 'Pos 1: Pos Kamling Utama Blok D',
      lokasi: 'Pertigaan Masuk Blok D1 & D2',
      fokus: 'Pintu gerbang utama, kontrol portal masuk, monitor kendaraan keluar-masuk',
      waktu: '22.00 - 04.00 WIB',
    },
    {
      nama: 'Pos 2: Jalur Tengah & Lapangan Blok D2',
      lokasi: 'Area Taman / Lapangan Blok D2',
      fokus: 'Patroli gang D2, cek penerangan jalan, pemantauan rumah kosong',
      waktu: '22.30 - 03.30 WIB',
    },
    {
      nama: 'Pos 3: Titik Pantau Belakang (D3 & D4)',
      lokasi: 'Tembok Pembatas Ujung Blok D3/D4',
      fokus: 'Pagar pembatas luar perumahan, kontrol kebun belakang, cek lampu penerangan',
      waktu: '23.00 - 04.00 WIB',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Saturday Night Ronda Hero Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 rounded-2xl border border-blue-900/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-bold text-amber-300">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Jadwal Khusus Hari Sabtu (Malam Minggu)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>Siskamling & Ronda Malam Minggu Blok D</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Jadwal siskamling ronda malam warga Perumahan Panorama Regency 3 Blok D (D1, D2, D3, D4) Desa Situ Sari. Pengamanan terpadu lingkungan setiap Sabtu malam demi keamanan dan kenyamanan warga.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shrink-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Jam Operasional Ronda</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5">22.00 - 04.00</div>
            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Waktu Indonesia Barat</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid: 3 Pos Jaga & SOP Siskamling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posJagaList.map((pos, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  Pos {idx + 1}
                </span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
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
            <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Keliling berkala 1 jam sekali</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Section: Form Presensi Ronda & Daftar Kehadiran Malam Ini */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Check-In Ronda (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Presensi Kehadiran Ronda Malam Ini
              </h3>
              <p className="text-[11px] text-slate-500">
                Warga / petugas piket Sabtu malam dapat check-in kehadiran di pos
              </p>
            </div>
          </div>

          {submitSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Presensi ronda berhasil dicatat. Terima kasih atas partisipasi dan dedikasi menjaga lingkungan!</span>
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
                <option value="Patroli Keliling Mobile">Patroli Keliling Mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                value={formKeterangan}
                onChange={(e) => setFormKeterangan(e.target.value)}
                placeholder="Contoh: Hadir Siap Jaga Malam / Piket Regu Depan"
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

        {/* Daftar Kehadiran Warga yang Hadir Malam Ini (7 Cols) */}
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
                  Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
                Silakan isi form di sebelah kiri saat Anda tiba di pos ronda untuk mencatat kehadiran siskamling.
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

      {/* Koordinator Lapangan & Kontak Darurat */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Koordinator Lapangan & Kontak Keamanan Blok D
            </h3>
            <p className="text-[11px] text-slate-500">
              Pengurus dan korlap siap siaga jika terjadi kendala atau situasi darurat di lingkungan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {korlapList.map((k, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-900">{k.nama}</div>
                <div className="text-[11px] text-blue-700 font-semibold mt-0.5">{k.jabatan}</div>
                <div className="text-[10px] text-slate-500 mt-1">{k.blok}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono font-medium">
                Siaga Ronda
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOP & Tata Tertib Ronda Siskamling */}
      <div className="bg-slate-900 text-slate-200 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md space-y-3">
        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>SOP & Pedoman Keamanan Ronda Sabtu Malam</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="font-bold text-white">1. Penutupan Portal Gerbang Utama</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Portal gerbang utama ditutup mulai pukul 23.00 WIB. Akses masuk hanya diperuntukkan bagi warga Blok D dan tamu yang telah melapor.
            </p>
          </div>
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="font-bold text-white">2. Patroli Berkala Minimal 2 Orang</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Petugas ronda berkeliling setiap 1 jam sekali menyisir Blok D1 s/d D4 secara bergantian membawa senter dan tongkat ronda.
            </p>
          </div>
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="font-bold text-white">3. Tanda Keamanan Kentongan</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pemberitahuan situasi aman dilakukan melalui kentongan di pos kamling pada setiap jam genap (24.00, 02.00, dan 04.00 WIB).
            </p>
          </div>
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
            <div className="font-bold text-white">4. Pemeriksaan Kendaraan & Rumah Kosong</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pastikan gerbang rumah terkunci, motor terparkir aman di dalam pagar, dan tidak ada aktivitas mencurigakan di area rumah kosong.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
