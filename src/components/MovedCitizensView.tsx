import React, { useState } from 'react';
import { MovedCitizen, HouseUnit, AuthUser, Gender, Resident, CoverLetter, DeceasedCitizen } from '../types/census';
import { getAllResidents, formatDateDDMMYYYY, formatDateNamedMonth, formatDateTimeIndo, formatRelativeTimeIndo } from '../utils/censusHelpers';
import { calculateNextLetterSequence, formatLetterNumber } from '../utils/letterNumberUtils';
import { LogoBlokD } from './LogoBlokD';
import {
  Truck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Printer,
  MessageSquare,
  Building,
  MapPin,
  Calendar,
  Phone,
  FileText,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Share2,
  Download,
  Clock,
  Copy,
  Check,
  Lock
} from 'lucide-react';

interface MovedCitizensViewProps {
  movedList: MovedCitizen[];
  coverLetters?: CoverLetter[];
  deceasedList?: DeceasedCitizen[];
  houses: HouseUnit[];
  currentUser: AuthUser | null;
  onAddMoved: (data: MovedCitizen, removeResidentOption?: { houseId: string; residentId?: string; residentIds?: string[] }) => void;
  onUpdateMoved: (data: MovedCitizen) => void;
  onDeleteMoved: (id: string) => void;
}

export const MovedCitizensView: React.FC<MovedCitizensViewProps> = ({
  movedList,
  coverLetters = [],
  deceasedList = [],
  houses,
  currentUser,
  onAddMoved,
  onUpdateMoved,
  onDeleteMoved
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlasan, setFilterAlasan] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'individual' | 'kk'>('individual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MovedCitizen | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MovedCitizen | null>(null);
  const [letterPrintItem, setLetterPrintItem] = useState<MovedCitizen | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [tipePencatatan, setTipePencatatan] = useState<'individual' | 'kk'>('individual');
  const [selectedSourceType, setSelectedSourceType] = useState<'existing' | 'manual'>('existing');
  const [selectedExistingResidentKey, setSelectedExistingResidentKey] = useState<string>('');
  const [selectedExistingHouseId, setSelectedExistingHouseId] = useState<string>('');
  const [selectedResidentIds, setSelectedResidentIds] = useState<string[]>([]);
  const [autoRemoveFromActive, setAutoRemoveFromActive] = useState<boolean>(true);

  const [tanggalPindah, setTanggalPindah] = useState(new Date().toISOString().slice(0, 10));
  const [nomorRumahAsal, setNomorRumahAsal] = useState('');
  const [nomorKK, setNomorKK] = useState('');
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('L');
  const [hubunganKeluarga, setHubunganKeluarga] = useState('Kepala Keluarga');
  const [jumlahJiwaPindah, setJumlahJiwaPindah] = useState(1);
  const [anggotaKeluargaPindah, setAnggotaKeluargaPindah] = useState<{
    nama: string;
    nik: string;
    jenisKelamin: Gender;
    hubunganKeluarga: string;
  }[]>([]);
  const [alamatTujuan, setAlamatTujuan] = useState('');
  const [kotaTujuan, setKotaTujuan] = useState('');
  const [alasanPindah, setAlasanPindah] = useState<MovedCitizen['alasanPindah']>('Pindah Rumah / Beli Rumah');
  const [noHp, setNoHp] = useState('');
  const [nomorSuratPindah, setNomorSuratPindah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [petugasPencatat, setPetugasPencatat] = useState(
    currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : 'Wily Gunawan (Sekertaris Blok D)'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`${label} disalin ke clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getAutoLetterNumber = (dateStr: string) => {
    const targetYear = dateStr ? new Date(dateStr).getFullYear() || new Date().getFullYear() : new Date().getFullYear();
    const seqInfo = calculateNextLetterSequence({
      coverLetters,
      movedList,
      deceasedList,
      type: 'SKPD',
      year: targetYear
    });
    return formatLetterNumber({
      sequence: seqInfo.nextSequence,
      type: 'SKPD',
      unit: 'D',
      date: dateStr
    });
  };

  // Open modal for new record
  const handleOpenAdd = () => {
    setEditingItem(null);
    setTipePencatatan('individual');
    setSelectedSourceType('existing');
    setSelectedExistingResidentKey('');
    setSelectedExistingHouseId('');
    setSelectedResidentIds([]);
    setAutoRemoveFromActive(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    setTanggalPindah(todayStr);
    setNomorRumahAsal('');
    setNomorKK('');
    setNama('');
    setNik('');
    setJenisKelamin('L');
    setHubunganKeluarga('Kepala Keluarga');
    setJumlahJiwaPindah(1);
    setAnggotaKeluargaPindah([]);
    setAlamatTujuan('');
    setKotaTujuan('');
    setAlasanPindah('Pindah Rumah / Beli Rumah');
    setNoHp('');
    setNomorSuratPindah(getAutoLetterNumber(todayStr));
    setKeterangan('');
    setPetugasPencatat(currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : 'Wily Gunawan (Sekertaris Blok D)');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: MovedCitizen) => {
    setEditingItem(item);
    setTipePencatatan(item.tipePencatatan || (item.anggotaKeluarga && item.anggotaKeluarga.length > 1 ? 'kk' : 'individual'));
    setSelectedSourceType('manual');
    setTanggalPindah(item.tanggalPindah);
    setNomorRumahAsal(item.nomorRumahAsal);
    setNomorKK(item.nomorKK || '');
    setNama(item.nama);
    setNik(item.nik);
    setJenisKelamin(item.jenisKelamin);
    setHubunganKeluarga(item.hubunganKeluarga || 'Kepala Keluarga');
    setJumlahJiwaPindah(item.jumlahJiwaPindah || 1);
    setAnggotaKeluargaPindah(item.anggotaKeluarga || []);
    setAlamatTujuan(item.alamatTujuan);
    setKotaTujuan(item.kotaTujuan);
    setAlasanPindah(item.alasanPindah);
    setNoHp(item.noHp || '');
    setNomorSuratPindah(item.nomorSuratPindah || '');
    setKeterangan(item.keterangan || '');
    setPetugasPencatat(item.petugasPencatat || (currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : ''));
    setIsModalOpen(true);
  };

  // When an existing resident is picked for individual move
  const handleSelectExistingResident = (compositeKey: string) => {
    setSelectedExistingResidentKey(compositeKey);
    if (!compositeKey) return;

    const [houseId, residentId] = compositeKey.split(':::');
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;
    const targetResident = targetHouse.residents.find((r) => r.id === residentId);
    if (!targetResident) return;

    setNomorRumahAsal(targetHouse.nomorRumah);
    setNomorKK(targetHouse.nomorKK || '');
    setNama(targetResident.nama);
    setNik(targetResident.nik);
    setJenisKelamin(targetResident.jenisKelamin);
    setHubunganKeluarga(targetResident.hubunganKeluarga);
    setNoHp(targetResident.noHp !== '-' ? targetResident.noHp : '');
    setJumlahJiwaPindah(1);
    setAnggotaKeluargaPindah([{
      nama: targetResident.nama,
      nik: targetResident.nik,
      jenisKelamin: targetResident.jenisKelamin,
      hubunganKeluarga: targetResident.hubunganKeluarga
    }]);
  };

  // When a house is selected for KK move
  const handleSelectExistingHouseForKK = (houseId: string) => {
    setSelectedExistingHouseId(houseId);
    if (!houseId) {
      setSelectedResidentIds([]);
      setAnggotaKeluargaPindah([]);
      return;
    }
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) return;

    setNomorRumahAsal(targetHouse.nomorRumah);
    setNomorKK(targetHouse.nomorKK || '');
    setNama(targetHouse.kepalaKeluargaNama || (targetHouse.residents[0]?.nama || 'Keluarga'));
    setNik(targetHouse.residents[0]?.nik || targetHouse.nomorKK || '-');
    setJenisKelamin(targetHouse.residents[0]?.jenisKelamin || 'L');
    setHubunganKeluarga('Kepala Keluarga');
    
    // Select all residents by default for KK move
    const allIds = targetHouse.residents.map((r) => r.id);
    setSelectedResidentIds(allIds);
    setJumlahJiwaPindah(targetHouse.residents.length || 1);
    setAnggotaKeluargaPindah(
      targetHouse.residents.map((r) => ({
        nama: r.nama,
        nik: r.nik,
        jenisKelamin: r.jenisKelamin,
        hubunganKeluarga: r.hubunganKeluarga
      }))
    );

    const firstPhone = targetHouse.residents.find((r) => r.noHp && r.noHp !== '-')?.noHp || targetHouse.kontakDarurat?.noHp || '';
    setNoHp(firstPhone);
  };

  // Toggle resident checkbox in KK mode
  const handleToggleResidentInKK = (house: HouseUnit, res: Resident) => {
    const isSelected = selectedResidentIds.includes(res.id);
    let updatedIds: string[];
    if (isSelected) {
      updatedIds = selectedResidentIds.filter((id) => id !== res.id);
    } else {
      updatedIds = [...selectedResidentIds, res.id];
    }
    setSelectedResidentIds(updatedIds);

    const selectedResidents = house.residents.filter((r) => updatedIds.includes(r.id));
    setJumlahJiwaPindah(selectedResidents.length);
    setAnggotaKeluargaPindah(
      selectedResidents.map((r) => ({
        nama: r.nama,
        nik: r.nik,
        jenisKelamin: r.jenisKelamin,
        hubunganKeluarga: r.hubunganKeluarga
      }))
    );

    if (selectedResidents.length > 0) {
      const kkHead = selectedResidents.find((r) => r.hubunganKeluarga === 'Kepala Keluarga') || selectedResidents[0];
      setNama(kkHead.nama);
      setNik(kkHead.nik);
      setJenisKelamin(kkHead.jenisKelamin);
      setHubunganKeluarga(kkHead.hubunganKeluarga);
    }
  };

  const handleSelectAllResidentsInHouse = (house: HouseUnit) => {
    const allIds = house.residents.map((r) => r.id);
    setSelectedResidentIds(allIds);
    setJumlahJiwaPindah(house.residents.length);
    setAnggotaKeluargaPindah(
      house.residents.map((r) => ({
        nama: r.nama,
        nik: r.nik,
        jenisKelamin: r.jenisKelamin,
        hubunganKeluarga: r.hubunganKeluarga
      }))
    );
  };

  const handleDeselectAllResidentsInHouse = () => {
    setSelectedResidentIds([]);
    setJumlahJiwaPindah(0);
    setAnggotaKeluargaPindah([]);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nomorRumahAsal.trim() || !alamatTujuan.trim()) {
      alert('Mohon lengkapi Nama Warga / Kepala Keluarga, Nomor Rumah Asal, dan Alamat Tujuan!');
      return;
    }

    const nowISO = new Date().toISOString();
    const payload: MovedCitizen = {
      id: editingItem ? editingItem.id : `mov-${Date.now()}`,
      tanggalPindah,
      nomorRumahAsal,
      nomorKK: nomorKK.trim() || '-',
      tipePencatatan,
      nama: nama.trim(),
      nik: nik.trim() || '-',
      jenisKelamin,
      hubunganKeluarga,
      jumlahJiwaPindah: Number(jumlahJiwaPindah) || (anggotaKeluargaPindah.length > 0 ? anggotaKeluargaPindah.length : 1),
      anggotaKeluarga: anggotaKeluargaPindah.length > 0 ? anggotaKeluargaPindah : [
        { nama: nama.trim(), nik: nik.trim() || '-', jenisKelamin, hubunganKeluarga }
      ],
      alamatTujuan: alamatTujuan.trim(),
      kotaTujuan: kotaTujuan.trim() || 'Luar Wilayah',
      alasanPindah,
      noHp: noHp.trim() || '-',
      nomorSuratPindah: nomorSuratPindah.trim() || `471.2/${Math.floor(100 + Math.random() * 900)}/RT05-RW05/${new Date().getFullYear()}`,
      keterangan: keterangan.trim(),
      petugasPencatat,
      updatedAt: nowISO,
      createdAt: editingItem?.createdAt || nowISO
    };

    if (editingItem) {
      onUpdateMoved(payload);
      showToast(`Data mutasi pindah ${payload.nama} berhasil diperbarui.`);
    } else {
      let removalInfo: { houseId: string; residentId?: string; residentIds?: string[] } | undefined;
      if (selectedSourceType === 'existing' && autoRemoveFromActive) {
        if (tipePencatatan === 'kk' && selectedExistingHouseId && selectedResidentIds.length > 0) {
          removalInfo = { houseId: selectedExistingHouseId, residentIds: selectedResidentIds };
        } else if (tipePencatatan === 'individual' && selectedExistingResidentKey) {
          const [houseId, residentId] = selectedExistingResidentKey.split(':::');
          removalInfo = { houseId, residentId };
        }
      }
      onAddMoved(payload, removalInfo);
      showToast(`Warga pindah atas nama ${payload.nama} berhasil dicatat.`);
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteMoved(itemToDelete.id);
      showToast(`Catatan warga pindah ${itemToDelete.nama} berhasil dihapus.`);
      setItemToDelete(null);
    }
  };

  // Filtered List
  const filteredList = movedList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.nik.toLowerCase().includes(q) ||
      (item.nomorKK && item.nomorKK.toLowerCase().includes(q)) ||
      item.nomorRumahAsal.toLowerCase().includes(q) ||
      item.alamatTujuan.toLowerCase().includes(q) ||
      item.kotaTujuan.toLowerCase().includes(q) ||
      (item.anggotaKeluarga && item.anggotaKeluarga.some((m) => m.nama.toLowerCase().includes(q) || m.nik.toLowerCase().includes(q)));

    const matchAlasan = filterAlasan === 'all' || item.alasanPindah === filterAlasan;
    return matchSearch && matchAlasan;
  });

  // Grouped by KK
  const groupedByKK = React.useMemo(() => {
    const map = new Map<string, {
      kkKey: string;
      nomorKK: string;
      nomorRumahAsal: string;
      kepalaKeluarga: string;
      totalJiwa: number;
      records: MovedCitizen[];
      allMembers: { nama: string; nik: string; jenisKelamin: Gender; hubunganKeluarga: string }[];
      primaryRecord: MovedCitizen;
    }>();

    filteredList.forEach((item) => {
      const key = (item.nomorKK && item.nomorKK !== '-' && item.nomorKK !== '')
        ? `KK:${item.nomorKK}`
        : `RUMAH:${item.nomorRumahAsal}`;

      if (!map.has(key)) {
        const members: { nama: string; nik: string; jenisKelamin: Gender; hubunganKeluarga: string }[] = [];
        if (item.anggotaKeluarga && item.anggotaKeluarga.length > 0) {
          members.push(...item.anggotaKeluarga);
        } else {
          members.push({
            nama: item.nama,
            nik: item.nik,
            jenisKelamin: item.jenisKelamin,
            hubunganKeluarga: item.hubunganKeluarga || 'Kepala Keluarga'
          });
        }

        map.set(key, {
          kkKey: key,
          nomorKK: item.nomorKK && item.nomorKK !== '-' ? item.nomorKK : '-',
          nomorRumahAsal: item.nomorRumahAsal,
          kepalaKeluarga: item.nama,
          totalJiwa: item.jumlahJiwaPindah || members.length || 1,
          records: [item],
          allMembers: members,
          primaryRecord: item
        });
      } else {
        const existing = map.get(key)!;
        existing.records.push(item);
        if (item.anggotaKeluarga && item.anggotaKeluarga.length > 0) {
          item.anggotaKeluarga.forEach((m) => {
            if (!existing.allMembers.some((em) => em.nik === m.nik && em.nama === m.nama)) {
              existing.allMembers.push(m);
            }
          });
        } else {
          if (!existing.allMembers.some((em) => em.nama === item.nama)) {
            existing.allMembers.push({
              nama: item.nama,
              nik: item.nik,
              jenisKelamin: item.jenisKelamin,
              hubunganKeluarga: item.hubunganKeluarga || 'Anggota Keluarga'
            });
          }
        }
        existing.totalJiwa = existing.allMembers.length;
      }
    });

    return Array.from(map.values());
  }, [filteredList]);

  const totalJiwaPindah = movedList.reduce((acc, curr) => acc + (curr.jumlahJiwaPindah || 1), 0);

  const generateWhatsAppMessageMoved = (item: MovedCitizen) => {
    let membersText = '';
    if (item.anggotaKeluarga && item.anggotaKeluarga.length > 0) {
      membersText = item.anggotaKeluarga.map((m, idx) => `  ${idx + 1}. ${m.nama} (${m.hubunganKeluarga})`).join('\n');
    } else {
      membersText = `  1. ${item.nama} (${item.hubunganKeluarga || 'Kepala Keluarga'})`;
    }

    return encodeURIComponent(
      `🚚 *PEMBERITAHUAN MUTASI PINDAH WARGA BLOK D*\n` +
      `🏘️ *Panorama Regency 3 Situ Sari*\n` +
      `📍 _Wilayah Administrasi Rt.005 Dan Rw.005_\n\n` +
      `Tercatat warga yang telah pindah domisili:\n` +
      `🏠 *Rumah Asal:* ${item.nomorRumahAsal}\n` +
      `📋 *No. KK:* ${item.nomorKK || '-'}\n` +
      `👤 *Nama KK / Pemohon:* ${item.nama}\n` +
      `👥 *Jumlah Jiwa:* ${item.jumlahJiwaPindah} Jiwa\n` +
      `📝 *Daftar Anggota Keluarga:*\n${membersText}\n` +
      `📍 *Alamat Tujuan:* ${item.alamatTujuan} ${item.kotaTujuan ? `(${item.kotaTujuan})` : ''}\n` +
      `📅 *Tanggal Pindah:* ${item.tanggalPindah ? formatDateDDMMYYYY(item.tanggalPindah) : '-'}\n` +
      `📌 *Alasan Pindah:* ${item.alasanPindah}\n` +
      `📄 *No. Surat Keterangan:* ${item.nomorSuratPindah || '-'}\n\n` +
      `_Pengurus Paguyuban Blok D • Panorama Regency 3_`
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Screen Management View (Hidden during print) */}
      <div className="space-y-6 print:hidden">
        {/* Header Banner & Stats */}
        <div className="bg-gradient-to-br from-amber-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Buku Catatan Warga Pindah (Mutasi Keluar)
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/80">
                  Data kependudukan warga Blok D yang telah pindah domisili, penerbitan surat pengantar, & arsip mutasi per individu / nomor KK.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Warga Pindah</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-amber-800/50">
          <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/40">
            <div className="text-[11px] text-amber-300 font-medium">Total Catatan Mutasi</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{movedList.length} <span className="text-xs font-normal text-amber-200">Catatan</span></div>
          </div>
          <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/40">
            <div className="text-[11px] text-amber-300 font-medium">Total Jiwa Pindah</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{totalJiwaPindah} <span className="text-xs font-normal text-amber-200">Orang</span></div>
          </div>
          <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/40">
            <div className="text-[11px] text-amber-300 font-medium">Pindah Beli/Milik Sendiri</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              {movedList.filter((m) => m.alasanPindah === 'Pindah Rumah / Beli Rumah').length}
            </div>
          </div>
          <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/40">
            <div className="text-[11px] text-amber-300 font-medium">Tugas Kerja / Mutasi</div>
            <div className="text-xl sm:text-2xl font-black text-blue-300 mt-0.5">
              {movedList.filter((m) => m.alasanPindah === 'Pekerjaan / Mutasi Kantor').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama warga, No. KK, NIK, rumah asal (contoh: D.18), atau kota tujuan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          />
        </div>

        {/* View Mode Toggle (Individual vs Berdasarkan No KK) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-white text-amber-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan per warga / individu"
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Individual ({filteredList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kk'
                  ? 'bg-white text-amber-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kelompokkan berdasarkan Nomor Kartu Keluarga (KK)"
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Berdasarkan No. KK ({groupedByKK.length})</span>
            </button>
          </div>

          {/* Alasan Filter */}
          <select
            value={filterAlasan}
            onChange={(e) => setFilterAlasan(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:border-amber-500 outline-none shrink-0"
          >
            <option value="all">Semua Alasan ({movedList.length})</option>
            <option value="Pindah Rumah / Beli Rumah">Pindah Beli Rumah</option>
            <option value="Kontrak Habis / Pindah Sewa">Kontrak Habis</option>
            <option value="Pekerjaan / Mutasi Kantor">Pekerjaan / Dinas</option>
            <option value="Menikah / Ikut Keluarga">Menikah / Ikut Keluarga</option>
            <option value="Pendidikan">Pendidikan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Moved Citizens Display */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak ada catatan warga pindah</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterAlasan !== 'all'
              ? 'Tidak ditemukan data yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'
              : 'Belum ada data warga Blok D yang dicatat pindah domisili.'}
          </p>
        </div>
      ) : viewMode === 'individual' ? (
        /* INDIVIDUAL VIEW CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4 relative"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">{item.nama}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.alasanPindah}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-mono">NIK: {item.nik}</span>
                    <span>•</span>
                    <span className="font-semibold text-blue-700">{item.hubunganKeluarga || 'Kepala Keluarga'}</span>
                    {item.nomorKK && item.nomorKK !== '-' && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => handleCopy(item.nomorKK!, 'No. KK')}
                          className="font-mono text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          title="Salin Nomor KK"
                        >
                          <Copy className="w-3 h-3" />
                          <span>KK: {item.nomorKK}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.tanggalPindah}
                  </span>
                </div>
              </div>

              {/* Location Route Box (From -> To) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    D
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Asal Rumah di Blok D:</div>
                    <div className="font-bold text-slate-800">{item.nomorRumahAsal}</div>
                  </div>
                </div>

                <div className="border-l-2 border-dashed border-amber-300 ml-2.5 pl-3 py-1">
                  <div className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-600" />
                    Jumlah yang Pindah: {item.jumlahJiwaPindah} Jiwa
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <MapPin className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Alamat Tujuan Pindah:</div>
                    <div className="font-bold text-slate-800">{item.alamatTujuan}</div>
                    {item.kotaTujuan && (
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">{item.kotaTujuan}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Members Breakdown if multiple */}
              {item.anggotaKeluarga && item.anggotaKeluarga.length > 1 && (
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 space-y-1.5 text-xs">
                  <div className="font-bold text-blue-900 text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Anggota Keluarga yang Ikut Pindah ({item.anggotaKeluarga.length} Jiwa):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                    {item.anggotaKeluarga.map((m, idx) => (
                      <div key={idx} className="bg-white/80 px-2 py-1 rounded border border-blue-100 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{m.nama}</span>
                        <span className="text-[10px] text-blue-700 font-semibold">{m.hubunganKeluarga}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Notes */}
              <div className="space-y-1.5 text-xs">
                {item.noHp && item.noHp !== '-' && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono text-[11px]">{item.noHp}</span>
                  </div>
                )}

                {item.nomorSuratPindah && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-[11px]">No. Surat Pengantar: <strong className="text-slate-800 font-mono">{item.nomorSuratPindah}</strong></span>
                  </div>
                )}

                {item.keterangan && (
                  <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    "{item.keterangan}"
                  </div>
                )}
              </div>

              {/* Timestamp & Recorder Detail */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Terakhir Diperbarui: <strong className="text-slate-700">{formatDateTimeIndo(item.updatedAt || item.tanggalPindah)}</strong>
                  </span>
                  {item.updatedAt && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {formatRelativeTimeIndo(item.updatedAt)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  Petugas: <span className="text-slate-600 font-medium">{item.petugasPencatat || 'Pengurus RT'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/?text=${generateWhatsAppMessageMoved(item)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-emerald-200"
                  title="Bagikan Ringkasan Warga Pindah ke WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Info WA</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLetterPrintItem(item)}
                    className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-blue-200 cursor-pointer"
                    title="Cetak Surat Keterangan Pindah RT/RW"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Surat RT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 cursor-pointer"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* BERDASARKAN NOMOR KK VIEW */
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between px-1">
            <span>Menampilkan data dikelompokkan berdasarkan <strong>Nomor Kartu Keluarga (KK) & Rumah Asal</strong>:</span>
            <span className="font-semibold text-slate-700">{groupedByKK.length} Kepala Keluarga / KK</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {groupedByKK.map((group) => {
              const mainItem = group.primaryRecord;
              return (
                <div
                  key={group.kkKey}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* KK Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          {group.nomorRumahAsal}
                        </span>
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">
                          KK: {group.kepalaKeluarga}
                        </h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          {group.totalJiwa} Jiwa Pindah
                        </span>
                      </div>

                      {group.nomorKK && group.nomorKK !== '-' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <button
                            onClick={() => handleCopy(group.nomorKK, 'Nomor KK')}
                            className="font-mono text-slate-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                            title="Klik untuk Salin Nomor KK"
                          >
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>No. KK: <strong className="text-slate-800">{group.nomorKK}</strong></span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Tgl Pindah: {mainItem.tanggalPindah}
                      </span>
                    </div>
                  </div>

                  {/* Route & Destination Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Tujuan & Alasan Kepindahan:</div>
                      <div className="font-bold text-slate-900 text-sm flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{mainItem.alamatTujuan} {mainItem.kotaTujuan ? `(${mainItem.kotaTujuan})` : ''}</span>
                      </div>
                      <div className="text-slate-600 pt-1">
                        Alasan: <strong className="text-amber-800">{mainItem.alasanPindah}</strong>
                      </div>
                      {mainItem.nomorSuratPindah && (
                        <div className="text-slate-500 font-mono text-[11px]">
                          Surat RT: {mainItem.nomorSuratPindah}
                        </div>
                      )}
                    </div>

                    {/* Members in this KK */}
                    <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-2">
                      <div className="text-[10px] text-blue-900 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>Daftar Anggota Keluarga ({group.allMembers.length} Jiwa):</span>
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {group.allMembers.map((m, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-blue-100 flex items-center justify-between text-xs shadow-2xs">
                            <div>
                              <strong className="text-slate-900">{m.nama}</strong>
                              <div className="font-mono text-[10px] text-slate-400">NIK: {m.nik || '-'}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                                {m.hubunganKeluarga}
                              </span>
                              <div className="text-[10px] text-slate-400">{m.jenisKelamin === 'L' ? 'L' : 'P'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Audit Timestamp Banner */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Terakhir Diperbarui: <strong className="text-slate-700">{formatDateTimeIndo(mainItem.updatedAt || mainItem.tanggalPindah)}</strong>
                      </span>
                      {mainItem.updatedAt && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {formatRelativeTimeIndo(mainItem.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Petugas Pencatat: <span className="text-slate-700 font-medium">{mainItem.petugasPencatat || 'Pengurus RT'}</span>
                    </div>
                  </div>

                  {/* KK Card Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/?text=${generateWhatsAppMessageMoved(mainItem)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200"
                      title="Bagikan Ringkasan Kepindahan Keluarga ke WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Info Mutasi WA</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLetterPrintItem(mainItem)}
                        className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                        title="Cetak Surat Keterangan Pindah RT se-Keluarga"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Surat RT</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(mainItem)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                        title="Edit Catatan KK Ini"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(mainItem)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 cursor-pointer"
                        title="Hapus Catatan KK Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* Modal: Input / Edit Warga Pindah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn print:hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingItem ? 'Edit Data Warga Pindah' : 'Formulir Pencatatan Warga Pindah (Mutasi)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan perorangan atau berdasarkan satu nomor Kartu Keluarga (KK)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Tipe Pencatatan Selector: Individual vs Satu KK */}
              {!editingItem && (
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-3">
                  <div className="font-bold text-slate-800 text-xs">Pilih Kategori Kepindahan:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTipePencatatan('individual');
                        setSelectedExistingResidentKey('');
                        setSelectedExistingHouseId('');
                        setSelectedResidentIds([]);
                        setAnggotaKeluargaPindah([]);
                      }}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tipePencatatan === 'individual'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>👤 Individual (1 Jiwa / Perorangan)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTipePencatatan('kk');
                        setSelectedExistingResidentKey('');
                        setSelectedExistingHouseId('');
                      }}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tipePencatatan === 'kk'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>👨‍👩‍👧‍👦 Berdasarkan No. KK (Satu Keluarga)</span>
                    </button>
                  </div>

                  {/* Sumber Data: Dari Database Warga atau Manual */}
                  <div className="flex items-center gap-4 pt-2 border-t border-amber-200/80">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceType"
                        checked={selectedSourceType === 'existing'}
                        onChange={() => setSelectedSourceType('existing')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Pilih dari Data Warga Aktif</span>
                    </label>

                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceType"
                        checked={selectedSourceType === 'manual'}
                        onChange={() => setSelectedSourceType('manual')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Input Manual Baru</span>
                    </label>
                  </div>

                  {/* If Existing & Individual */}
                  {selectedSourceType === 'existing' && tipePencatatan === 'individual' && (
                    <div className="space-y-2 pt-1 border-t border-amber-200/80">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Pilih Warga yang Pindah:
                      </label>
                      <select
                        value={selectedExistingResidentKey}
                        onChange={(e) => handleSelectExistingResident(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-800 focus:border-amber-600 outline-none"
                      >
                        <option value="">-- Pilih Nama Warga / Rumah Asal --</option>
                        {houses.map((house) =>
                          house.residents.map((res) => (
                            <option key={`${house.id}:::${res.id}`} value={`${house.id}:::${res.id}`}>
                              {res.nama} ({house.nomorRumah} - {res.hubunganKeluarga} / NIK: {res.nik})
                            </option>
                          ))
                        )}
                      </select>

                      <label className="flex items-center gap-2 text-[11px] font-semibold text-amber-900 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoRemoveFromActive}
                          onChange={(e) => setAutoRemoveFromActive(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span>Keluarkan otomatis nama warga ini dari daftar data rumah aktif</span>
                      </label>
                    </div>
                  )}

                  {/* If Existing & Berdasarkan No KK */}
                  {selectedSourceType === 'existing' && tipePencatatan === 'kk' && (
                    <div className="space-y-2.5 pt-1 border-t border-amber-200/80">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Pilih Rumah / Kartu Keluarga (KK) yang Pindah:
                      </label>
                      <select
                        value={selectedExistingHouseId}
                        onChange={(e) => handleSelectExistingHouseForKK(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-800 focus:border-amber-600 outline-none"
                      >
                        <option value="">-- Pilih Rumah / Kepala Keluarga --</option>
                        {houses.map((house) => (
                          <option key={house.id} value={house.id}>
                            {house.nomorRumah} - KK: {house.kepalaKeluargaNama || 'Kosong'} ({house.nomorKK ? `No. KK: ${house.nomorKK}` : 'Belum ada No. KK'}) - {house.residents.length} Jiwa
                          </option>
                        ))}
                      </select>

                      {/* Checklist for Family Members in the Selected House */}
                      {selectedExistingHouseId && (() => {
                        const targetHouse = houses.find((h) => h.id === selectedExistingHouseId);
                        if (!targetHouse || targetHouse.residents.length === 0) return null;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">
                                Anggota Keluarga yang Ikut Pindah ({selectedResidentIds.length} dari {targetHouse.residents.length} Jiwa):
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllResidentsInHouse(targetHouse)}
                                  className="text-[10px] text-blue-700 hover:underline font-bold cursor-pointer"
                                >
                                  Pilih Semua
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={handleDeselectAllResidentsInHouse}
                                  className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                                >
                                  Batal Pilih
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                              {targetHouse.residents.map((res) => {
                                const isChecked = selectedResidentIds.includes(res.id);
                                return (
                                  <label
                                    key={res.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                      isChecked
                                        ? 'bg-amber-100/70 border-amber-300 text-amber-950 font-semibold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleResidentInKK(targetHouse, res)}
                                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                                    />
                                    <div className="truncate">
                                      <div className="font-bold leading-tight">{res.nama}</div>
                                      <div className="text-[10px] opacity-75">{res.hubunganKeluarga} • {res.nik}</div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>

                            <label className="flex items-center gap-2 text-[11px] font-semibold text-amber-900 pt-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={autoRemoveFromActive}
                                onChange={(e) => setAutoRemoveFromActive(e.target.checked)}
                                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                              />
                              <span>Keluarkan otomatis anggota keluarga terpilih dari data rumah aktif</span>
                            </label>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Main Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Pindah *</label>
                  <input
                    type="date"
                    value={tanggalPindah}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setTanggalPindah(newDate);
                      if (!editingItem) {
                        setNomorSuratPindah(getAutoLetterNumber(newDate));
                      }
                    }}
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Rumah Asal di Blok D *</label>
                  <input
                    type="text"
                    value={nomorRumahAsal}
                    onChange={(e) => setNomorRumahAsal(e.target.value)}
                    placeholder="Contoh: Blok D1 No. 18"
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {tipePencatatan === 'kk' ? 'Nomor Kartu Keluarga (KK) *' : 'Nomor Kartu Keluarga (KK)'}
                  </label>
                  <input
                    type="text"
                    value={nomorKK}
                    onChange={(e) => setNomorKK(e.target.value)}
                    placeholder="16 digit No. KK..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {tipePencatatan === 'kk' ? 'Nama Kepala Keluarga / Penanggung Jawab *' : 'Nama Lengkap Warga *'}
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama lengkap pemohon pindah..."
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Induk Kependudukan (NIK)</label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="16 digit NIK..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as Gender)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hubungan dalam Keluarga</label>
                  <select
                    value={hubunganKeluarga}
                    onChange={(e) => setHubunganKeluarga(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua / Mertua">Orang Tua / Mertua</option>
                    <option value="Famili Lain">Famili Lain</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah Jiwa yang Pindah</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={jumlahJiwaPindah}
                    onChange={(e) => setJumlahJiwaPindah(parseInt(e.target.value, 10) || 1)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Destination & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Alamat Tujuan Pindah *</label>
                  <textarea
                    rows={2}
                    value={alamatTujuan}
                    onChange={(e) => setAlamatTujuan(e.target.value)}
                    placeholder="Alamat lengkap tujuan, nama perumahan, jalan, RT/RW, kelurahan/desa..."
                    required
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kota / Kabupaten Tujuan</label>
                  <input
                    type="text"
                    value={kotaTujuan}
                    onChange={(e) => setKotaTujuan(e.target.value)}
                    placeholder="Contoh: Jonggol, Bogor / Jakarta Timur"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alasan Pindah *</label>
                  <select
                    value={alasanPindah}
                    onChange={(e) => setAlasanPindah(e.target.value as MovedCitizen['alasanPindah'])}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  >
                    <option value="Pindah Rumah / Beli Rumah">Pindah Rumah / Beli Rumah Pribadi</option>
                    <option value="Kontrak Habis / Pindah Sewa">Kontrak Habis / Pindah Sewa</option>
                    <option value="Pekerjaan / Mutasi Kantor">Pekerjaan / Mutasi Kantor</option>
                    <option value="Menikah / Ikut Keluarga">Menikah / Ikut Domisili Keluarga</option>
                    <option value="Pendidikan">Pendidikan / Sekolah</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor HP / WhatsApp yang Bisa Dihubungi</label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Nomor Surat Keterangan Pindah (SKPD) *</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      <Lock className="w-2.5 h-2.5 text-amber-700" />
                      Otomatis
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={nomorSuratPindah}
                    className="w-full py-2 px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 cursor-not-allowed select-all focus:outline-none"
                    title="Nomor surat SKPD digenerate otomatis berdasarkan agenda penomoran sistem dan tidak dapat diedit manual."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Nomor urut resmi berikutnya dari sistem (Format: [No]/SKPD/D/[Bulan]/[Tahun])
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Kunci rumah telah diserahkan kepada pemilik, tagihan iuran sudah lunas..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Petugas Pencatat Data / RT</label>
                  <input
                    type="text"
                    value={petugasPencatat}
                    onChange={(e) => setPetugasPencatat(e.target.value)}
                    placeholder="Nama Pengurus RT..."
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-950/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Catatan Pindah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cetak Surat Pengantar Pindah RT */}
      {letterPrintItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl space-y-6 my-6 max-h-[96vh] overflow-y-auto">
            {/* Header Dialog (Screen only) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Surat Pengantar Pindah Domisili RT/RW</h3>
                  <p className="text-[11px] text-slate-500">Pratinjau & Cetak Dokumen Resmi Rt.005 Dan Rw.005</p>
                </div>
              </div>

              {/* Action Buttons: Print / PDF & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all cursor-pointer ring-1 ring-blue-500"
                  title="Cetak langsung ke Printer atau Simpan sebagai PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Cetak PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLetterPrintItem(null)}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer"
                  title="Tutup Pratinjau Surat"
                >
                  <X className="w-4 h-4" />
                  <span>Tutup</span>
                </button>
              </div>
            </div>

            {/* Official Letter Paper */}
            <div id="printable-moved-letter" className="border border-slate-300 p-6 sm:p-8 rounded-xl bg-white text-slate-900 space-y-4 sm:space-y-5 print:space-y-2.5 font-serif leading-relaxed print:leading-snug text-sm shadow-sm print:border-none print:p-0">
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-double border-slate-900 pb-3 print:pb-2 gap-4">
                <LogoBlokD className="w-14 h-14 sm:w-16 sm:h-16 print:w-14 print:h-14 shrink-0" />
                <div className="flex-1 text-center space-y-0.5">
                  <div className="text-[11px] font-sans uppercase tracking-widest text-slate-600 font-semibold">
                    Pemerintah Kabupaten Bogor • Kecamatan Cileungsi • Desa Situ Sari
                  </div>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 font-sans">
                    PANORAMA REGENCY 3 SITU SARI
                  </h1>
                  <div className="text-xs sm:text-sm font-sans uppercase font-bold text-blue-800 tracking-wider">
                    BLOK D
                  </div>
                  <div className="text-[11px] font-sans text-slate-600">
                    Wilayah Administrasi: Rt.005 Dan Rw.005 • Kab. Bogor 16820
                  </div>
                </div>
                <div className="w-14 sm:w-16 hidden sm:block"></div>
              </div>

              {/* Title of Letter */}
              <div className="text-center space-y-0.5 pt-1 print:pt-0.5">
                <h2 className="font-bold text-base underline uppercase tracking-wide font-sans">
                  SURAT KETERANGAN PINDAH DOMISILI
                </h2>
                <div className="text-xs font-sans text-slate-600 font-mono">
                  Nomor: {letterPrintItem.nomorSuratPindah || 'S-PNDH/BLOK-D/RT05-RW05/' + new Date().getFullYear()}
                </div>
              </div>

              {/* Body text */}
              <div className="space-y-3 print:space-y-2 text-xs font-sans text-slate-800 leading-normal print:leading-tight">
                <p>
                  Yang bertanda tangan di bawah ini Pengurus Blok D bersama Pengurus Rt.005 Dan Rw.005 Perumahan Panorama Regency 3, Desa Situ Sari, Kecamatan Cileungsi, Kabupaten Bogor, menerangkan bahwa:
                </p>

                <div className="pl-2 sm:pl-4 font-sans">
                  <table className="w-full text-xs font-sans border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Nama Kepala Keluarga / Pemohon</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-900 align-top">{letterPrintItem.nama}</td>
                      </tr>
                      {letterPrintItem.nomorKK && letterPrintItem.nomorKK !== '-' && (
                        <tr>
                          <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Nomor Kartu Keluarga (KK)</td>
                          <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                          <td className="py-0.5 font-semibold text-slate-900 align-top">{letterPrintItem.nomorKK}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">NIK Pemohon</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-semibold text-slate-900 align-top">{letterPrintItem.nik}</td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Jenis Kelamin</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Alamat Rumah Asal</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">
                          {letterPrintItem.nomorRumahAsal}, Wilayah Rt.005 Dan Rw.005 Panorama Regency 3, Situ Sari, Cileungsi
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Jumlah Jiwa Pindah</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-900 align-top">
                          {letterPrintItem.jumlahJiwaPindah} Orang / Jiwa
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Alamat Tujuan Pindah</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-bold text-slate-900 align-top">
                          {letterPrintItem.alamatTujuan} {letterPrintItem.kotaTujuan ? `(${letterPrintItem.kotaTujuan})` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-48 sm:w-52 py-0.5 text-slate-700 align-top">Alasan Pindah</td>
                        <td className="w-4 py-0.5 text-slate-900 align-top text-center font-bold">:</td>
                        <td className="py-0.5 font-medium text-slate-900 align-top">{letterPrintItem.alasanPindah}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Family Members Table in Letter if multi-member */}
                {letterPrintItem.anggotaKeluarga && letterPrintItem.anggotaKeluarga.length > 1 && (
                  <div className="pt-1.5 print:pt-1">
                    <p className="font-bold text-[11px] mb-1">Daftar Anggota Keluarga yang Ikut Pindah:</p>
                    <table className="w-full border-collapse border border-slate-400 text-[11px] print:text-[10px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-400 p-1 text-center w-8">No</th>
                          <th className="border border-slate-400 p-1 text-left">Nama Anggota</th>
                          <th className="border border-slate-400 p-1 text-center">NIK</th>
                          <th className="border border-slate-400 p-1 text-center">L/P</th>
                          <th className="border border-slate-400 p-1 text-left">Hubungan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {letterPrintItem.anggotaKeluarga.map((mem, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-400 p-1 text-center">{idx + 1}</td>
                            <td className="border border-slate-400 p-1 font-semibold">{mem.nama}</td>
                            <td className="border border-slate-400 p-1 text-center font-mono">{mem.nik}</td>
                            <td className="border border-slate-400 p-1 text-center">{mem.jenisKelamin}</td>
                            <td className="border border-slate-400 p-1">{mem.hubunganKeluarga}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="pt-1 print:pt-0.5">
                  Adalah benar yang bersangkutan tercatat pernah berdomisili di Blok D Perumahan Panorama Regency 3 (Rt.005 Dan Rw.005) dan telah mengajukan permohonan surat keterangan pindah. Sepanjang berada di lingkungan kami, yang bersangkutan berkelakuan baik.
                </p>

                <p>
                  Demikian surat pengantar ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya untuk proses administrasi kependudukan di tempat tujuan.
                </p>
              </div>

              {/* Tanggal di Posisi Atas Kanan Tanda Tangan */}
              <div className="flex justify-end text-xs font-sans text-slate-800 pt-2 pb-1 print:pt-1 print:pb-0.5">
                <div>Situ Sari, {letterPrintItem.tanggalPindah ? formatDateNamedMonth(letterPrintItem.tanggalPindah) : formatDateNamedMonth(new Date().toISOString().slice(0, 10))}</div>
              </div>

              {/* Signature Block - 4 Separate Columns */}
              <div className="grid grid-cols-4 text-center text-xs font-sans text-slate-900 gap-2 pt-1 print:pt-0.5">
                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Ketua RW 005</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px]">
                      ( .............................. )
                    </div>
                  </div>
                </div>

                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Ketua RT 005</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px]">
                      ( .............................. )
                    </div>
                  </div>
                </div>

                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Pengurus Blok D</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px] uppercase">
                      ( {currentUser ? currentUser.nama : 'Ali Ragil Permana'} )
                    </div>
                  </div>
                </div>

                <div className="space-y-12 sm:space-y-14 print:space-y-10">
                  <div>
                    <strong>Warga Bersangkutan</strong>
                  </div>
                  <div>
                    <div className="font-bold underline text-[11px] uppercase">
                      ( {letterPrintItem.nama} )
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions (Screen only) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden text-xs text-slate-500">
              <span className="text-[11px]">💡 Tips: Pada dialog cetak browser, pilih tujuan <strong>"Save as PDF"</strong> untuk menyimpan sebagai dokumen digital atau pilih printer Anda.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLetterPrintItem(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn print:hidden">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Hapus Catatan Warga Pindah?</h3>
                <p className="text-xs text-rose-400">Data mutasi keluar akan dihapus</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus arsip pencatatan pindah atas nama <strong className="text-white">{itemToDelete.nama}</strong> ({itemToDelete.nomorRumahAsal})?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-700 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
