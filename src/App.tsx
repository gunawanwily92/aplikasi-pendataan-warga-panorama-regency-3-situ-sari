import React, { useState, useEffect } from 'react';
import { HouseUnit, RondaSchedule, ActiveTab, AuthUser, MovedCitizen, DeceasedCitizen, CoverLetter, RondaAttendance } from './types/census';
import {
  INITIAL_HOUSES,
  INITIAL_RONDA_SCHEDULE,
  INITIAL_MOVED_CITIZENS,
  INITIAL_DECEASED_CITIZENS,
  INITIAL_COVER_LETTERS,
  isGenericBlokD,
  loadHousesFromStorage,
  saveHousesToStorage,
  loadRondaFromStorage,
  saveRondaToStorage,
  loadMovedFromStorage,
  saveMovedToStorage,
  loadDeceasedFromStorage,
  saveDeceasedToStorage,
  loadCoverLettersFromStorage,
  saveCoverLettersToStorage
} from './data/initialData';
import {
  subscribeHouses,
  saveHouseToFirestore,
  deleteHouseFromFirestore,
  syncAllHousesToFirestore,
  subscribeRonda,
  saveRondaToFirestore,
  subscribeMoved,
  saveMovedCitizenToFirestore,
  deleteMovedCitizenFromFirestore,
  syncAllMovedCitizensToFirestore,
  subscribeDeceased,
  saveDeceasedCitizenToFirestore,
  deleteDeceasedCitizenFromFirestore,
  syncAllDeceasedCitizensToFirestore,
  subscribeCoverLetters,
  saveCoverLetterToFirestore,
  deleteCoverLetterFromFirestore,
  syncAllCoverLettersToFirestore,
  subscribeRondaAttendance,
  saveRondaAttendanceToFirestore,
  deleteRondaAttendanceFromFirestore,
  bootstrapFirestoreIfEmpty
} from './services/firestoreService';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CensusList } from './components/CensusList';
import { CoverLetterView } from './components/CoverLetterView';
import { MovedCitizensView } from './components/MovedCitizensView';
import { DeceasedCitizensView } from './components/DeceasedCitizensView';
import { LetterAgendaView } from './components/LetterAgendaView';
import { DemographicsStats } from './components/DemographicsStats';
import { ExportPrintModal } from './components/ExportPrintModal';
import { CensusFormModal } from './components/CensusFormModal';
import { CitizenCardModal } from './components/CitizenCardModal';
import { LoginScreen } from './components/LoginScreen';
import { RondaModule } from './components/RondaModule';
import { Home, Users, BarChart3, PlusCircle, LogOut, AlertTriangle, Building2, ShieldCheck, FileSpreadsheet, Truck, HeartCrack, FileText, BookOpen, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('PR3_AUTH_USER_SESSION') || sessionStorage.getItem('PR3_AUTH_USER_SESSION');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading auth session:', e);
    }
    return null;
  });

  const [houses, setHouses] = useState<HouseUnit[]>(() => loadHousesFromStorage());
  const [rondaSchedule, setRondaSchedule] = useState<RondaSchedule[]>(() => loadRondaFromStorage());
  const [movedList, setMovedList] = useState<MovedCitizen[]>(() => loadMovedFromStorage());
  const [deceasedList, setDeceasedList] = useState<DeceasedCitizen[]>(() => loadDeceasedFromStorage());
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>(() => loadCoverLettersFromStorage());
  const [rondaAttendances, setRondaAttendances] = useState<RondaAttendance[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isGuest = currentUser?.isGuest || currentUser?.role === 'warga';
  const isSaturday = new Date().getDay() === 6;

  // Proteksi: Jika user adalah Warga dan mencoba membuka tab di luar Ringkasan dan Ronda, arahkan ke dashboard
  useEffect(() => {
    if (isGuest) {
      if (activeTab !== 'dashboard' && activeTab !== 'ronda') {
        setActiveTab('dashboard');
      }
    }
  }, [isGuest, activeTab]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingHouse, setEditingHouse] = useState<HouseUnit | null>(null);
  const [quickAddSlot, setQuickAddSlot] = useState<number | null>(null);
  const [viewingCardHouse, setViewingCardHouse] = useState<HouseUnit | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Inisialisasi & Real-Time Sync dengan Firebase Firestore
  useEffect(() => {
    // 1. Inisialisasi data awal Firestore jika belum ada
    bootstrapFirestoreIfEmpty(
      loadHousesFromStorage(),
      loadRondaFromStorage(),
      loadMovedFromStorage(),
      loadDeceasedFromStorage(),
      loadCoverLettersFromStorage()
    );

    // 2. Pasang real-time listeners ke Firestore
    const unsubHouses = subscribeHouses((firestoreHouses) => {
      setHouses(firestoreHouses);
      saveHousesToStorage(firestoreHouses);
    });

    const unsubRonda = subscribeRonda((firestoreRonda) => {
      if (firestoreRonda.length > 0) {
        setRondaSchedule(firestoreRonda);
        saveRondaToStorage(firestoreRonda);
      }
    });

    const unsubMoved = subscribeMoved((firestoreMoved) => {
      setMovedList(firestoreMoved);
      saveMovedToStorage(firestoreMoved);
    });

    const unsubDeceased = subscribeDeceased((firestoreDeceased) => {
      setDeceasedList(firestoreDeceased);
      saveDeceasedToStorage(firestoreDeceased);
    });

    const unsubLetters = subscribeCoverLetters((firestoreLetters) => {
      setCoverLetters(firestoreLetters);
      saveCoverLettersToStorage(firestoreLetters);
    });

    const unsubAttendance = subscribeRondaAttendance((firestoreAttendance) => {
      setRondaAttendances(firestoreAttendance);
    });

    return () => {
      unsubHouses();
      unsubRonda();
      unsubMoved();
      unsubDeceased();
      unsubLetters();
      unsubAttendance();
    };
  }, []);

  // Simpan juga ke local storage sebagai backup cache offline
  useEffect(() => {
    saveHousesToStorage(houses);
  }, [houses]);

  useEffect(() => {
    saveRondaToStorage(rondaSchedule);
  }, [rondaSchedule]);

  useEffect(() => {
    saveMovedToStorage(movedList);
  }, [movedList]);

  useEffect(() => {
    saveDeceasedToStorage(deceasedList);
  }, [deceasedList]);

  useEffect(() => {
    saveCoverLettersToStorage(coverLetters);
  }, [coverLetters]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    try {
      localStorage.removeItem('PR3_AUTH_USER_SESSION');
      sessionStorage.removeItem('PR3_AUTH_USER_SESSION');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setIsLogoutModalOpen(false);
  };

  const handleSaveHouse = (houseData: HouseUnit) => {
    // Jika data rumah memiliki 0 jiwa, jangan masukkan / hapus dari direktori data warga aktif
    if (!houseData.residents || houseData.residents.length === 0) {
      setHouses((prev) => prev.filter((h) => h.id !== houseData.id));
      deleteHouseFromFirestore(houseData.id).catch(console.error);
      return;
    }
    const exists = houses.some((h) => h.id === houseData.id);
    if (exists) {
      setHouses((prev) => prev.map((h) => (h.id === houseData.id ? houseData : h)));
    } else {
      // Sort by slot number
      const nextList = [...houses, houseData].sort((a, b) => a.nomorUrut - b.nomorUrut);
      setHouses(nextList);
    }
    // Sync ke Firestore
    saveHouseToFirestore(houseData).catch(console.error);
  };

  const handleDeleteHouse = (houseId: string) => {
    setHouses((prev) => prev.filter((h) => h.id !== houseId));
    deleteHouseFromFirestore(houseId).catch(console.error);
  };

  const handleOpenAdd = () => {
    setEditingHouse(null);
    setQuickAddSlot(null);
    setIsFormModalOpen(true);
  };

  const handleEditHouse = (house: HouseUnit) => {
    setEditingHouse(house);
    setQuickAddSlot(null);
    setIsFormModalOpen(true);
  };

  // Handlers for Warga Pindah
  const handleAddMoved = (data: MovedCitizen, removeOption?: { houseId: string; residentId?: string; residentIds?: string[] }) => {
    setMovedList((prev) => [data, ...prev]);
    saveMovedCitizenToFirestore(data).catch(console.error);

    if (removeOption) {
      setHouses((prevHouses) => {
        const next = prevHouses
          .map((h) => {
            if (h.id === removeOption.houseId) {
              const idsToRemove = new Set(
                removeOption.residentIds || (removeOption.residentId ? [removeOption.residentId] : [])
              );
              const nextResidents = h.residents.filter((r) => !idsToRemove.has(r.id));
              const updatedHouse = { ...h, residents: nextResidents };
              saveHouseToFirestore(updatedHouse).catch(console.error);
              return updatedHouse;
            }
            return h;
          })
          .filter((h) => h.residents && h.residents.length > 0);
        return next;
      });
    }
  };

  const handleUpdateMoved = (data: MovedCitizen) => {
    setMovedList((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    saveMovedCitizenToFirestore(data).catch(console.error);
  };

  const handleDeleteMoved = (id: string) => {
    setMovedList((prev) => prev.filter((m) => m.id !== id));
    deleteMovedCitizenFromFirestore(id).catch(console.error);
  };

  // Handlers for Warga Meninggal
  const handleAddDeceased = (data: DeceasedCitizen, removeOption?: { houseId: string; residentId?: string; residentIds?: string[] }) => {
    setDeceasedList((prev) => [data, ...prev]);
    saveDeceasedCitizenToFirestore(data).catch(console.error);

    if (removeOption) {
      setHouses((prevHouses) => {
        const next = prevHouses
          .map((h) => {
            if (h.id === removeOption.houseId) {
              const idsToRemove = new Set(
                removeOption.residentIds || (removeOption.residentId ? [removeOption.residentId] : [])
              );
              const nextResidents = h.residents.filter((r) => !idsToRemove.has(r.id));
              const updatedHouse = { ...h, residents: nextResidents };
              saveHouseToFirestore(updatedHouse).catch(console.error);
              return updatedHouse;
            }
            return h;
          })
          .filter((h) => h.residents && h.residents.length > 0);
        return next;
      });
    }
  };

  const handleUpdateDeceased = (data: DeceasedCitizen) => {
    setDeceasedList((prev) => prev.map((d) => (d.id === data.id ? data : d)));
    saveDeceasedCitizenToFirestore(data).catch(console.error);
  };

  const handleDeleteDeceased = (id: string) => {
    setDeceasedList((prev) => prev.filter((d) => d.id !== id));
    deleteDeceasedCitizenFromFirestore(id).catch(console.error);
  };

  // Handlers for Surat Pengantar
  const handleAddCoverLetter = (letter: CoverLetter) => {
    setCoverLetters((prev) => [letter, ...prev]);
    saveCoverLetterToFirestore(letter).catch(console.error);
  };

  const handleUpdateCoverLetter = (letter: CoverLetter) => {
    setCoverLetters((prev) => prev.map((l) => (l.id === letter.id ? letter : l)));
    saveCoverLetterToFirestore(letter).catch(console.error);
  };

  const handleDeleteCoverLetter = (letterId: string) => {
    setCoverLetters((prev) => prev.filter((l) => l.id !== letterId));
    deleteCoverLetterFromFirestore(letterId).catch(console.error);
  };

  // Handlers for Presensi & Jadwal Ronda Siskamling
  const handleAddRondaAttendance = (attendance: RondaAttendance) => {
    setRondaAttendances((prev) => [attendance, ...prev]);
    saveRondaAttendanceToFirestore(attendance).catch(console.error);
  };

  const handleDeleteRondaAttendance = (id: string) => {
    setRondaAttendances((prev) => prev.filter((a) => a.id !== id));
    deleteRondaAttendanceFromFirestore(id).catch(console.error);
  };

  const handleUpdateRondaSchedule = (schedules: RondaSchedule[]) => {
    setRondaSchedule(schedules);
    saveRondaToStorage(schedules);
    saveRondaToFirestore(schedules).catch(console.error);
  };

  const handleImportData = (
    importedHouses: HouseUnit[],
    importedMoved?: MovedCitizen[],
    importedDeceased?: DeceasedCitizen[],
    importedCoverLetters?: CoverLetter[]
  ) => {
    const validHouses = (importedHouses || []).filter(
      (h) => !isGenericBlokD(h?.nomorRumah, h?.id) && Boolean(h?.residents && h.residents.length > 0)
    );
    setHouses(validHouses);
    syncAllHousesToFirestore(validHouses).catch(console.error);

    if (importedMoved && Array.isArray(importedMoved)) {
      const validMoved = importedMoved.filter((m) => !isGenericBlokD(m?.nomorRumahAsal));
      setMovedList(validMoved);
      syncAllMovedCitizensToFirestore(validMoved).catch(console.error);
    }
    if (importedDeceased && Array.isArray(importedDeceased)) {
      const validDeceased = importedDeceased.filter((d) => !isGenericBlokD(d?.nomorRumah));
      setDeceasedList(validDeceased);
      syncAllDeceasedCitizensToFirestore(validDeceased).catch(console.error);
    }
    if (importedCoverLetters && Array.isArray(importedCoverLetters)) {
      const validLetters = importedCoverLetters.filter((l) => !isGenericBlokD(l?.nomorRumah));
      setCoverLetters(validLetters);
      syncAllCoverLettersToFirestore(validLetters).catch(console.error);
    }
  };

  const handleResetData = () => {
    setHouses(INITIAL_HOUSES);
    setRondaSchedule(INITIAL_RONDA_SCHEDULE);
    setMovedList(INITIAL_MOVED_CITIZENS);
    setDeceasedList(INITIAL_DECEASED_CITIZENS);
    setCoverLetters(INITIAL_COVER_LETTERS);
    syncAllHousesToFirestore(INITIAL_HOUSES).catch(console.error);
    saveRondaToFirestore(INITIAL_RONDA_SCHEDULE).catch(console.error);
    syncAllMovedCitizensToFirestore(INITIAL_MOVED_CITIZENS).catch(console.error);
    syncAllDeceasedCitizensToFirestore(INITIAL_DECEASED_CITIZENS).catch(console.error);
    syncAllCoverLettersToFirestore(INITIAL_COVER_LETTERS).catch(console.error);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Application Web Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        houses={houses}
        onOpenAddModal={handleOpenAdd}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (!isGuest && q.trim() && activeTab !== 'warga') {
            setActiveTab('warga');
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Web Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            houses={houses}
            movedList={movedList}
            deceasedList={deceasedList}
            currentUser={currentUser}
            onOpenAddModal={handleOpenAdd}
            onNavigateTab={(tab) => {
              if (isGuest && tab !== 'dashboard' && tab !== 'ronda') {
                return;
              }
              setActiveTab(tab);
            }}
            onSelectHouse={(house) => {
              if (!isGuest) {
                setViewingCardHouse(house);
              }
            }}
            onOpenLoginModal={handleLogout}
          />
        )}

        {/* Tab Ronda & Siskamling Terpadu Blok D */}
        {activeTab === 'ronda' && (
          <RondaModule
            currentUser={currentUser}
            houses={houses}
            rondaSchedule={rondaSchedule}
            attendances={rondaAttendances}
            onAddAttendance={handleAddRondaAttendance}
            onDeleteAttendance={handleDeleteRondaAttendance}
            onUpdateSchedule={handleUpdateRondaSchedule}
          />
        )}

        {!isGuest && activeTab === 'warga' && (
          <CensusList
            houses={houses}
            searchQuery={searchQuery}
            onEditHouse={handleEditHouse}
            onDeleteHouse={handleDeleteHouse}
            onViewCitizenCard={(house) => setViewingCardHouse(house)}
          />
        )}

        {!isGuest && activeTab === 'pengantar' && (
          <CoverLetterView
            coverLetters={coverLetters}
            movedList={movedList}
            deceasedList={deceasedList}
            houses={houses}
            currentUser={currentUser}
            onAddCoverLetter={handleAddCoverLetter}
            onUpdateCoverLetter={handleUpdateCoverLetter}
            onDeleteCoverLetter={handleDeleteCoverLetter}
          />
        )}

        {!isGuest && activeTab === 'pindah' && (
          <MovedCitizensView
            movedList={movedList}
            coverLetters={coverLetters}
            deceasedList={deceasedList}
            houses={houses}
            currentUser={currentUser}
            onAddMoved={handleAddMoved}
            onUpdateMoved={handleUpdateMoved}
            onDeleteMoved={handleDeleteMoved}
          />
        )}

        {!isGuest && activeTab === 'meninggal' && (
          <DeceasedCitizensView
            deceasedList={deceasedList}
            coverLetters={coverLetters}
            movedList={movedList}
            houses={houses}
            currentUser={currentUser}
            onAddDeceased={handleAddDeceased}
            onUpdateDeceased={handleUpdateDeceased}
            onDeleteDeceased={handleDeleteDeceased}
          />
        )}

        {!isGuest && activeTab === 'agenda' && (
          <LetterAgendaView
            coverLetters={coverLetters}
            movedList={movedList}
            deceasedList={deceasedList}
            houses={houses}
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {!isGuest && activeTab === 'statistik' && (
          <DemographicsStats
            houses={houses}
            movedList={movedList}
            deceasedList={deceasedList}
          />
        )}

        {!isGuest && activeTab === 'ekspor' && (
          <ExportPrintModal
            houses={houses}
            rondaSchedule={rondaSchedule}
            movedList={movedList}
            deceasedList={deceasedList}
            coverLetters={coverLetters}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Web Footer */}
      <footer className="hidden sm:block border-t border-slate-200 bg-white py-4 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sistem Informasi Data Warga Blok D</span>
            <span>•</span>
            <span>Perumahan Panorama Regency 3, Desa Situ Sari, Cileungsi</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-slate-600 font-medium">by <strong className="text-slate-800 font-semibold">Wily Gunawan</strong></span>
            <span>•</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sesi Aktif: {currentUser.nama} ({currentUser.jabatan})
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Responsive Navigation Bar for smaller browser screens */}
      <nav aria-label="Navigasi Web Mobile" className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 py-1.5 px-2 flex items-center justify-around shadow-xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Ringkasan</span>
        </button>

        <button
          onClick={() => setActiveTab('ronda')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'ronda' ? 'text-emerald-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span className="text-[9px]">Ronda (Sabtu)</span>
        </button>

        {!isGuest ? (
          <>
            <button
              onClick={() => setActiveTab('warga')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'warga' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[9px]">Warga</span>
            </button>

            <button
              onClick={() => setActiveTab('pengantar')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'pengantar' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[9px]">Pengantar</span>
            </button>

            <button
              onClick={() => setActiveTab('pindah')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'pindah' ? 'text-amber-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span className="text-[9px]">Pindah</span>
            </button>

            <button
              onClick={() => setActiveTab('meninggal')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'meninggal' ? 'text-rose-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <HeartCrack className="w-4 h-4" />
              <span className="text-[9px]">Wafat</span>
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'agenda' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[9px]">Agenda</span>
            </button>

            <button
              onClick={() => setActiveTab('statistik')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'statistik' ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[9px]">Demografi</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-blue-600 transition-all shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[9px]">Login Pengurus</span>
          </button>
        )}
      </nav>

      {/* Modal: Input / Edit Sensus */}
      <CensusFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingHouse(null);
          setQuickAddSlot(null);
        }}
        onSave={handleSaveHouse}
        initialData={editingHouse}
        defaultSlotNumber={quickAddSlot}
        currentUser={currentUser}
        existingHouses={houses}
      />

      {/* Modal: Citizen / Household Card with QR & Print */}
      <CitizenCardModal
        house={viewingCardHouse}
        onClose={() => setViewingCardHouse(null)}
      />

      {/* Modal: Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl shadow-black/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Konfirmasi Keluar</h3>
                <p className="text-xs text-slate-400">Sistem Data Warga Blok D</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun <strong className="text-white">{currentUser?.nama}</strong> ({currentUser?.jabatan})?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

