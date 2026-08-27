import React, { useState, useEffect, useRef } from 'react';
import {
  CCTVCamera,
  CCTVIncidentLog,
  AuthUser,
  HouseUnit
} from '../types/census';
import {
  Video,
  Grid,
  Maximize2,
  Minimize2,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  HardDrive,
  Shield,
  Camera,
  RotateCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Plus,
  Edit2,
  Trash2,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Filter,
  Sliders,
  Settings,
  Tv,
  Activity,
  Compass,
  CornerDownRight,
  Sparkles,
  Info,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface CCTVMonitoringModuleProps {
  currentUser: AuthUser | null;
  cameras: CCTVCamera[];
  logs: CCTVIncidentLog[];
  houses?: HouseUnit[];
  onSaveCamera?: (camera: CCTVCamera) => void;
  onDeleteCamera?: (id: string) => void;
  onSaveLog?: (log: CCTVIncidentLog) => void;
  onDeleteLog?: (id: string) => void;
  onResetCameras?: () => void;
}

export const CCTVMonitoringModule: React.FC<CCTVMonitoringModuleProps> = ({
  currentUser,
  cameras,
  logs,
  houses = [],
  onSaveCamera,
  onDeleteCamera,
  onSaveLog,
  onDeleteLog,
  onResetCameras
}) => {
  const isGuest = currentUser?.isGuest || currentUser?.role === 'warga';

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'grid' | 'map' | 'logs' | 'config'>('grid');

  // Grid layout options: 'grid-6' (3x2), 'grid-4' (2x2), 'focus' (1 large focus)
  const [gridLayout, setGridLayout] = useState<'grid-6' | 'grid-4' | 'focus'>('grid-6');
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'cam-01');

  // Global stream filters / toggles
  const [nightVisionMap, setNightVisionMap] = useState<Record<string, boolean>>({});
  const [motionDetectionMap, setMotionDetectionMap] = useState<Record<string, boolean>>({
    'cam-01': true,
    'cam-04': true
  });
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const [ptzOffsets, setPtzOffsets] = useState<Record<string, { pan: number; tilt: number; zoom: number }>>({});

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time clock ticker for surveillance overlay
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Selected camera
  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  // Stats calculation
  const totalCameras = cameras.length;
  const onlineCount = cameras.filter((c) => c.status === 'online').length;
  const maintenanceCount = cameras.filter((c) => c.status === 'maintenance').length;
  const offlineCount = cameras.filter((c) => c.status === 'offline').length;

  // Filter logs
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CCTVCamera | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CCTVIncidentLog | null>(null);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Handle PTZ adjustments
  const handlePtzAdjust = (camId: string, deltaPan: number, deltaTilt: number, deltaZoom: number) => {
    setPtzOffsets((prev) => {
      const current = prev[camId] || { pan: 0, tilt: 0, zoom: 1 };
      const nextPan = Math.max(-100, Math.min(100, current.pan + deltaPan));
      const nextTilt = Math.max(-50, Math.min(50, current.tilt + deltaTilt));
      const nextZoom = Math.max(1, Math.min(3, current.zoom + deltaZoom));
      return {
        ...prev,
        [camId]: { pan: nextPan, tilt: nextTilt, zoom: nextZoom }
      };
    });
  };

  const handlePtzReset = (camId: string) => {
    setPtzOffsets((prev) => ({
      ...prev,
      [camId]: { pan: 0, tilt: 0, zoom: 1 }
    }));
    showToast(`Posisi PTZ ${camId.toUpperCase()} dikembalikan ke posisi preset.`);
  };

  // Capture Snapshot simulation
  const handleCaptureSnapshot = (camera: CCTVCamera) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1280, 720);

    // Gradient
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // Watermark & Details
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`CCTV PANORAMA REGENCY 3 BLOK D`, 40, 50);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`[${camera.nomorKamera}] ${camera.nama.toUpperCase()}`, 40, 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px monospace';
    ctx.fillText(`LOKASI: ${camera.lokasi}`, 40, 125);
    ctx.fillText(`WAKTU : ${currentDate.toUpperCase()} - ${currentTime} WIB`, 40, 155);

    // Red REC circle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(1220, 50, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('REC', 1160, 56);

    // Save as download
    const link = document.createElement('a');
    link.download = `CCTV_${camera.nomorKamera}_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast(`📸 Foto snapshot ${camera.nomorKamera} berhasil diunduh!`);
  };

  // Open Log Incident with camera prefilled
  const handleOpenNewIncident = (camera?: CCTVCamera) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    setEditingLog({
      id: `log-${Date.now()}`,
      tanggal: dateStr,
      waktu: timeStr,
      kameraId: camera?.id || activeCamera?.id || 'cam-01',
      kameraNama: camera?.nama || activeCamera?.nama || 'Pos Kamling Utama',
      lokasi: camera?.lokasi || activeCamera?.lokasi || 'Gerbang Blok D',
      kategori: 'Mencurigakan',
      deskripsi: '',
      pelapor: currentUser?.nama || 'Warga Blok D',
      statusPenanganan: 'Perlu Verifikasi',
      createdAt: now.toISOString()
    });
    setIsLogModalOpen(true);
  };

  // Share incident to WhatsApp
  const handleShareIncidentWA = (log: CCTVIncidentLog) => {
    const text = `🚨 *LAPORAN KEJADIAN DARI MONITORING CCTV BLOK D*
━━━━━━━━━━━━━━━━━━━━
📅 *Tanggal:* ${log.tanggal}
⏰ *Waktu:* ${log.waktu} WIB
📹 *Titik Kamera:* [${log.kameraNama}]
📍 *Lokasi:* ${log.lokasi}
⚠️ *Kategori:* ${log.kategori}
📌 *Status:* ${log.statusPenanganan}

📝 *Deskripsi Kejadian:*
"${log.deskripsi}"

👤 *Pelapor:* ${log.pelapor}
${log.catatanPetugas ? `🛡️ *Catatan Petugas:* ${log.catatanPetugas}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
_Sistem Keamanan & CCTV Blok D - Panorama Regency 3_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Filtered incident logs
  const filteredLogs = logs.filter((log) => {
    const matchCategory = logCategoryFilter === 'all' || log.kategori === logCategoryFilter;
    const matchQuery =
      !logSearchQuery ||
      log.deskripsi.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.lokasi.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.kameraNama.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.pelapor.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div ref={containerRef} className="space-y-6 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Module Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-red-600/90 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Live 24 Jam
              </span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold rounded-lg">
                Sistem Pengawasan CCTV Blok D
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono rounded-lg">
                NVR 16-CH • H.265+
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Video className="w-6 h-6 text-sky-400 shrink-0" />
              <span>Monitoring CCTV Lingkungan Blok D</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pengawasan keamanan terpadu 6 titik kamera strategis di gerbang utama, simpang jalan D1–D4, taman fasum, serta pagar perimeter belakang Panorama Regency 3 Blok D.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            <div className="bg-slate-800/90 border border-slate-700/80 p-2.5 sm:p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-400">
                {onlineCount} <span className="text-xs text-slate-400 font-normal">/ {totalCameras}</span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 p-2.5 sm:p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>NVR HDD</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-sky-400">
                1.8 TB <span className="text-[10px] text-slate-400 font-normal">/ 2TB</span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 p-2.5 sm:p-3 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Insiden</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-400">
                {logs.length} <span className="text-[10px] text-slate-400 font-normal">Log</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Multi-Kamera Live</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Denah Titik Kamera</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Log Kejadian ({logs.length})</span>
            </button>

            {!isGuest && (
              <button
                onClick={() => setActiveTab('config')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pengaturan IP & Kamera</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleOpenNewIncident()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Lapor Kejadian CCTV</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
              title={isFullscreen ? 'Keluar Fullscreen' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: MULTI-CAMERA LIVE GRID ================= */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* View layout selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tampilan Grid:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setGridLayout('grid-6')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                    gridLayout === 'grid-6'
                      ? 'bg-white text-blue-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan 6 Kamera (3x2)"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Semua (6 Cam)</span>
                </button>

                <button
                  onClick={() => setGridLayout('grid-4')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                    gridLayout === 'grid-4'
                      ? 'bg-white text-blue-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan 4 Kamera Utama (2x2)"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>4 Kamera</span>
                </button>

                <button
                  onClick={() => setGridLayout('focus')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                    gridLayout === 'focus'
                      ? 'bg-white text-blue-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan 1 Kamera Fokus"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Fokus 1 Cam</span>
                </button>
              </div>
            </div>

            {/* Camera Quick Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {cameras.map((cam) => {
                const isSelected = cam.id === selectedCameraId;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setSelectedCameraId(cam.id);
                      if (gridLayout !== 'focus') {
                        // scroll or focus
                      }
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cam.status === 'online'
                          ? 'bg-emerald-400'
                          : cam.status === 'maintenance'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span>{cam.nomorKamera}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout Renders */}
          {gridLayout === 'focus' ? (
            /* Single Camera Large Focus Mode */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <CameraFeedCard
                  camera={activeCamera}
                  isLargeFocus={true}
                  currentTime={currentTime}
                  currentDate={currentDate}
                  nightVision={Boolean(nightVisionMap[activeCamera.id])}
                  motionDetection={Boolean(motionDetectionMap[activeCamera.id])}
                  isMuted={Boolean(mutedMap[activeCamera.id])}
                  ptzOffset={ptzOffsets[activeCamera.id] || { pan: 0, tilt: 0, zoom: 1 }}
                  onToggleNightVision={() =>
                    setNightVisionMap((prev) => ({
                      ...prev,
                      [activeCamera.id]: !prev[activeCamera.id]
                    }))
                  }
                  onToggleMotion={() =>
                    setMotionDetectionMap((prev) => ({
                      ...prev,
                      [activeCamera.id]: !prev[activeCamera.id]
                    }))
                  }
                  onToggleMute={() =>
                    setMutedMap((prev) => ({
                      ...prev,
                      [activeCamera.id]: !prev[activeCamera.id]
                    }))
                  }
                  onCaptureSnapshot={() => handleCaptureSnapshot(activeCamera)}
                  onPtzAdjust={(dp, dt, dz) => handlePtzAdjust(activeCamera.id, dp, dt, dz)}
                  onPtzReset={() => handlePtzReset(activeCamera.id)}
                  onOpenIncident={() => handleOpenNewIncident(activeCamera)}
                />
              </div>

              {/* Sidebar Channel List & PTZ Controls */}
              <div className="space-y-4">
                {/* Camera List */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Pilih Saluran Kamera</span>
                    <span className="text-slate-400 text-[11px] font-normal">{cameras.length} Saluran</span>
                  </h3>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {cameras.map((cam) => {
                      const isActive = cam.id === activeCamera.id;
                      return (
                        <button
                          key={cam.id}
                          onClick={() => setSelectedCameraId(cam.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                            isActive
                              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs">{cam.nomorKamera}</span>
                              <span className="text-xs font-semibold text-slate-800">{cam.nama}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{cam.lokasi}</div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                              cam.status === 'online'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cam.status === 'maintenance'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {cam.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PTZ Quick Control Panel */}
                <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Kontrol PTZ ({activeCamera.nomorKamera})</span>
                    </span>
                    <button
                      onClick={() => handlePtzReset(activeCamera.id)}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Reset Preset
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 w-44 mx-auto py-2">
                    <div />
                    <button
                      onClick={() => handlePtzAdjust(activeCamera.id, 0, 10, 0)}
                      className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Tilt Up"
                    >
                      <ArrowUp className="w-4 h-4 text-white" />
                    </button>
                    <div />

                    <button
                      onClick={() => handlePtzAdjust(activeCamera.id, -15, 0, 0)}
                      className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Pan Left"
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex items-center justify-center text-[10px] text-slate-500 font-mono">
                      PTZ
                    </div>
                    <button
                      onClick={() => handlePtzAdjust(activeCamera.id, 15, 0, 0)}
                      className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Pan Right"
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>

                    <div />
                    <button
                      onClick={() => handlePtzAdjust(activeCamera.id, 0, -10, 0)}
                      className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Tilt Down"
                    >
                      <ArrowDown className="w-4 h-4 text-white" />
                    </button>
                    <div />
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Optical Zoom:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePtzAdjust(activeCamera.id, 0, 0, -0.2)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                        <span>-</span>
                      </button>
                      <span className="font-mono text-sky-400 text-xs px-1">
                        {(ptzOffsets[activeCamera.id]?.zoom || 1).toFixed(1)}x
                      </span>
                      <button
                        onClick={() => handlePtzAdjust(activeCamera.id, 0, 0, 0.2)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Grid 6 or 4 Cameras */
            <div
              className={`grid gap-4 ${
                gridLayout === 'grid-4' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {(gridLayout === 'grid-4' ? cameras.slice(0, 4) : cameras).map((camera) => (
                <CameraFeedCard
                  key={camera.id}
                  camera={camera}
                  currentTime={currentTime}
                  currentDate={currentDate}
                  nightVision={Boolean(nightVisionMap[camera.id])}
                  motionDetection={Boolean(motionDetectionMap[camera.id])}
                  isMuted={Boolean(mutedMap[camera.id])}
                  ptzOffset={ptzOffsets[camera.id] || { pan: 0, tilt: 0, zoom: 1 }}
                  onToggleNightVision={() =>
                    setNightVisionMap((prev) => ({
                      ...prev,
                      [camera.id]: !prev[camera.id]
                    }))
                  }
                  onToggleMotion={() =>
                    setMotionDetectionMap((prev) => ({
                      ...prev,
                      [camera.id]: !prev[camera.id]
                    }))
                  }
                  onToggleMute={() =>
                    setMutedMap((prev) => ({
                      ...prev,
                      [camera.id]: !prev[camera.id]
                    }))
                  }
                  onCaptureSnapshot={() => handleCaptureSnapshot(camera)}
                  onPtzAdjust={(dp, dt, dz) => handlePtzAdjust(camera.id, dp, dt, dz)}
                  onPtzReset={() => handlePtzReset(camera.id)}
                  onOpenIncident={() => handleOpenNewIncident(camera)}
                  onExpand={() => {
                    setSelectedCameraId(camera.id);
                    setGridLayout('focus');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: DENAH TITIK SEBARAN CCTV BLOK D ================= */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Denah Interaktif Titik Kamera CCTV Blok D</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik pin kamera pada peta untuk beralih langsung ke tampilan siaran langsung titik tersebut.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                {onlineCount} Kamera Online
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                6 Titik Pemantauan
              </span>
            </div>
          </div>

          {/* Interactive Schematic Map of Blok D */}
          <div className="relative bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner overflow-hidden min-h-[460px] flex flex-col justify-between">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            {/* Layout schematic boundaries */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
              {/* Blok D1 Zone */}
              <div className="bg-slate-900/80 border-2 border-dashed border-sky-500/30 rounded-xl p-4 relative group">
                <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                  <span>GANG BLOK D1</span>
                  <span className="text-[10px] text-slate-400 font-mono">D1/01 - D1/08</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Jl. Pintu Masuk Depan & Ujung Barat</div>

                {/* Pin CAM-01 (Gate Masuk) */}
                <button
                  onClick={() => {
                    setSelectedCameraId('cam-01');
                    setActiveTab('grid');
                    setGridLayout('focus');
                  }}
                  className="absolute -top-3 left-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-20 animate-bounce"
                  title="Klik untuk membuka CAM-01"
                >
                  <Video className="w-3 h-3" />
                  <span>CAM-01: Pos 1 & Gate Masuk</span>
                </button>

                {/* Pin CAM-06 (Ujung D1 Belakang) */}
                <button
                  onClick={() => {
                    setSelectedCameraId('cam-06');
                    setActiveTab('grid');
                    setGridLayout('focus');
                  }}
                  className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2 py-1 rounded-lg shadow-md border border-white/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-20"
                >
                  <Video className="w-3 h-3 text-sky-300" />
                  <span>CAM-06: Sudut D1 Barat</span>
                </button>
              </div>

              {/* Blok D2 Zone */}
              <div className="bg-slate-900/80 border-2 border-dashed border-emerald-500/30 rounded-xl p-4 relative">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span>GANG BLOK D2</span>
                  <span className="text-[10px] text-slate-400 font-mono">D2/01 - D2/12</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Simpang Depan & Lorong Tengah</div>

                {/* Pin CAM-02 (Simpang D1/D2) */}
                <button
                  onClick={() => {
                    setSelectedCameraId('cam-02');
                    setActiveTab('grid');
                    setGridLayout('focus');
                  }}
                  className="absolute top-4 right-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2 py-1 rounded-lg shadow-md border border-white/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-20"
                >
                  <Video className="w-3 h-3 text-sky-300" />
                  <span>CAM-02: Simpang D1-D2</span>
                </button>
              </div>

              {/* Blok D3 & Fasum Zone */}
              <div className="bg-slate-900/80 border-2 border-dashed border-amber-500/30 rounded-xl p-4 relative">
                <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>GANG BLOK D3 & FASUM</span>
                  <span className="text-[10px] text-slate-400 font-mono">D3/01 - D3/08</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Taman Warga & Jalur Tengah</div>

                {/* Pin CAM-03 (Jalur Tengah D2-D3) */}
                <button
                  onClick={() => {
                    setSelectedCameraId('cam-03');
                    setActiveTab('grid');
                    setGridLayout('focus');
                  }}
                  className="absolute top-4 left-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2 py-1 rounded-lg shadow-md border border-white/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-20"
                >
                  <Video className="w-3 h-3 text-sky-300" />
                  <span>CAM-03: Tengah D2-D3</span>
                </button>

                {/* Pin CAM-04 (Taman Fasum PTZ) */}
                <button
                  onClick={() => {
                    setSelectedCameraId('cam-04');
                    setActiveTab('grid');
                    setGridLayout('focus');
                  }}
                  className="absolute bottom-4 right-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px] px-2 py-1 rounded-lg shadow-md border border-white/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-20"
                >
                  <Compass className="w-3 h-3" />
                  <span>CAM-04: PTZ Taman Fasum</span>
                </button>
              </div>

              {/* Blok D4 & Perimeter Zone */}
              <div className="bg-slate-900/80 border-2 border-dashed border-purple-500/30 rounded-xl p-4 relative">
                <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
                  <span>GANG BLOK D4</span>
                  <span className="text-[10px] text-slate-400 font-mono">D4/01 - D4/08</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Pagar Perimeter & Ujung Belakang</div>

                {/* Pin CAM-05 (Perimeter Belakang D4) */}
                <button
                  onClick={() => {
                    setSelectedCameraId('cam-05');
                    setActiveTab('grid');
                    setGridLayout('focus');
                  }}
                  className="absolute bottom-3 left-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2 py-1 rounded-lg shadow-md border border-white/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-20"
                >
                  <Video className="w-3 h-3 text-sky-300" />
                  <span>CAM-05: Perimeter D4</span>
                </button>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 border border-white" />
                  <span className="text-white font-medium">Gate Utama 24 Jam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-lg bg-amber-500" />
                  <span className="text-white font-medium">PTZ Speed Dome (Fasum)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-lg bg-blue-600" />
                  <span className="text-white font-medium">Fixed Bullet IP Cam</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Area Pengawasan: Seluruh Lingkungan Gang D1 s/d D4 Panorama Regency 3
              </div>
            </div>
          </div>

          {/* Quick Camera Grid Cards Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => {
                  setSelectedCameraId(cam.id);
                  setActiveTab('grid');
                  setGridLayout('focus');
                }}
                className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-800 text-white font-mono text-[10px] font-bold rounded">
                      {cam.nomorKamera}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors">
                      {cam.nama}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                      cam.status === 'online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cam.status === 'maintenance'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {cam.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{cam.lokasi}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{cam.kualitas}</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <span>Lihat Feed</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: LOG LAPORAN KEJADIAN CCTV ================= */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Log Kejadian & Rekaman Insiden CCTV</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan laporan insiden keamanan, kendaraan mencurigakan, dan kejadian lingkungan Blok D untuk ditindaklanjuti tim ronda / pengurus.
              </p>
            </div>
            <button
              onClick={() => handleOpenNewIncident()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Laporan Kejadian</span>
            </button>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Cari deskripsi kejadian, pelapor, atau lokasi..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={logCategoryFilter}
                onChange={(e) => setLogCategoryFilter(e.target.value)}
                className="w-full sm:w-auto py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <option value="all">Semua Kategori Insiden</option>
                <option value="Mencurigakan">Mencurigakan</option>
                <option value="Pelanggaran Kecepatan / Parkir">Pelanggaran Kecepatan / Parkir</option>
                <option value="Tamu Larut Malam">Tamu Larut Malam</option>
                <option value="Sampah Liar">Sampah Liar</option>
                <option value="Hewan Liar">Hewan Liar</option>
                <option value="Insiden / Kerusakan Fasum">Insiden / Kerusakan Fasum</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Incident Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="font-bold text-sm text-slate-800">Tidak ada catatan kejadian keamanan</div>
              <p className="text-xs text-slate-500 mt-1">
                Lingkungan Blok D terpantau kondusif, tertib, dan aman.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded-lg">
                        {log.kameraNama}
                      </span>
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300/60 font-semibold text-xs rounded-lg">
                        {log.kategori}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          log.statusPenanganan === 'Selesai / Aman'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.statusPenanganan === 'Ditindaklanjuti'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.statusPenanganan}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.tanggal} • {log.waktu} WIB</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    "{log.deskripsi}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <span>Pelapor: <strong className="text-slate-700">{log.pelapor}</strong></span>
                      <span>•</span>
                      <span>Lokasi: <strong className="text-slate-700">{log.lokasi}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareIncidentWA(log)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                        title="Bagikan ke WhatsApp Pengurus/Ronda"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Kirim WA</span>
                      </button>

                      {!isGuest && (
                        <>
                          <button
                            onClick={() => {
                              setEditingLog(log);
                              setIsLogModalOpen(true);
                            }}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                            title="Edit Laporan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteLog && (
                            <button
                              onClick={() => {
                                if (confirm('Hapus catatan laporan kejadian ini?')) {
                                  onDeleteLog(log.id);
                                  showToast('Laporan kejadian berhasil dihapus.');
                                }
                              }}
                              className="p-1 hover:bg-rose-100 text-rose-600 rounded-md transition-colors"
                              title="Hapus Laporan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: PENGATURAN KAMERA & IP (PENGURUS) ================= */}
      {!isGuest && activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Konfigurasi Kamera & Jaringan CCTV</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengaturan parameter IP address, URL RTSP/HLS Stream, status operasional, dan mode pemeliharaan (maintenance) untuk setiap kamera di Blok D.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onResetCameras && (
                <button
                  onClick={() => {
                    if (confirm('Kembalikan susunan 6 titik kamera CCTV ke konfigurasi standar Blok D?')) {
                      onResetCameras();
                      showToast('Konfigurasi kamera CCTV berhasil direset.');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-all cursor-pointer"
                >
                  Reset Standar
                </button>
              )}

              <button
                onClick={() => {
                  setEditingCamera({
                    id: `cam-0${cameras.length + 1}`,
                    nomorKamera: `CAM-0${cameras.length + 1}`,
                    nama: 'Kamera Baru Blok D',
                    lokasi: 'Area Lingkungan Blok D',
                    blokTerkait: 'Blok D1',
                    tipeKamera: 'Hikvision 4MP IP Outdoor',
                    ipAddress: '192.168.1.110',
                    streamUrl: '',
                    status: 'online',
                    kualitas: '1080p FHD',
                    nightVision: true,
                    audioSupport: false,
                    ptzSupport: false,
                    storageDays: 14,
                    petugasTeknisi: 'Tim IT & Keamanan Blok D'
                  });
                  setIsEditModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Kamera</span>
              </button>
            </div>
          </div>

          {/* Camera Configuration Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3">No / ID</th>
                  <th className="py-3 px-3">Nama Titik & Lokasi</th>
                  <th className="py-3 px-3">Model & Resolusi</th>
                  <th className="py-3 px-3">IP Address / Stream</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Fitur</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cameras.map((cam) => (
                  <tr key={cam.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {cam.nomorKamera}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{cam.nama}</div>
                      <div className="text-[11px] text-slate-500">{cam.lokasi}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{cam.tipeKamera}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{cam.kualitas} • {cam.storageDays} Hari Simpan</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      <div>IP: {cam.ipAddress || '192.168.1.xxx'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {cam.streamUrl || 'RTSP Main-Stream'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          cam.status === 'online'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cam.status === 'maintenance'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cam.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400">
                        {cam.ptzSupport && <Compass className="w-3.5 h-3.5 text-amber-500" title="PTZ Supported" />}
                        {cam.audioSupport && <Volume2 className="w-3.5 h-3.5 text-blue-500" title="Audio Supported" />}
                        {cam.nightVision && <Eye className="w-3.5 h-3.5 text-emerald-500" title="Night Vision" />}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCamera(cam);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Konfigurasi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteCamera && cameras.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus konfigurasi kamera ${cam.nomorKamera}?`)) {
                                onDeleteCamera(cam.id);
                                showToast(`Kamera ${cam.nomorKamera} berhasil dihapus.`);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kamera"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT / ADD CAMERA ================= */}
      {isEditModalOpen && editingCamera && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <span>Pengaturan Kamera CCTV</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nomor / Kode Kamera</label>
                  <input
                    type="text"
                    value={editingCamera.nomorKamera}
                    onChange={(e) => setEditingCamera({ ...editingCamera, nomorKamera: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    placeholder="Contoh: CAM-01"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Operasional</label>
                  <select
                    value={editingCamera.status}
                    onChange={(e) =>
                      setEditingCamera({
                        ...editingCamera,
                        status: e.target.value as any
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="online">Online (Aktif Normal)</option>
                    <option value="maintenance">Maintenance (Pemeliharaan)</option>
                    <option value="offline">Offline (Tidak Aktif)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Titik Kamera</label>
                <input
                  type="text"
                  value={editingCamera.nama}
                  onChange={(e) => setEditingCamera({ ...editingCamera, nama: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Contoh: Pos Kamling Utama & Gate Masuk Blok D"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deskripsi Detail Lokasi Titik</label>
                <input
                  type="text"
                  value={editingCamera.lokasi}
                  onChange={(e) => setEditingCamera({ ...editingCamera, lokasi: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Gerbang Masuk Utama Blok D (Pos 1 Utama & Gang D1)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">IP Address / NVR Port</label>
                  <input
                    type="text"
                    value={editingCamera.ipAddress || ''}
                    onChange={(e) => setEditingCamera({ ...editingCamera, ipAddress: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="192.168.1.101"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kualitas Resolusi</label>
                  <select
                    value={editingCamera.kualitas}
                    onChange={(e) =>
                      setEditingCamera({
                        ...editingCamera,
                        kualitas: e.target.value as any
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="4K UHD">4K UHD (Ultra HD)</option>
                    <option value="2K QHD">2K QHD (Quad HD)</option>
                    <option value="1080p FHD">1080p FHD (Full HD)</option>
                    <option value="720p HD">720p HD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Custom Stream URL (RTSP / HLS / MP4 / Youtube Live Embed) <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={editingCamera.streamUrl || ''}
                  onChange={(e) => setEditingCamera({ ...editingCamera, streamUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                  placeholder="rtsp://admin:pass@192.168.1.101:554/ch1/main atau https://..."
                />
              </div>

              <div className="flex items-center gap-4 py-2 border-y border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCamera.ptzSupport}
                    onChange={(e) => setEditingCamera({ ...editingCamera, ptzSupport: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Dukungan PTZ Motorized</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCamera.audioSupport}
                    onChange={(e) => setEditingCamera({ ...editingCamera, audioSupport: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Audio 2-Arah</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Pemeliharaan</label>
                <textarea
                  rows={2}
                  value={editingCamera.catatan || ''}
                  onChange={(e) => setEditingCamera({ ...editingCamera, catatan: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan teknis perangkat kamera..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSaveCamera && editingCamera) {
                    onSaveCamera(editingCamera);
                    setIsEditModalOpen(false);
                    showToast(`Kamera ${editingCamera.nomorKamera} berhasil disimpan!`);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BUAT / EDIT LAPORAN KEJADIAN ================= */}
      {isLogModalOpen && editingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Pencatatan Insiden & Kejadian CCTV</span>
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tanggal Kejadian</label>
                  <input
                    type="date"
                    value={editingLog.tanggal}
                    onChange={(e) => setEditingLog({ ...editingLog, tanggal: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Waktu Kejadian (WIB)</label>
                  <input
                    type="time"
                    value={editingLog.waktu}
                    onChange={(e) => setEditingLog({ ...editingLog, waktu: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Titik Kamera CCTV</label>
                  <select
                    value={editingLog.kameraId}
                    onChange={(e) => {
                      const found = cameras.find((c) => c.id === e.target.value);
                      setEditingLog({
                        ...editingLog,
                        kameraId: e.target.value,
                        kameraNama: found ? found.nama : editingLog.kameraNama,
                        lokasi: found ? found.lokasi : editingLog.lokasi
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nomorKamera} - {c.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori Kejadian</label>
                  <select
                    value={editingLog.kategori}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        kategori: e.target.value as any
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Mencurigakan">Mencurigakan</option>
                    <option value="Pelanggaran Kecepatan / Parkir">Pelanggaran Parkir / Kecepatan</option>
                    <option value="Tamu Larut Malam">Tamu Larut Malam</option>
                    <option value="Sampah Liar">Sampah Liar</option>
                    <option value="Hewan Liar">Hewan Liar</option>
                    <option value="Insiden / Kerusakan Fasum">Insiden / Kerusakan Fasum</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deskripsi Detail Kejadian</label>
                <textarea
                  rows={3}
                  value={editingLog.deskripsi}
                  onChange={(e) => setEditingLog({ ...editingLog, deskripsi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  placeholder="Jelaskan ciri-ciri orang/kendaraan, kronologi singkat kejadian..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Pelapor / Saksi</label>
                  <input
                    type="text"
                    value={editingLog.pelapor}
                    onChange={(e) => setEditingLog({ ...editingLog, pelapor: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Petugas Ronda / Warga D1"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status Penanganan</label>
                  <select
                    value={editingLog.statusPenanganan}
                    onChange={(e) =>
                      setEditingLog({
                        ...editingLog,
                        statusPenanganan: e.target.value as any
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Perlu Verifikasi">Perlu Verifikasi</option>
                    <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                    <option value="Selesai / Aman">Selesai / Aman</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan Penanganan Petugas</label>
                <input
                  type="text"
                  value={editingLog.catatanPetugas || ''}
                  onChange={(e) => setEditingLog({ ...editingLog, catatanPetugas: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Tindakan yang telah diambil tim ronda / pengurus..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSaveLog && editingLog) {
                    if (!editingLog.deskripsi.trim()) {
                      alert('Harap isi deskripsi kejadian.');
                      return;
                    }
                    onSaveLog(editingLog);
                    setIsLogModalOpen(false);
                    showToast('Laporan kejadian CCTV berhasil disimpan!');
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                Simpan & Catat Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= COMPONENT: INDIVIDUAL CAMERA FEED CARD ================= */
interface CameraFeedCardProps {
  camera: CCTVCamera;
  currentTime: string;
  currentDate: string;
  isLargeFocus?: boolean;
  nightVision: boolean;
  motionDetection: boolean;
  isMuted: boolean;
  ptzOffset: { pan: number; tilt: number; zoom: number };
  onToggleNightVision: () => void;
  onToggleMotion: () => void;
  onToggleMute: () => void;
  onCaptureSnapshot: () => void;
  onPtzAdjust: (pan: number, tilt: number, zoom: number) => void;
  onPtzReset: () => void;
  onOpenIncident: () => void;
  onExpand?: () => void;
}

const CameraFeedCard: React.FC<CameraFeedCardProps> = ({
  camera,
  currentTime,
  currentDate,
  isLargeFocus = false,
  nightVision,
  motionDetection,
  isMuted,
  ptzOffset,
  onToggleNightVision,
  onToggleMotion,
  onToggleMute,
  onCaptureSnapshot,
  onPtzAdjust,
  onPtzReset,
  onOpenIncident,
  onExpand
}) => {
  const [fps] = useState(() => Math.floor(Math.random() * 3) + 28);
  const [bitrate] = useState(() => Math.floor(Math.random() * 500) + 2600);

  const isOnline = camera.status === 'online';
  const isMaintenance = camera.status === 'maintenance';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col group">
      {/* Header Info */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 bg-blue-600 text-white font-mono text-[11px] font-bold rounded shadow-xs">
            {camera.nomorKamera}
          </span>
          <span className="text-xs font-bold truncate text-slate-100">{camera.nama}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase flex items-center gap-1 ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : isMaintenance
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : isMaintenance ? 'bg-amber-400' : 'bg-rose-400'
              }`}
            />
            <span>{camera.status}</span>
          </span>

          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Fokus Layar Besar"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Screen Frame Container */}
      <div
        className={`relative bg-slate-950 overflow-hidden flex items-center justify-center select-none ${
          isLargeFocus ? 'h-[440px] sm:h-[500px]' : 'h-[240px] sm:h-[260px]'
        }`}
      >
        {/* Custom Web Stream Embed if provided */}
        {camera.streamUrl && camera.streamUrl.startsWith('http') ? (
          <iframe
            src={camera.streamUrl}
            title={camera.nama}
            className="w-full h-full border-0 pointer-events-auto"
            allow="autoplay; encrypted-media"
          />
        ) : isOnline ? (
          /* Live Canvas Surveillance Scene Simulation */
          <div
            className={`w-full h-full relative transition-all duration-300 ${
              nightVision ? 'grayscale contrast-125 brightness-90 bg-emerald-950/20' : 'bg-slate-900'
            }`}
            style={{
              transform: `scale(${ptzOffset.zoom}) translate(${ptzOffset.pan * 0.4}px, ${ptzOffset.tilt * 0.4}px)`
            }}
          >
            {/* Background Graphic Patterns for Architectural Surveillance Context */}
            <div className="absolute inset-0 bg-radial from-slate-800/40 via-slate-950 to-black opacity-90" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />

            {/* Simulated Street / Pos / Blok Silhouette */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex items-end justify-between px-6 pb-2 text-[10px] text-slate-600 font-mono">
              <span>{camera.lokasi}</span>
              <span>FOV 110° • IP-CAM</span>
            </div>

            {/* Crosshair / Reticle in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-16 h-16 border border-sky-400/50 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-sky-400 rounded-full" />
              </div>
              <div className="absolute w-24 h-[1px] bg-sky-400/40" />
              <div className="absolute h-24 w-[1px] bg-sky-400/40" />
            </div>

            {/* Simulated Motion Detection Box */}
            {motionDetection && (
              <div className="absolute top-1/3 left-1/4 w-32 h-24 border-2 border-emerald-400/80 bg-emerald-500/10 rounded animate-pulse pointer-events-none flex flex-col justify-between p-1">
                <span className="text-[9px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-1 rounded w-fit">
                  MOT: 98%
                </span>
                <span className="text-[8px] font-mono text-emerald-400 self-end">AREA D1</span>
              </div>
            )}
          </div>
        ) : isMaintenance ? (
          /* Maintenance Screen */
          <div className="text-center p-6 space-y-2 text-amber-400">
            <RotateCw className="w-8 h-8 mx-auto animate-spin" />
            <div className="text-xs font-bold">PEMELIHARAAN SISTEM (MAINTENANCE)</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Kamera sedang dalam perawatan optik / kalibrasi jaringan kabel oleh tim teknisi.
            </p>
          </div>
        ) : (
          /* Offline Screen */
          <div className="text-center p-6 space-y-2 text-rose-400">
            <WifiOff className="w-8 h-8 mx-auto" />
            <div className="text-xs font-bold">KAMERA TIDAK AKTIF (OFFLINE)</div>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Tidak ada sinyal video dari {camera.ipAddress || 'IP Camera'}. Periksa catu daya & kabel LAN NVR.
            </p>
          </div>
        )}

        {/* Live Surveillance Overlays */}
        {isOnline && (
          <>
            {/* Top Left: Title & REC */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-white font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold text-red-400">REC</span>
              <span>•</span>
              <span className="font-semibold text-slate-200">{camera.nomorKamera}</span>
            </div>

            {/* Top Right: Clock & FPS */}
            <div className="absolute top-2 right-2 z-10 text-right bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-white font-mono text-[10px] space-y-0.5">
              <div className="font-bold text-amber-300">{currentTime} WIB</div>
              <div className="text-[9px] text-slate-400">
                {fps} FPS • {bitrate} Kbps • {camera.kualitas}
              </div>
            </div>

            {/* Night Vision Badge if Active */}
            {nightVision && (
              <div className="absolute bottom-2 left-2 z-10 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>IR NIGHT VISION</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Controls & Quick Actions */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between gap-2 text-white">
        {/* Left Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleNightVision}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              nightVision
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Night Vision (Infrared Mode)"
          >
            {nightVision ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleMotion}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              motionDetection
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Deteksi Gerakan (Motion Radar)"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {camera.audioSupport && (
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                !isMuted
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle Audio Mikrofon Kamera"
            >
              {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Right Toolbar: Snapshot & Incident */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCaptureSnapshot}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
            title="Ambil Foto Tangkapan Layar (Snapshot)"
          >
            <Camera className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          <button
            onClick={onOpenIncident}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            title="Laporkan Kejadian Mencurigakan pada Titik Ini"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">Lapor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
