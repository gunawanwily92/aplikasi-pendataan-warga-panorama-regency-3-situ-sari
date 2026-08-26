import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HouseUnit, RondaSchedule, MovedCitizen, DeceasedCitizen, CoverLetter, RondaAttendance } from '../types/census';
import { isGenericBlokD } from '../data/initialData';

const HOUSES_COLL = 'houses';
const RONDA_COLL = 'ronda_schedules';
const RONDA_ATTENDANCE_COLL = 'ronda_attendance';
const MOVED_COLL = 'moved_citizens';
const DECEASED_COLL = 'deceased_citizens';
const COVER_LETTERS_COLL = 'cover_letters';

/**
 * Real-time listener untuk data Rumah & Warga Aktif
 */
export function subscribeHouses(
  onData: (houses: HouseUnit[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collRef = collection(db, HOUSES_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: HouseUnit[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as HouseUnit;
        // Filter agar data generic atau rumah tanpa warga tidak masuk
        if (!isGenericBlokD(data.nomorRumah, data.id) && data.residents && data.residents.length > 0) {
          items.push({
            ...data,
            id: docSnap.id || data.id
          });
        }
      });
      // Urutkan berdasarkan nomor urut slot
      items.sort((a, b) => (a.nomorUrut || 0) - (b.nomorUrut || 0));
      onData(items);
    },
    (error) => {
      console.error('Error listening to Firestore houses:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Menyimpan / memperbarui 1 unit rumah di Firestore
 */
export async function saveHouseToFirestore(house: HouseUnit): Promise<void> {
  if (!house.id) return;
  // Jika rumah tidak memiliki warga aktif, hapus dari Firestore
  if (!house.residents || house.residents.length === 0) {
    await deleteHouseFromFirestore(house.id);
    return;
  }
  const cleanHouse = {
    ...house,
    updatedAt: new Date().toISOString()
  };
  const docRef = doc(db, HOUSES_COLL, house.id);
  await setDoc(docRef, cleanHouse, { merge: true });
}

/**
 * Menghapus 1 unit rumah dari Firestore
 */
export async function deleteHouseFromFirestore(houseId: string): Promise<void> {
  if (!houseId) return;
  const docRef = doc(db, HOUSES_COLL, houseId);
  await deleteDoc(docRef);
}

/**
 * Batch import / replace seluruh data rumah di Firestore
 */
export async function syncAllHousesToFirestore(houses: HouseUnit[]): Promise<void> {
  const cleanList = houses.filter(
    (h) => !isGenericBlokD(h.nomorRumah, h.id) && h.residents && h.residents.length > 0
  );

  // Ambil semua existing docs untuk membersihkan yang dihapus
  const snapshot = await getDocs(collection(db, HOUSES_COLL));
  const existingIds = new Set<string>();
  snapshot.forEach((d) => existingIds.add(d.id));

  const targetIds = new Set(cleanList.map((h) => h.id));

  // Chunking batch max 450 items
  const batch = writeBatch(db);
  let opCount = 0;

  // Hapus data lama yang sudah tidak ada
  for (const existingId of existingIds) {
    if (!targetIds.has(existingId)) {
      batch.delete(doc(db, HOUSES_COLL, existingId));
      opCount++;
    }
  }

  // Simpan / update data baru
  for (const house of cleanList) {
    const docRef = doc(db, HOUSES_COLL, house.id);
    batch.set(docRef, { ...house, updatedAt: new Date().toISOString() }, { merge: true });
    opCount++;
  }

  if (opCount > 0) {
    await batch.commit();
  }
}

/**
 * Real-time listener untuk Jadwal Ronda
 */
export function subscribeRonda(
  onData: (schedules: RondaSchedule[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collRef = collection(db, RONDA_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: RondaSchedule[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as RondaSchedule);
      });
      if (items.length > 0) {
        // Urutkan hari Senin s/d Minggu
        const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        items.sort((a, b) => daysOrder.indexOf(a.hari) - daysOrder.indexOf(b.hari));
        onData(items);
      }
    },
    (error) => {
      console.error('Error listening to Firestore ronda schedules:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Menyimpan seluruh jadwal ronda ke Firestore
 */
export async function saveRondaToFirestore(schedules: RondaSchedule[]): Promise<void> {
  const batch = writeBatch(db);
  for (const item of schedules) {
    const docRef = doc(db, RONDA_COLL, item.hari);
    batch.set(docRef, item, { merge: true });
  }
  await batch.commit();
}

/**
 * Real-time listener untuk Presensi / Daftar Hadir Ronda
 */
export function subscribeRondaAttendance(
  onData: (attendances: RondaAttendance[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collRef = collection(db, RONDA_ATTENDANCE_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: RondaAttendance[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as RondaAttendance;
        items.push({
          ...data,
          id: docSnap.id || data.id,
        });
      });
      // Sort newest first
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      console.error('Error listening to Firestore ronda attendance:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Menyimpan presensi kehadiran ronda ke Firestore
 */
export async function saveRondaAttendanceToFirestore(attendance: RondaAttendance): Promise<void> {
  if (!attendance.id) return;
  const docRef = doc(db, RONDA_ATTENDANCE_COLL, attendance.id);
  await setDoc(docRef, {
    ...attendance,
    createdAt: attendance.createdAt || new Date().toISOString(),
  }, { merge: true });
}

/**
 * Menghapus presensi kehadiran ronda
 */
export async function deleteRondaAttendanceFromFirestore(id: string): Promise<void> {
  if (!id) return;
  const docRef = doc(db, RONDA_ATTENDANCE_COLL, id);
  await deleteDoc(docRef);
}

/**
 * Real-time listener untuk Warga Pindah
 */
export function subscribeMoved(
  onData: (moved: MovedCitizen[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collRef = collection(db, MOVED_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: MovedCitizen[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MovedCitizen);
      });
      onData(items);
    },
    (error) => {
      console.error('Error listening to Firestore moved citizens:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveMovedCitizenToFirestore(moved: MovedCitizen): Promise<void> {
  if (!moved.id) return;
  const docRef = doc(db, MOVED_COLL, moved.id);
  await setDoc(docRef, moved, { merge: true });
}

export async function deleteMovedCitizenFromFirestore(id: string): Promise<void> {
  if (!id) return;
  await deleteDoc(doc(db, MOVED_COLL, id));
}

export async function syncAllMovedCitizensToFirestore(list: MovedCitizen[]): Promise<void> {
  const snapshot = await getDocs(collection(db, MOVED_COLL));
  const existingIds = new Set<string>();
  snapshot.forEach((d) => existingIds.add(d.id));
  const targetIds = new Set(list.map((m) => m.id));

  const batch = writeBatch(db);
  for (const existingId of existingIds) {
    if (!targetIds.has(existingId)) {
      batch.delete(doc(db, MOVED_COLL, existingId));
    }
  }
  for (const item of list) {
    batch.set(doc(db, MOVED_COLL, item.id), item, { merge: true });
  }
  await batch.commit();
}

/**
 * Real-time listener untuk Warga Meninggal
 */
export function subscribeDeceased(
  onData: (deceased: DeceasedCitizen[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collRef = collection(db, DECEASED_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: DeceasedCitizen[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as DeceasedCitizen);
      });
      onData(items);
    },
    (error) => {
      console.error('Error listening to Firestore deceased citizens:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveDeceasedCitizenToFirestore(deceased: DeceasedCitizen): Promise<void> {
  if (!deceased.id) return;
  const docRef = doc(db, DECEASED_COLL, deceased.id);
  await setDoc(docRef, deceased, { merge: true });
}

export async function deleteDeceasedCitizenFromFirestore(id: string): Promise<void> {
  if (!id) return;
  await deleteDoc(doc(db, DECEASED_COLL, id));
}

export async function syncAllDeceasedCitizensToFirestore(list: DeceasedCitizen[]): Promise<void> {
  const snapshot = await getDocs(collection(db, DECEASED_COLL));
  const existingIds = new Set<string>();
  snapshot.forEach((d) => existingIds.add(d.id));
  const targetIds = new Set(list.map((m) => m.id));

  const batch = writeBatch(db);
  for (const existingId of existingIds) {
    if (!targetIds.has(existingId)) {
      batch.delete(doc(db, DECEASED_COLL, existingId));
    }
  }
  for (const item of list) {
    batch.set(doc(db, DECEASED_COLL, item.id), item, { merge: true });
  }
  await batch.commit();
}

/**
 * Real-time listener untuk Surat Pengantar & Agenda Surat
 */
export function subscribeCoverLetters(
  onData: (letters: CoverLetter[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collRef = collection(db, COVER_LETTERS_COLL);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: CoverLetter[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CoverLetter);
      });
      onData(items);
    },
    (error) => {
      console.error('Error listening to Firestore cover letters:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveCoverLetterToFirestore(letter: CoverLetter): Promise<void> {
  if (!letter.id) return;
  const docRef = doc(db, COVER_LETTERS_COLL, letter.id);
  await setDoc(docRef, letter, { merge: true });
}

export async function deleteCoverLetterFromFirestore(id: string): Promise<void> {
  if (!id) return;
  await deleteDoc(doc(db, COVER_LETTERS_COLL, id));
}

export async function syncAllCoverLettersToFirestore(list: CoverLetter[]): Promise<void> {
  const snapshot = await getDocs(collection(db, COVER_LETTERS_COLL));
  const existingIds = new Set<string>();
  snapshot.forEach((d) => existingIds.add(d.id));
  const targetIds = new Set(list.map((m) => m.id));

  const batch = writeBatch(db);
  for (const existingId of existingIds) {
    if (!targetIds.has(existingId)) {
      batch.delete(doc(db, COVER_LETTERS_COLL, existingId));
    }
  }
  for (const item of list) {
    batch.set(doc(db, COVER_LETTERS_COLL, item.id), item, { merge: true });
  }
  await batch.commit();
}

/**
 * Inisialisasi awal ke Firestore jika koleksi masih kosong
 */
export async function bootstrapFirestoreIfEmpty(
  initialHouses: HouseUnit[],
  initialRonda: RondaSchedule[],
  initialMoved: MovedCitizen[],
  initialDeceased: DeceasedCitizen[],
  initialLetters: CoverLetter[]
): Promise<void> {
  try {
    const housesSnap = await getDocs(collection(db, HOUSES_COLL));
    if (housesSnap.empty && initialHouses.length > 0) {
      console.log('Bootstrapping initial houses to Firestore...');
      await syncAllHousesToFirestore(initialHouses);
    }

    const rondaSnap = await getDocs(collection(db, RONDA_COLL));
    if (rondaSnap.empty && initialRonda.length > 0) {
      console.log('Bootstrapping initial ronda schedules to Firestore...');
      await saveRondaToFirestore(initialRonda);
    }

    const movedSnap = await getDocs(collection(db, MOVED_COLL));
    if (movedSnap.empty && initialMoved.length > 0) {
      await syncAllMovedCitizensToFirestore(initialMoved);
    }

    const deceasedSnap = await getDocs(collection(db, DECEASED_COLL));
    if (deceasedSnap.empty && initialDeceased.length > 0) {
      await syncAllDeceasedCitizensToFirestore(initialDeceased);
    }

    const lettersSnap = await getDocs(collection(db, COVER_LETTERS_COLL));
    if (lettersSnap.empty && initialLetters.length > 0) {
      await syncAllCoverLettersToFirestore(initialLetters);
    }
  } catch (err) {
    console.error('Error bootstrapping data to Firestore:', err);
  }
}
