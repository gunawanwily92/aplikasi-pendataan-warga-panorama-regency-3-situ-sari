import React, { useRef, useState } from 'react';
import { HouseUnit, RondaSchedule, MovedCitizen, DeceasedCitizen, CoverLetter } from '../types/census';
import { exportCensusToCSV, getAllResidents, calculateAge, formatDateDDMMYYYY } from '../utils/censusHelpers';
import { LogoBlokD } from './LogoBlokD';
import { Download, Upload, Printer, FileSpreadsheet, Database, Check, AlertTriangle, X, Truck, HeartCrack, FileText, CheckCircle2 } from 'lucide-react';

interface ExportPrintModalProps {
  houses: HouseUnit[];
  rondaSchedule: RondaSchedule[];
  movedList?: MovedCitizen[];
  deceasedList?: DeceasedCitizen[];
  coverLetters?: CoverLetter[];
  onImportData: (houses: HouseUnit[], moved?: MovedCitizen[], deceased?: DeceasedCitizen[], coverLetters?: CoverLetter[]) => void;
  onResetData?: () => void;
}

export const ExportPrintModal: React.FC<ExportPrintModalProps> = ({
  houses,
  rondaSchedule,
  movedList = [],
  deceasedList = [],
  coverLetters = [],
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const allResidents = getAllResidents(houses);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportJSON = () => {
    const dataToExport = {
      app: 'Data Warga Panorama Regency 3 Blok D',
      exportDate: new Date().toISOString(),
      rt: '005',
      rw: '005',
      houses,
      rondaSchedule,
      movedCitizens: movedList,
      deceasedCitizens: deceasedList,
      coverLetters
    };

    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Data_Warga_Blok_D_Panorama_Regency_3_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Backup database JSON (Data Warga, Pindah, Wafat & Surat Pengantar) berhasil diunduh!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.houses && Array.isArray(parsed.houses)) {
          onImportData(parsed.houses, parsed.movedCitizens, parsed.deceasedCitizens, parsed.coverLetters);
          showNotification('Database warga berhasil diimpor & dipulihkan!');
        } else if (Array.isArray(parsed)) {
          onImportData(parsed);
          showNotification('Database warga berhasil diimpor & dipulihkan!');
        } else {
          showNotification('Format file JSON tidak sesuai struktur data warga.', 'error');
        }
      } catch (err) {
        showNotification('Gagal membaca file JSON: format tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner and Export Cards (Hidden on Print) */}
      <div className="space-y-6 print:hidden">
        {/* Top Banner */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Ekspor Laporan & Manajemen Database Warga
          </h2>
          <p className="text-xs text-slate-500">
            Unduh data lengkap dalam format Excel/CSV, simpan salinan cadangan (backup JSON), atau cetak laporan kependudukan resmi.
          </p>
        </div>

        <button
          onClick={handlePrintSummary}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Laporan Data Warga</span>
        </button>
      </div>

      {/* Official Printable Documents Guidelines */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-blue-950">
          <Printer className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm sm:text-base">
            Dokumen Resmi yang Dapat Dicetak (Standar 1 Lembar A4)
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Sistem Data Warga Blok D menyediakan 4 format surat & dokumen resmi yang telah diatur khusus agar pas 1 lembar kertas A4 siap tanda tangan pengurus:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
              1. Menu Data Warga
            </span>
            <h4 className="font-bold text-slate-900 text-xs">Kartu Bukti Data Warga</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Kartu tanda bukti data keluarga dilengkapi QR code verifikasi dan daftar anggota keluarga.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
              2. Menu Warga Pindah
            </span>
            <h4 className="font-bold text-slate-900 text-xs">Surat Keterangan Pindah</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Surat resmi keterangan pindah domisili keluar dari Panorama Regency 3 Blok D.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              3. Menu Warga Wafat
            </span>
            <h4 className="font-bold text-slate-900 text-xs">Surat Keterangan Kematian</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Surat keterangan kematian warga Blok D untuk keperluan administrasi dan santunan.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              4. Menu Surat Pengantar
            </span>
            <h4 className="font-bold text-slate-900 text-xs">Surat Pengantar Warga</h4>
            <p className="text-[11px] text-slate-500 leading-snug">
              Surat pengantar Rt.005 Dan Rw.005 untuk berbagai kebutuhan (KTP, KK, SKCK, BPJS, Bank, dll).
            </p>
          </div>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. CSV / Excel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Unduh File Excel / CSV</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Format spreadsheet terstruktur berisi seluruh NIK, No. KK, nama lengkap, kontak, status BPJS, dan data kendaraan seluruh warga Blok D.
            </p>
          </div>

          <button
            onClick={() => exportCensusToCSV(houses)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (Excel)</span>
          </button>
        </div>

        {/* 2. JSON Backup */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Backup Database (JSON)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Simpan seluruh data rumah, KK, warga, dan kendaraan dalam 1 file cadangan untuk diamankan di HP / Komputer pengurus.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan JSON</span>
          </button>
        </div>

        {/* 3. Restore / Import JSON */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Pulihkan Data (Restore)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Impor kembali file JSON hasil backup dari perangkat lain atau petugas lapangan lainnya.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih File JSON</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Printable Report Summary (Visible on screen and optimized for print) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6" id="printable-summary">
        <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <LogoBlokD className="w-14 h-14 shrink-0 shadow-sm" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Pemerintah Desa Situ Sari • Kecamatan Cileungsi
              </div>
              <h3 className="font-black text-base sm:text-lg uppercase text-slate-900 leading-tight">
                PENGURUS PAGUYUBAN WARGA BLOK D
              </h3>
              <h4 className="font-bold text-xs sm:text-sm text-blue-700 uppercase mt-0.5">
                REKAPITULASI LAPORAN DATA WARGA • PANORAMA REGENCY 3
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Wilayah Administrasi: Rt.005 Dan Rw.005 • Tahun {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 font-mono shrink-0">
            <div>Tanggal Cetak: {formatDateDDMMYYYY(new Date())}</div>
            <div className="font-bold text-emerald-700">Status: Sah & Terverifikasi</div>
          </div>
        </div>

        {/* Quick Summary Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 block">Total Unit Rumah:</span>
            <strong className="text-lg text-slate-900">{houses.length} Unit</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 block">Total Jiwa Terdata:</span>
            <strong className="text-lg text-blue-700">{allResidents.length} Jiwa</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 block">Rumah Berpenghuni:</span>
            <strong className="text-lg text-emerald-800">{houses.filter((h) => h.statusHunian !== 'kosong').length} Rumah</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 block">Rumah Kosong:</span>
            <strong className="text-lg text-rose-700">{houses.filter((h) => h.statusHunian === 'kosong').length} Rumah</strong>
          </div>
        </div>

        {/* Summary Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white font-bold border-b border-slate-800 text-[11px] uppercase">
              <tr>
                <th className="p-3">No. Rumah</th>
                <th className="p-3">Kepala Keluarga</th>
                <th className="p-3">No. KK</th>
                <th className="p-3">Status</th>
                <th className="p-3">Jumlah Jiwa</th>
                <th className="p-3">Kendaraan</th>
                <th className="p-3">Status Pendataan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {houses.map((h) => (
                <tr key={h.id} className="even:bg-slate-50/50">
                  <td className="p-3 font-bold text-blue-700">{h.nomorRumah}</td>
                  <td className="p-3 font-medium">{h.kepalaKeluargaNama || '-'}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{h.nomorKK || '-'}</td>
                  <td className="p-3 capitalize">{h.statusHunian}</td>
                  <td className="p-3 font-semibold">{h.residents.length} Orang</td>
                  <td className="p-3">{h.vehicles.length} Unit</td>
                  <td className="p-3">
                    <span className={`font-semibold ${h.statusSensus === 'Sudah Sensus' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {h.statusSensus === 'Sudah Sensus' ? 'Sudah Terdata' : h.statusSensus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Line - 3 Separate Columns */}
        <div className="pt-6 border-t border-slate-200 space-y-4 text-xs">
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>Dicetak melalui Sistem Informasi Data Warga Blok D Panorama Regency 3</span>
            <span>Situ Sari, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div className="space-y-12">
              <div>
                <span className="text-[11px] text-slate-500 block">Mengetahui,</span>
                <strong className="text-slate-900 font-bold">Ketua RW 005</strong>
              </div>
              <div>
                <strong className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 block">
                  ( ........................................ )
                </strong>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <span className="text-[11px] text-slate-500 block">Mengetahui,</span>
                <strong className="text-slate-900 font-bold">Ketua RT 005</strong>
              </div>
              <div>
                <strong className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 block">
                  ( ........................................ )
                </strong>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <span className="text-[11px] text-slate-500 block">Penanggung Jawab Laporan,</span>
                <strong className="text-slate-900 font-bold">Pengurus Blok D</strong>
              </div>
              <div>
                <strong className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 block">
                  ( Ali Ragil P. / Wily Gunawan )
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-xs animate-in fade-in slide-in-from-bottom-2 ${
          notification.type === 'error'
            ? 'bg-rose-950 text-rose-100 border-rose-700'
            : 'bg-emerald-950 text-emerald-100 border-emerald-700'
        }`}>
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};
