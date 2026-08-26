import React, { useState, useEffect } from 'react';
import { LetterType, LETTER_TYPES, formatLetterNumber, parseLetterNumber, calculateNextLetterSequence, isLetterNumberExists, ROMAN_MONTHS, getRomanMonth } from '../utils/letterNumberUtils';
import { CoverLetter, MovedCitizen, DeceasedCitizen } from '../types/census';
import { Hash, Sparkles, CheckCircle2, AlertTriangle, Info, Copy, Check, RefreshCw } from 'lucide-react';

interface LetterNumberBuilderProps {
  value: string;
  onChange: (fullNumber: string) => void;
  type: LetterType;
  onTypeChange?: (newType: LetterType) => void;
  dateString?: string; // YYYY-MM-DD
  coverLetters?: CoverLetter[];
  movedList?: MovedCitizen[];
  deceasedList?: DeceasedCitizen[];
  currentRecordId?: string;
  className?: string;
  readOnlyType?: boolean;
}

export const LetterNumberBuilder: React.FC<LetterNumberBuilderProps> = ({
  value,
  onChange,
  type,
  onTypeChange,
  dateString = new Date().toISOString().slice(0, 10),
  coverLetters = [],
  movedList = [],
  deceasedList = [],
  currentRecordId,
  className = '',
  readOnlyType = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);

  const parsed = parseLetterNumber(value);
  const targetYear = dateString ? new Date(dateString).getFullYear() || 2026 : 2026;
  const targetRomanMonth = getRomanMonth(dateString);

  // Kalkulasi nomor urut berikutnya dari agenda surat keluar
  const seqInfo = calculateNextLetterSequence({
    coverLetters,
    movedList,
    deceasedList,
    type,
    year: targetYear
  });

  const isDuplicate = isLetterNumberExists(value, coverLetters, movedList, deceasedList, currentRecordId);

  // Sequence number state
  const currentSeq = parsed.sequence > 0 ? parsed.sequence : seqInfo.nextSequence;
  const currentUnit = parsed.unit || 'D';

  const handleSequenceChange = (newSeqVal: number) => {
    const safeSeq = Math.max(1, newSeqVal || 1);
    const updated = formatLetterNumber({
      sequence: safeSeq,
      type,
      unit: currentUnit,
      customYear: targetYear,
      customRomanMonth: targetRomanMonth
    });
    onChange(updated);
  };

  const handleAutoNext = () => {
    const nextFormatted = formatLetterNumber({
      sequence: seqInfo.nextSequence,
      type,
      unit: 'D',
      customYear: targetYear,
      customRomanMonth: targetRomanMonth
    });
    onChange(nextFormatted);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 space-y-3 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xs">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Komponen Nomor Surat Resmi
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Standar Blok D
              </span>
            </label>
            <p className="text-[11px] text-slate-500">
              Format: <span className="font-mono font-medium text-slate-700">[Urut]/[Kode Jenis]/[Unit]/[Bulan Romawi]/[Tahun]</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAutoNext}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Gunakan nomor urut berikutnya dari buku agenda surat keluar"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Urut Berikutnya: #{String(seqInfo.nextSequence).padStart(3, '0')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdvanced(!isAdvanced)}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            {isAdvanced ? 'Sembunyikan Segment' : 'Ubah Komponen'}
          </button>
        </div>
      </div>

      {/* Main Full Number Visual Display */}
      <div className="relative flex items-center bg-white rounded-xl border-2 border-slate-300 focus-within:border-blue-500 shadow-xs transition-all">
        <div className="pl-3 pr-2 py-2 font-mono text-sm sm:text-base font-bold text-slate-900 flex-1 overflow-x-auto tracking-wide">
          {value || `${String(seqInfo.nextSequence).padStart(3, '0')}/${type}/D/${targetRomanMonth}/${targetYear}`}
        </div>
        <div className="pr-2 flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
            title="Salin Nomor Surat"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Validation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {isDuplicate ? (
          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>Peringatan: Nomor surat ini sudah terdaftar di agenda surat keluar (ganda)!</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>Nomor surat valid & belum pernah dipakai di agenda</span>
          </div>
        )}

        {seqInfo.gaps.length > 0 && (
          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-600" />
            <span>Nomor terlewat di agenda: #{seqInfo.gaps.map((g) => String(g).padStart(3, '0')).join(', #')}</span>
          </div>
        )}
      </div>

      {/* 5 Components Visual Breakdown (Segmented Pill Editor) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {/* 1. Nomor Urut */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            1. Nomor Urut
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="9999"
              value={currentSeq}
              onChange={(e) => handleSequenceChange(parseInt(e.target.value, 10))}
              className="w-full font-mono font-bold text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Urutan terbit</span>
        </div>

        {/* 2. Kode Jenis Surat */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            2. Kode Jenis
          </span>
          {readOnlyType || !onTypeChange ? (
            <div className="w-full font-mono font-bold text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-center">
              {type}
            </div>
          ) : (
            <select
              value={type}
              onChange={(e) => {
                const newT = e.target.value as LetterType;
                onTypeChange(newT);
                const updated = formatLetterNumber({
                  sequence: currentSeq,
                  type: newT,
                  unit: currentUnit,
                  customYear: targetYear,
                  customRomanMonth: targetRomanMonth
                });
                onChange(updated);
              }}
              className="w-full font-mono font-bold text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-1 py-1 text-center outline-none cursor-pointer"
            >
              <option value="SP">SP (Pengantar)</option>
              <option value="SKPD">SKPD (Pindah)</option>
              <option value="SKK">SKK (Kematian)</option>
            </select>
          )}
          <span className="text-[9px] text-slate-400 block text-center">{LETTER_TYPES[type]?.shortName || type}</span>
        </div>

        {/* 3. Kode Unit / Instansi */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            3. Kode Unit
          </span>
          <div className="w-full font-mono font-bold text-sm text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-center">
            D
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Pengurus Blok D</span>
        </div>

        {/* 4. Bulan (Romawi) */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            4. Bulan (Romawi)
          </span>
          <div className="w-full font-mono font-bold text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1 text-center">
            {targetRomanMonth}
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Bulan terbit</span>
        </div>

        {/* 5. Tahun */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            5. Tahun
          </span>
          <div className="w-full font-mono font-bold text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-center">
            {targetYear}
          </div>
          <span className="text-[9px] text-slate-400 block text-center">Tahun terbit</span>
        </div>
      </div>

      {/* Advanced Custom Free-Text Override */}
      {isAdvanced && (
        <div className="pt-2 border-t border-slate-200/80 animate-fadeIn space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 block">
            Input Manual Bebas (Override Langsung):
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="001/SP/D/VIII/2026"
            className="w-full px-3 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none"
          />
          <p className="text-[10px] text-slate-400">
            *Gunakan pemisah tanda garis miring (/) untuk memisahkan Nomor Urut, Kode Jenis, Unit D, Bulan Romawi, dan Tahun.
          </p>
        </div>
      )}
    </div>
  );
};
