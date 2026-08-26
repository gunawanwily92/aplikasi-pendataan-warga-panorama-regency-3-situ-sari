export type BlokName = 'D1' | 'D2' | 'D3' | 'D4';

export interface OfficialHouseRef {
  blok: BlokName;
  nomor: string;
  formattedNomor: string; // e.g. "Blok D1 No. 01" or "Blok D2 No. 12A"
}

// Master data acuan resmi Blok & Nomor Rumah Panorama Regency 3 Blok D (Total 110 Unit)
export const MASTER_HOUSE_NUMBERS: Record<BlokName, string[]> = {
  D1: Array.from({ length: 45 }, (_, i) => String(i + 1)),
  D2: [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '12A', '12B', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48'
  ],
  D3: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  D4: ['1', '2', '3', '4', '5', '6']
};

export const BLOK_LIST: BlokName[] = ['D1', 'D2', 'D3', 'D4'];

export const BLOK_TOTAL_UNITS: Record<BlokName, number> = {
  D1: MASTER_HOUSE_NUMBERS.D1.length, // 45
  D2: MASTER_HOUSE_NUMBERS.D2.length, // 50 (includes 12A, 12B)
  D3: MASTER_HOUSE_NUMBERS.D3.length, // 9
  D4: MASTER_HOUSE_NUMBERS.D4.length  // 6
};

export const TOTAL_OFFICIAL_HOUSES = 
  BLOK_TOTAL_UNITS.D1 + BLOK_TOTAL_UNITS.D2 + BLOK_TOTAL_UNITS.D3 + BLOK_TOTAL_UNITS.D4; // 110 units

export function formatHouseNumber(blok: string, nomor: string): string {
  if (!nomor) return `Blok ${blok}`;
  // Format with leading zero if single digit number
  const cleanNomor = nomor.trim();
  const isNumericOnly = /^\d+$/.test(cleanNomor);
  const displayNum = isNumericOnly && parseInt(cleanNomor, 10) < 10 
    ? `0${parseInt(cleanNomor, 10)}` 
    : cleanNomor;
  return `Blok ${blok} No. ${displayNum}`;
}

export function isValidMasterHouse(blok: string, nomor: string): boolean {
  if (!blok || !nomor) return false;
  const b = blok.toUpperCase() as BlokName;
  if (!MASTER_HOUSE_NUMBERS[b]) return false;
  
  const cleanNomor = nomor.trim().toUpperCase();
  // Also check without leading zero
  const unpadded = cleanNomor.replace(/^0+/, '');
  return MASTER_HOUSE_NUMBERS[b].includes(cleanNomor) || MASTER_HOUSE_NUMBERS[b].includes(unpadded);
}
