import { CoverLetter, MovedCitizen, DeceasedCitizen } from '../types/census';

export type LetterType = 'SP' | 'SKPD' | 'SKK';

export interface LetterTypeInfo {
  code: LetterType;
  name: string;
  shortName: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const LETTER_TYPES: Record<LetterType, LetterTypeInfo> = {
  SP: {
    code: 'SP',
    name: 'Surat Pengantar',
    shortName: 'Pengantar',
    description: 'Surat pengantar permohonan administrasi (KTP, KK, SKCK, BPJS, Bank, dll.)',
    colorClass: 'text-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  SKPD: {
    code: 'SKPD',
    name: 'Surat Keterangan Pindah Domisili',
    shortName: 'Pindah Domisili',
    description: 'Surat keterangan pengantar perpindahan domisili / mutasi keluar warga Blok D',
    colorClass: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  SKK: {
    code: 'SKK',
    name: 'Surat Keterangan Kematian',
    shortName: 'Kematian',
    description: 'Surat keterangan pemberitahuan / pengantar kematian warga Blok D',
    colorClass: 'text-rose-600',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-200'
  }
};

export const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

/**
 * Mendapatkan representasi angka Romawi untuk bulan
 * @param monthInput 1-12 atau 0-11 index, atau string YYYY-MM-DD, atau Date object
 */
export function getRomanMonth(monthInput?: number | string | Date): string {
  if (monthInput === undefined || monthInput === null) {
    const currentMonth = new Date().getMonth();
    return ROMAN_MONTHS[currentMonth] || 'VIII';
  }

  if (typeof monthInput === 'number') {
    // jika 1-12
    if (monthInput >= 1 && monthInput <= 12) {
      return ROMAN_MONTHS[monthInput - 1];
    }
    // jika 0-11
    if (monthInput >= 0 && monthInput <= 11) {
      return ROMAN_MONTHS[monthInput];
    }
    return 'I';
  }

  if (typeof monthInput === 'string') {
    // Format YYYY-MM-DD
    const match = monthInput.trim().match(/^\d{4}[-/](\d{1,2})[-/]/);
    if (match) {
      const m = parseInt(match[1], 10);
      if (m >= 1 && m <= 12) return ROMAN_MONTHS[m - 1];
    }
    const d = new Date(monthInput);
    if (!isNaN(d.getTime())) {
      return ROMAN_MONTHS[d.getMonth()] || 'VIII';
    }
  }

  if (monthInput instanceof Date && !isNaN(monthInput.getTime())) {
    return ROMAN_MONTHS[monthInput.getMonth()] || 'VIII';
  }

  return 'VIII';
}

export interface LetterNumberParts {
  sequence: number;
  sequenceFormatted: string; // e.g. "001"
  type: LetterType | string; // "SP" | "SKPD" | "SKK"
  unit: string; // "D"
  romanMonth: string; // "VIII"
  year: number; // 2026
  fullNumber: string; // "001/SP/D/VIII/2026"
  isValidStandard: boolean;
}

/**
 * Format standar nomor surat:
 * [Nomor Urut]/[Kode Jenis]/[Kode Unit]/[Bulan Romawi]/[Tahun]
 * Contoh: 001/SP/D/VIII/2026
 */
export function formatLetterNumber({
  sequence,
  type,
  unit = 'D',
  date = new Date(),
  customYear,
  customRomanMonth
}: {
  sequence: number | string;
  type: LetterType;
  unit?: string;
  date?: string | Date;
  customYear?: number;
  customRomanMonth?: string;
}): string {
  const seqNum = typeof sequence === 'string' ? parseInt(sequence.replace(/\D/g, ''), 10) || 1 : sequence;
  const seqStr = String(seqNum).padStart(3, '0');

  let romanM = customRomanMonth;
  let yr = customYear;

  if (!romanM || !yr) {
    let d: Date;
    if (typeof date === 'string') {
      const match = date.match(/^(\d{4})[-/](\d{1,2})/);
      if (match) {
        yr = yr || parseInt(match[1], 10);
        romanM = romanM || getRomanMonth(parseInt(match[2], 10));
      }
      d = new Date(date);
    } else {
      d = date;
    }

    if (!yr) yr = !isNaN(d.getTime()) ? d.getFullYear() : 2026;
    if (!romanM) romanM = getRomanMonth(d);
  }

  const cleanUnit = (unit || 'D').trim().toUpperCase();
  const cleanType = (type || 'SP').trim().toUpperCase();

  return `${seqStr}/${cleanType}/${cleanUnit}/${romanM}/${yr}`;
}

/**
 * Parse string nomor surat menjadi komponen-komponennya
 */
export function parseLetterNumber(rawNumber?: string): LetterNumberParts {
  if (!rawNumber || typeof rawNumber !== 'string') {
    return {
      sequence: 1,
      sequenceFormatted: '001',
      type: 'SP',
      unit: 'D',
      romanMonth: 'VIII',
      year: 2026,
      fullNumber: '',
      isValidStandard: false
    };
  }

  const clean = rawNumber.trim();
  // Pola Standar: 001/SP/D/VIII/2026 atau 1/SKPD/D/I/2025
  const standardMatch = clean.match(/^(\d+)\s*\/\s*([A-Za-z]+)\s*\/\s*([A-Za-z0-9]+)\s*\/\s*([IVXLCDMivxlcdm]+)\s*\/\s*(\d{4})$/);

  if (standardMatch) {
    const seq = parseInt(standardMatch[1], 10);
    return {
      sequence: seq,
      sequenceFormatted: String(seq).padStart(3, '0'),
      type: standardMatch[2].toUpperCase(),
      unit: standardMatch[3].toUpperCase(),
      romanMonth: standardMatch[4].toUpperCase(),
      year: parseInt(standardMatch[5], 10),
      fullNumber: clean,
      isValidStandard: true
    };
  }

  // Coba pola format lama (e.g. 470/018/RT04-RW12/VIII/2026 atau 471.2/018/RT04-RW12/XII/2024)
  const legacyMatch = clean.match(/^([0-9.]+)\s*\/\s*(\d+)\s*\/\s*([^/]+)\s*\/\s*([IVXLCDMivxlcdm]+)?\s*\/?\s*(\d{4})$/);
  if (legacyMatch) {
    const seq = parseInt(legacyMatch[2], 10);
    const prefix = legacyMatch[1];
    let inferredType: LetterType = 'SP';
    if (prefix.includes('471') || prefix.includes('SKPD')) inferredType = 'SKPD';
    if (prefix.includes('474') || prefix.includes('SKK')) inferredType = 'SKK';

    return {
      sequence: seq,
      sequenceFormatted: String(seq).padStart(3, '0'),
      type: inferredType,
      unit: 'D',
      romanMonth: (legacyMatch[4] || 'VIII').toUpperCase(),
      year: parseInt(legacyMatch[5], 10),
      fullNumber: clean,
      isValidStandard: false
    };
  }

  // Fallback ekstraksi angka pertama dan tahun
  const anyNumMatch = clean.match(/(\d+)/);
  const anyYearMatch = clean.match(/(\d{4})/);
  const seqFallback = anyNumMatch ? parseInt(anyNumMatch[1], 10) : 1;
  const yearFallback = anyYearMatch ? parseInt(anyYearMatch[1], 10) : 2026;

  return {
    sequence: seqFallback,
    sequenceFormatted: String(seqFallback).padStart(3, '0'),
    type: clean.toUpperCase().includes('SKPD') ? 'SKPD' : clean.toUpperCase().includes('SKK') ? 'SKK' : 'SP',
    unit: 'D',
    romanMonth: 'VIII',
    year: yearFallback,
    fullNumber: clean,
    isValidStandard: false
  };
}

export interface OutgoingLetterRecord {
  id: string;
  nomorSurat: string;
  nomorUrut: number;
  kodeJenis: LetterType;
  namaJenis: string;
  kodeUnit: string;
  bulanRomawi: string;
  tahun: number;
  tanggalSurat: string;
  namaWarga: string;
  nik: string;
  nomorRumah: string;
  keperluan: string;
  petugas: string;
  sourceType: 'pengantar' | 'pindah' | 'meninggal';
  isDuplicate: boolean;
  isValidStandard: boolean;
  rawItem: CoverLetter | MovedCitizen | DeceasedCitizen;
}

/**
 * Menghimpun seluruh surat keluar dari berbagai sumber (CoverLetter, MovedCitizen, DeceasedCitizen)
 * ke dalam format terpadu Agenda Surat Keluar
 */
export function getAllOutgoingLetters(
  coverLetters: CoverLetter[] = [],
  movedList: MovedCitizen[] = [],
  deceasedList: DeceasedCitizen[] = []
): OutgoingLetterRecord[] {
  const records: OutgoingLetterRecord[] = [];

  // 1. Surat Pengantar
  coverLetters.forEach((cl) => {
    const parsed = parseLetterNumber(cl.nomorSurat);
    records.push({
      id: cl.id,
      nomorSurat: cl.nomorSurat,
      nomorUrut: parsed.sequence,
      kodeJenis: 'SP',
      namaJenis: LETTER_TYPES.SP.name,
      kodeUnit: parsed.unit || 'D',
      bulanRomawi: parsed.romanMonth,
      tahun: parsed.year,
      tanggalSurat: cl.tanggalSurat,
      namaWarga: cl.namaPemohon,
      nik: cl.nik,
      nomorRumah: cl.nomorRumah,
      keperluan: cl.keperluan,
      petugas: cl.petugasPembuat,
      sourceType: 'pengantar',
      isDuplicate: false,
      isValidStandard: parsed.isValidStandard,
      rawItem: cl
    });
  });

  // 2. Surat Keterangan Pindah Domisili
  movedList.forEach((mov) => {
    const nomor = mov.nomorSuratPindah || '';
    const parsed = parseLetterNumber(nomor);
    records.push({
      id: mov.id,
      nomorSurat: nomor,
      nomorUrut: parsed.sequence,
      kodeJenis: 'SKPD',
      namaJenis: LETTER_TYPES.SKPD.name,
      kodeUnit: parsed.unit || 'D',
      bulanRomawi: parsed.romanMonth,
      tahun: parsed.year,
      tanggalSurat: mov.tanggalPindah,
      namaWarga: mov.nama,
      nik: mov.nik,
      nomorRumah: mov.nomorRumahAsal,
      keperluan: `Pindah Domisili ke ${mov.alamatTujuan} (${mov.alasanPindah})`,
      petugas: mov.petugasPencatat,
      sourceType: 'pindah',
      isDuplicate: false,
      isValidStandard: parsed.isValidStandard,
      rawItem: mov
    });
  });

  // 3. Surat Keterangan Kematian
  deceasedList.forEach((dec) => {
    const nomor = dec.nomorSuratKematian || '';
    const parsed = parseLetterNumber(nomor);
    records.push({
      id: dec.id,
      nomorSurat: nomor,
      nomorUrut: parsed.sequence,
      kodeJenis: 'SKK',
      namaJenis: LETTER_TYPES.SKK.name,
      kodeUnit: parsed.unit || 'D',
      bulanRomawi: parsed.romanMonth,
      tahun: parsed.year,
      tanggalSurat: dec.tanggalMeninggal,
      namaWarga: dec.nama,
      nik: dec.nik,
      nomorRumah: dec.nomorRumah,
      keperluan: `Kematian di ${dec.namaTempatMeninggal || dec.tempatMeninggal}, Makam: ${dec.tempatPemakaman}`,
      petugas: dec.petugasPencatat,
      sourceType: 'meninggal',
      isDuplicate: false,
      isValidStandard: parsed.isValidStandard,
      rawItem: dec
    });
  });

  // Deteksi Duplikasi Nomor Surat
  const countsByNumber = new Map<string, number>();
  records.forEach((r) => {
    if (r.nomorSurat) {
      const normalized = r.nomorSurat.trim().toUpperCase();
      countsByNumber.set(normalized, (countsByNumber.get(normalized) || 0) + 1);
    }
  });

  records.forEach((r) => {
    if (r.nomorSurat) {
      const normalized = r.nomorSurat.trim().toUpperCase();
      if ((countsByNumber.get(normalized) || 0) > 1) {
        r.isDuplicate = true;
      }
    }
  });

  // Urutkan berdasarkan Tahun (descending), kemudian Nomor Urut (descending), kemudian Tanggal (descending)
  return records.sort((a, b) => {
    const yrA = Number(a?.tahun) || 0;
    const yrB = Number(b?.tahun) || 0;
    if (yrB !== yrA) return yrB - yrA;
    const numA = Number(a?.nomorUrut) || 0;
    const numB = Number(b?.nomorUrut) || 0;
    if (numB !== numA) return numB - numA;
    const timeA = a?.tanggalSurat ? new Date(a.tanggalSurat).getTime() : 0;
    const timeB = b?.tanggalSurat ? new Date(b.tanggalSurat).getTime() : 0;
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });
}

/**
 * Menghitung nomor urut surat berikutnya agar tidak terlewat atau ganda
 * Bisa dihitung per jenis surat atau secara agregat tahunan
 */
export function calculateNextLetterSequence({
  coverLetters = [],
  movedList = [],
  deceasedList = [],
  type,
  year = new Date().getFullYear(),
  mode = 'per-type' // 'per-type' (default) atau 'global-yearly'
}: {
  coverLetters?: CoverLetter[];
  movedList?: MovedCitizen[];
  deceasedList?: DeceasedCitizen[];
  type: LetterType;
  year?: number;
  mode?: 'per-type' | 'global-yearly';
}): {
  nextSequence: number;
  nextFormattedNumber: string;
  existingSequences: number[];
  gaps: number[];
  duplicateSequences: number[];
  maxSequence: number;
} {
  const allRecords = getAllOutgoingLetters(coverLetters, movedList, deceasedList);
  
  // Filter berdasarkan tahun dan mode
  const filtered = allRecords.filter((r) => {
    if (r.tahun !== year) return false;
    if (mode === 'per-type') {
      return r.kodeJenis === type;
    }
    return true;
  });

  const sequences = filtered
    .map((r) => r.nomorUrut)
    .filter((n) => !isNaN(n) && n > 0)
    .sort((a, b) => a - b);

  const seqSet = new Set<number>();
  const duplicateSeqSet = new Set<number>();

  sequences.forEach((n) => {
    if (seqSet.has(n)) {
      duplicateSeqSet.add(n);
    } else {
      seqSet.add(n);
    }
  });

  const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0;
  const nextSequence = maxSequence + 1;

  // Temukan celah (gaps) dari 1 hingga maxSequence
  const gaps: number[] = [];
  for (let i = 1; i <= maxSequence; i++) {
    if (!seqSet.has(i)) {
      gaps.push(i);
    }
  }

  const romanMonth = getRomanMonth(new Date());
  const nextFormattedNumber = formatLetterNumber({
    sequence: nextSequence,
    type,
    unit: 'D',
    customYear: year,
    customRomanMonth: romanMonth
  });

  return {
    nextSequence,
    nextFormattedNumber,
    existingSequences: sequences,
    gaps,
    duplicateSequences: Array.from(duplicateSeqSet),
    maxSequence
  };
}

/**
 * Cek apakah sebuah nomor surat sudah digunakan di sistem
 */
export function isLetterNumberExists(
  nomorSuratToCheck: string,
  coverLetters: CoverLetter[] = [],
  movedList: MovedCitizen[] = [],
  deceasedList: DeceasedCitizen[] = [],
  currentRecordId?: string
): boolean {
  if (!nomorSuratToCheck) return false;
  const target = nomorSuratToCheck.trim().toUpperCase();

  const allRecords = getAllOutgoingLetters(coverLetters, movedList, deceasedList);
  return allRecords.some((r) => r.id !== currentRecordId && r.nomorSurat.trim().toUpperCase() === target);
}
