import React from 'react';
import { HouseUnit } from '../types/census';
import { formatDateIndo, formatDateDDMMYYYY, formatDateNamedMonth, formatDateTimeIndo, calculateAge, generateWhatsAppMessage, getCitizenRegistrationNumber } from '../utils/censusHelpers';
import { LogoBlokD } from './LogoBlokD';
import { X, Printer, MessageSquare, CheckCircle, Shield, QrCode, Clock } from 'lucide-react';

interface CitizenCardModalProps {
  house: HouseUnit | null;
  onClose: () => void;
}

export const CitizenCardModal: React.FC<CitizenCardModalProps> = ({ house, onClose }) => {
  if (!house) return null;

  const handlePrint = () => {
    window.print();
  };

  const lastUpdatedDisplay = formatDateTimeIndo(house.updatedAt || house.tanggalSensus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Tanda Bukti & Kartu Data Warga Blok D</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ring-1 ring-blue-500"
              title="Cetak langsung ke Printer atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <a
              href={`https://wa.me/?text=${generateWhatsAppMessage(house)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim WA</span>
            </a>

            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 transition-colors"
              title="Tutup Kartu Data"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 print:space-y-2 text-slate-900 bg-white print:p-0 print:border-none" id="printable-citizen-card">
          {/* Letterhead Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-3 print:pb-1.5 text-center relative">
            <div className="flex items-center justify-center gap-3">
              <LogoBlokD className="w-12 h-12 sm:w-14 sm:h-14 print:w-12 print:h-12 shrink-0 shadow-sm" />
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Pemerintah Desa Situ Sari • Kecamatan Cileungsi
                </div>
                <h3 className="font-black text-base sm:text-lg uppercase tracking-tight text-slate-900 leading-tight">
                  PANORAMA REGENCY 3 SITU SARI
                </h3>
                <h4 className="font-bold text-xs sm:text-sm text-blue-700 uppercase tracking-tight">
                  BLOK D
                </h4>
                <p className="text-[11px] print:text-[10px] text-slate-600 font-medium">
                  Wilayah Administrasi: Rt.005 Dan Rw.005 • Kab. Bogor 16820
                </p>
              </div>
            </div>
            <div className="mt-1.5 print:mt-0.5 text-[10px] font-mono tracking-wider text-slate-500 font-semibold">
              NOMOR REGISTRASI DATA: {getCitizenRegistrationNumber(house)}
            </div>
          </div>

          {/* Title of Card */}
          <div className="text-center space-y-0.5">
            <span className="inline-block px-3 py-0.5 bg-blue-50 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200">
              KARTU TANDA BUKTI DATA WARGA
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {house.nomorRumah}
            </h2>
          </div>

          {/* Household Spec Table */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 p-2.5 sm:p-3.5 print:p-2 print:gap-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs print:text-[10px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Kepala Keluarga:</span>
              <strong className="text-slate-900 text-sm print:text-xs truncate block">{house.kepalaKeluargaNama || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Nomor Kartu Keluarga:</span>
              <strong className="font-mono text-slate-900 truncate block">{house.nomorKK || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status Hunian & Wilayah:</span>
              <strong className="capitalize text-slate-900 block truncate">
                {house.statusHunian} (RT {house.rt || '005'})
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Listrik & Air:</span>
              <strong className="text-slate-900 block truncate">
                {house.dayaListrik} / {house.sumberAir}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Layanan Wifi:</span>
              <strong className="text-blue-700 block truncate font-semibold">
                {house.wifi || 'Tanpa Wifi'}
              </strong>
            </div>
          </div>

          {/* Audit Timestamp Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 print:py-1 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] print:text-[10px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                Terakhir Diubah: <strong className="text-slate-900">{lastUpdatedDisplay}</strong>
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              Petugas Data: <strong className="text-slate-800">{house.petugasSensus || '-'}</strong>
            </div>
          </div>

          {/* Residents Table */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-1.5 print:mb-1">
              Daftar Anggota Keluarga ({house.residents.length} Jiwa):
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs print:text-[10px]">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white font-bold border-b border-slate-800 text-[11px] print:text-[10px]">
                  <tr>
                    <th className="p-2 sm:p-2.5 print:p-1">No</th>
                    <th className="p-2 sm:p-2.5 print:p-1">Nama Warga</th>
                    <th className="p-2 sm:p-2.5 print:p-1">NIK</th>
                    <th className="p-2 sm:p-2.5 print:p-1">L/P</th>
                    <th className="p-2 sm:p-2.5 print:p-1">Hubungan</th>
                    <th className="p-2 sm:p-2.5 print:p-1">Pendidikan</th>
                    <th className="p-2 sm:p-2.5 print:p-1">Pekerjaan</th>
                    <th className="p-2 sm:p-2.5 print:p-1">BPJS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {house.residents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-2 text-center text-slate-400 italic">
                        Belum ada anggota keluarga terdaftar.
                      </td>
                    </tr>
                  ) : (
                    house.residents.map((r, i) => (
                      <tr key={r.id || i} className="even:bg-slate-50/50">
                        <td className="p-2 sm:p-2.5 print:p-1 text-slate-500">{i + 1}</td>
                        <td className="p-2 sm:p-2.5 print:p-1 font-bold text-slate-900">{r.nama}</td>
                        <td className="p-2 sm:p-2.5 print:p-1 font-mono text-[11px] print:text-[10px] text-slate-600">{r.nik || '-'}</td>
                        <td className="p-2 sm:p-2.5 print:p-1">{r.jenisKelamin}</td>
                        <td className="p-2 sm:p-2.5 print:p-1 font-semibold text-blue-700">{r.hubunganKeluarga}</td>
                        <td className="p-2 sm:p-2.5 print:p-1 text-[11px] print:text-[10px] text-slate-700 font-medium">{r.pendidikan || '-'}</td>
                        <td className="p-2 sm:p-2.5 print:p-1">
                          <div className="font-medium text-slate-900">{r.pekerjaan || '-'}</div>
                          {r.penghasilan && r.penghasilan !== 'Tidak Ada Penghasilan' && (
                            <div className="text-[9.5px] print:text-[8.5px] font-bold text-emerald-700">
                              {r.penghasilan}
                            </div>
                          )}
                        </td>
                        <td className="p-2 sm:p-2.5 print:p-1 text-[11px] print:text-[10px]">{r.statusBpjs}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicles List */}
          {house.vehicles.length > 0 && (
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-1">
                Kendaraan Terdaftar di Blok D:
              </h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs print:text-[10px]">
                {house.vehicles.map((v, i) => (
                  <div key={i} className="p-1.5 sm:p-2 print:p-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span>{v.jenis} {v.merkModel} ({v.warna})</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px] print:text-[10px]">
                      {v.platNomor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Stamps & Signatures */}
          <div className="pt-4 sm:pt-6 print:pt-2 border-t border-slate-200 space-y-3 print:space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
              {/* QR Code Verification Simulation */}
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-11 h-11 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center text-slate-800 shadow-sm shrink-0">
                  <QrCode className="w-9 h-9 text-slate-800" />
                </div>
                <div className="text-[10px] space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-800">QR Verifikasi Data</div>
                  <div className="text-slate-500 font-mono text-[9px] truncate" title={getCitizenRegistrationNumber(house)}>
                    {getCitizenRegistrationNumber(house)}
                  </div>
                  <div className="text-emerald-700 font-bold text-[9px]">TERVERIFIKASI SAH ✓</div>
                </div>
              </div>

              {/* Warga yang Terdata */}
              <div className="text-center space-y-0.5">
                <div className="text-[11px] font-bold text-slate-800">Warga yang Terdata</div>
                <div className="h-8 sm:h-10 print:h-8 flex items-center justify-center text-slate-400 text-xs">
                  ( .................... )
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-0.5 text-[11px]">
                  {house.kepalaKeluargaNama || 'Kepala Keluarga / Warga'}
                </div>
              </div>

              {/* Pengurus Blok D */}
              <div className="text-center space-y-0.5">
                <div className="text-[10px] text-slate-500">
                  Situ Sari, {formatDateNamedMonth(house.tanggalSensus || new Date().toISOString().slice(0, 10))}
                </div>
                <div className="text-[11px] font-bold text-slate-800">Pengurus Blok D</div>
                <div className="h-8 sm:h-10 print:h-8 flex items-center justify-center text-blue-700 italic text-xs font-semibold opacity-70">
                  [Ttd & Cap Blok D]
                </div>
                <div className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 text-[11px]">
                  {house.petugasSensus || 'Pengurus Blok D'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
