import React from 'react';
import { Home, Users, PlusCircle, BarChart3, Download, Search, LogOut, UserCheck, Truck, HeartCrack, FileText, BookOpen, Database, Shield, Video } from 'lucide-react';
import { ActiveTab, HouseUnit, AuthUser } from '../types/census';
import { getAllResidents } from '../utils/censusHelpers';
import { LogoBlokD } from './LogoBlokD';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  houses: HouseUnit[];
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  houses,
  onOpenAddModal,
  searchQuery,
  setSearchQuery,
  currentUser,
  onLogout
}) => {
  const totalHouses = houses.length;
  const occupiedHouses = houses.filter((h) => h.statusHunian === 'tetap' || h.statusHunian === 'kontrak' || h.statusHunian === 'usaha').length;
  const allResidents = getAllResidents(houses);
  const totalJiwa = allResidents.length;

  const isGuest = currentUser?.isGuest || currentUser?.role === 'warga';
  const isSaturday = new Date().getDay() === 6;

  // Bangun daftar menu navigasi sesuai peran
  type NavItem = { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string };
  const navItems: NavItem[] = [];

  if (isGuest) {
    // Khusus Warga: Ringkasan, Modul Ronda Siskamling, dan CCTV Monitoring
    navItems.push(
      { id: 'dashboard', label: 'Ringkasan', icon: Home },
      { id: 'ronda', label: 'Siskamling & Ronda', icon: Shield, badge: isSaturday ? 'Sabtu' : 'Aktif' },
      { id: 'cctv', label: 'Monitoring CCTV', icon: Video, badge: 'Live' }
    );
  } else {
    // Pengurus RT: Akses penuh administrasi + Modul Ronda + CCTV
    navItems.push(
      { id: 'dashboard', label: 'Ringkasan', icon: Home },
      { id: 'warga', label: 'Data Warga', icon: Users },
      { id: 'pengantar', label: 'Surat Pengantar', icon: FileText },
      { id: 'ronda', label: 'Siskamling & Ronda', icon: Shield, badge: isSaturday ? 'Sabtu' : 'Aktif' },
      { id: 'cctv', label: 'Monitoring CCTV', icon: Video, badge: 'Live' },
      { id: 'pindah', label: 'Warga Pindah', icon: Truck },
      { id: 'meninggal', label: 'Warga Meninggal', icon: HeartCrack },
      { id: 'agenda', label: 'Agenda Surat', icon: BookOpen },
      { id: 'statistik', label: 'Demografi', icon: BarChart3 },
      { id: 'ekspor', label: 'Cetak & Ekspor', icon: Download },
    );
  }

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
      {/* Top Banner */}
      <div className="px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <LogoBlokD className="w-10 h-10 rounded-xl shadow-md ring-1 ring-white/20" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
                  DATA WARGA BLOK D
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Database className="w-2.5 h-2.5 text-amber-400" />
                  Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Panorama Regency 3 • Desa Situ Sari, Cileungsi
              </p>
            </div>
          </div>

            {/* Quick Action & User Profile Info */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap">
              <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300">
                <div>
                  <span className="text-white font-bold">{totalHouses}</span> Unit
                </div>
                <span className="text-slate-600">•</span>
                <div>
                  <span className="text-emerald-400 font-bold">{occupiedHouses}</span> Dihuni
                </div>
                <span className="text-slate-600">•</span>
                <div>
                  <span className="text-blue-400 font-bold">{totalJiwa}</span> Jiwa
                </div>
              </div>

              {!currentUser?.isGuest && currentUser?.role !== 'warga' && (
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-950/40 transition-all cursor-pointer ring-1 ring-blue-500/50"
                  title="Tambah Data Rumah Baru"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Input Data</span>
                </button>
              )}

              {/* Current User Session Widget */}
              {currentUser && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="flex items-center gap-2 bg-slate-800/90 py-1 px-2.5 rounded-xl border border-slate-700/80">
                    <div className="relative">
                      <div className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center border uppercase ${
                        currentUser.isGuest ? 'bg-sky-700 border-sky-400/40' : 'bg-emerald-600 border-emerald-400/40'
                      }`}>
                        {currentUser.nama
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('') || 'W'}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-900 ${
                        currentUser.isGuest ? 'bg-sky-400' : 'bg-emerald-400'
                      }`} />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-white leading-none">
                        {currentUser.nama}
                      </div>
                      <div className={`text-[10px] font-medium leading-tight mt-0.5 flex items-center gap-1 ${
                        currentUser.isGuest ? 'text-sky-300' : 'text-emerald-400'
                      }`}>
                        <UserCheck className="w-3 h-3 inline" />
                        <span>{currentUser.jabatan}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg border transition-all cursor-pointer shadow-sm text-xs font-semibold ${
                      currentUser.isGuest
                        ? 'text-sky-200 hover:text-white bg-sky-950/50 hover:bg-sky-800 border-sky-700/60 hover:border-sky-500'
                        : 'text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-600 border-rose-800/60 hover:border-rose-500'
                    }`}
                    title={currentUser.isGuest ? 'Masuk sebagai Pengurus RT' : 'Keluar / Logout dari Sistem'}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">
                      {currentUser.isGuest ? 'Login Pengurus' : 'Keluar'}
                    </span>
                  </button>
                </div>
              )}
            </div>
        </div>

        {/* Global Quick Search Bar for Pengurus or Status Bar for Warga */}
        {!isGuest ? (
          <div className="mt-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari warga, nomor rumah (contoh: D.01), NIK, nomor plat, atau no. HP..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/90 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-400 rounded-xl text-xs sm:text-sm border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Bersihkan
              </button>
            )}
          </div>
        ) : (
          <div className="mt-2.5 px-3 py-1.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Akses Warga: Ringkasan Transparansi Data Blok D</span>
            </span>
            {isSaturday && (
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Hari Ini: Jadwal Ronda Sabtu Aktif</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs (Mobile Scrollable) */}
      <div className="px-2 sm:px-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 min-w-max py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-white text-blue-900' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

