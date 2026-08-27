import React, { useState, useEffect } from 'react';
import { HouseUnit, Resident, Vehicle, HouseOccupancyStatus, Gender, FamilyRole, Religion, MaritalStatus, AuthUser, WifiProvider, PEKERJAAN_OPTIONS, PENGHASILAN_OPTIONS } from '../types/census';
import { calculateAge } from '../utils/censusHelpers';
import { 
  MASTER_HOUSE_NUMBERS, 
  BLOK_TOTAL_UNITS, 
  isValidMasterHouse, 
  formatHouseNumber, 
  BlokName, 
  TOTAL_OFFICIAL_HOUSES
} from '../data/masterHouseList';
import { X, Plus, Trash2, Home, Users, Car, Phone, CheckCircle2, UserPlus, AlertCircle, Check, HelpCircle, ChevronDown, ChevronUp, MapPin, Wifi, Briefcase, DollarSign, Coins } from 'lucide-react';

// Helper untuk mengecek apakah warga termasuk kategori berpenghasilan / bekerja aktif
export function isResidentEmployed(pekerjaan: string): boolean {
  const p = (pekerjaan || '').trim().toLowerCase();
  if (!p) return false;
  if (
    p.includes('belum') ||
    p.includes('tidak bekerja') ||
    p.includes('pelajar') ||
    p.includes('mahasiswa') ||
    p.includes('irt') ||
    p.includes('ibu rumah tangga') ||
    p.includes('pensiun') ||
    p.includes('balita') ||
    p.includes('anak')
  ) {
    return false;
  }
  return true;
}

interface CensusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (houseData: HouseUnit) => void;
  initialData?: HouseUnit | null;
  defaultSlotNumber?: number | null;
  currentUser?: AuthUser | null;
  existingHouses?: HouseUnit[];
}

export const CensusFormModal: React.FC<CensusFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultSlotNumber,
  currentUser,
  existingHouses = []
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showQuickPicker, setShowQuickPicker] = useState<boolean>(true);
  const defaultPetugas = currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : 'Wily Gunawan (Sekertaris Blok D)';

  // House Basic Fields
  const [selectedBlok, setSelectedBlok] = useState<BlokName>('D1');
  const [nomorRumahManual, setNomorRumahManual] = useState<string>('1');
  const [nomorUrut, setNomorUrut] = useState<number>(1);
  const [nomorRumah, setNomorRumah] = useState<string>('Blok D1 No. 01');
  const [rt, setRt] = useState<string>('005');
  const [rw, setRw] = useState<string>('005');
  const [dusun, setDusun] = useState<string>('Situsari');
  const [perumahan, setPerumahan] = useState<string>('Panorama Regency 3');
  const [statusHunian, setStatusHunian] = useState<HouseOccupancyStatus>('tetap');
  const [kepemilikan, setKepemilikan] = useState<HouseUnit['kepemilikan']>('Milik Sendiri (SHM/HGB)');
  const [nomorKK, setNomorKK] = useState<string>('');
  const [dayaListrik, setDayaListrik] = useState<HouseUnit['dayaListrik']>('1300 VA');
  const [sumberAir, setSumberAir] = useState<HouseUnit['sumberAir']>('Sumur Bor / Jetpump');
  const [wifi, setWifi] = useState<WifiProvider | string>('Tanpa Wifi');
  const [luasTanah, setLuasTanah] = useState<string>('');
  const [luasBangunan, setLuasBangunan] = useState<string>('');
  const [tanggalPindahMasuk, setTanggalPindahMasuk] = useState<string>('');
  const [catatanRumah, setCatatanRumah] = useState<string>('');
  const [petugasSensus, setPetugasSensus] = useState<string>(defaultPetugas);
  const [tanggalSensus, setTanggalSensus] = useState<string>(new Date().toISOString().slice(0, 10));

  // Emergency Contact
  const [kontakNama, setKontakNama] = useState<string>('');
  const [kontakHubungan, setKontakHubungan] = useState<string>('');
  const [kontakNoHp, setKontakNoHp] = useState<string>('');

  // Residents & Vehicles List
  const [residents, setResidents] = useState<Resident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Validation state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNomorUrut(initialData.nomorUrut || 1);
      const rawNo = initialData.nomorRumah || 'Blok D1 No. 01';
      setNomorRumah(rawNo);

      // Parse block and number from initialData.nomorRumah
      let blk = 'D1';
      let num = '01';
      const match = rawNo.match(/(?:Blok\s+)?(D[1-4]|D)?(?:\s*No\.?\s*|\/)?\s*(.+)/i);
      if (match) {
        if (match[1]) {
          const bUpper = match[1].toUpperCase();
          blk = ['D1', 'D2', 'D3', 'D4'].includes(bUpper) ? bUpper : 'D1';
        }
        if (match[2]) {
          num = match[2].trim();
        }
      }
      setSelectedBlok(blk as BlokName);
      setNomorRumahManual(num);

      setRt(initialData.rt || '005');
      setRw(initialData.rw || '005');
      setDusun(initialData.dusun || 'Situsari');
      setPerumahan(initialData.perumahan || 'Panorama Regency 3');
      setStatusHunian(initialData.statusHunian || 'tetap');
      setKepemilikan(initialData.kepemilikan || 'Milik Sendiri (SHM/HGB)');
      setNomorKK(initialData.nomorKK === '-' ? '' : (initialData.nomorKK || ''));
      setDayaListrik(initialData.dayaListrik || '1300 VA');
      setSumberAir(initialData.sumberAir || 'Sumur Bor / Jetpump');
      setWifi(initialData.wifi || 'Tanpa Wifi');
      setLuasTanah(initialData.luasTanah || '');
      setLuasBangunan(initialData.luasBangunan || '');
      setTanggalPindahMasuk(initialData.tanggalPindahMasuk || '');
      setCatatanRumah(initialData.catatanRumah || '');
      setPetugasSensus(initialData.petugasSensus || defaultPetugas);
      setTanggalSensus(initialData.tanggalSensus || new Date().toISOString().slice(0, 10));

      setKontakNama(initialData.kontakDarurat?.nama || '');
      setKontakHubungan(initialData.kontakDarurat?.hubungan || '');
      setKontakNoHp(initialData.kontakDarurat?.noHp || '');

      setResidents(initialData.residents || []);
      setVehicles(initialData.vehicles || []);
    } else {
      // New Form: Clean and empty state
      const slot = defaultSlotNumber || 1;
      const numStr = slot < 10 ? `0${slot}` : `${slot}`;
      setNomorUrut(slot);
      setSelectedBlok('D1');
      setNomorRumahManual(numStr);
      setNomorRumah(`Blok D1 No. ${numStr}`);
      setRt('005');
      setRw('005');
      setDusun('Situsari');
      setPerumahan('Panorama Regency 3');
      setStatusHunian('tetap');
      setKepemilikan('Milik Sendiri (SHM/HGB)');
      setNomorKK('');
      setDayaListrik('1300 VA');
      setSumberAir('Sumur Bor / Jetpump');
      setWifi('Tanpa Wifi');
      setLuasTanah('');
      setLuasBangunan('');
      setTanggalPindahMasuk('');
      setCatatanRumah('');
      setPetugasSensus(defaultPetugas);
      setTanggalSensus(new Date().toISOString().slice(0, 10));
      setKontakNama('');
      setKontakHubungan('');
      setKontakNoHp('');

      // Clean single blank resident for prompt entry
      setResidents([
        {
          id: `res-${Date.now()}-1`,
          nik: '',
          nama: '',
          jenisKelamin: 'L',
          tempatLahir: '',
          tanggalLahir: '',
          agama: 'Islam',
          statusKawin: 'Kawin',
          pendidikan: 'SMA / SMK / Sederajat',
          pekerjaan: '',
          penghasilan: '',
          noHp: '',
          golonganDarah: '-',
          hubunganKeluarga: 'Kepala Keluarga',
          statusKtp: 'KTP Blok D (Sesuai Alamat)',
          alamatKtpLuar: '',
          statusBpjs: 'Aktif (Mandiri)',
          kategoriKhusus: []
        }
      ]);
      setVehicles([]);
    }
    setActiveStep(1);
    setErrorMsg(null);
  }, [initialData, defaultSlotNumber, isOpen]);

  if (!isOpen) return null;

  const handleBlokChange = (newBlok: BlokName) => {
    setSelectedBlok(newBlok);
    const availableNumbers = MASTER_HOUSE_NUMBERS[newBlok];
    // If current number doesn't exist in new block, pick the first one or keep if valid
    const currentUnpadded = nomorRumahManual.replace(/^0+/, '');
    const isCurrentValid = availableNumbers.includes(nomorRumahManual) || availableNumbers.includes(currentUnpadded);
    const defaultNo = isCurrentValid ? nomorRumahManual : availableNumbers[0] || '1';
    
    setNomorRumahManual(defaultNo);
    setNomorRumah(formatHouseNumber(newBlok, defaultNo));
    const parsed = parseInt(defaultNo.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setNomorUrut(parsed);
    }
  };

  const handleNomorManualChange = (newNo: string) => {
    setNomorRumahManual(newNo);
    setNomorRumah(formatHouseNumber(selectedBlok, newNo));
    const parsed = parseInt(newNo.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setNomorUrut(parsed);
    }
  };

  const handleSelectMasterNumber = (num: string) => {
    setNomorRumahManual(num);
    setNomorRumah(formatHouseNumber(selectedBlok, num));
    const parsed = parseInt(num.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setNomorUrut(parsed);
    }
  };

  // Check if current input matches master reference
  const isMasterValid = isValidMasterHouse(selectedBlok, nomorRumahManual);
  const currentOfficialNumbers = MASTER_HOUSE_NUMBERS[selectedBlok] || [];

  // Check if house is already in existingHouses
  const alreadyRegisteredHouse = existingHouses.find((h) => {
    if (initialData && h.id === initialData.id) return false;
    const hNo = h.nomorRumah.toLowerCase().replace(/\s+/g, '');
    const currentNo = nomorRumah.toLowerCase().replace(/\s+/g, '');
    return hNo === currentNo;
  });

  const handleAddResident = () => {
    const newRes: Resident = {
      id: `res-${Date.now()}-${residents.length + 1}`,
      nik: '',
      nama: '',
      jenisKelamin: residents.length === 1 ? 'P' : 'L',
      tempatLahir: '',
      tanggalLahir: '',
      agama: 'Islam',
      statusKawin: residents.length === 1 ? 'Kawin' : 'Belum Kawin',
      pendidikan: 'SMA / SMK / Sederajat',
      pekerjaan: '',
      penghasilan: '',
      noHp: '',
      golonganDarah: '-',
      hubunganKeluarga: residents.length === 1 ? 'Istri' : 'Anak',
      statusKtp: 'KTP Blok D (Sesuai Alamat)',
      alamatKtpLuar: '',
      statusBpjs: 'Aktif (Mandiri)',
      kategoriKhusus: []
    };
    setResidents([...residents, newRes]);
  };

  const handleUpdateResident = (index: number, field: keyof Resident, value: any) => {
    const updated = [...residents];
    const target = { ...updated[index], [field]: value };

    // Otomatis kosongkan pilihan domisili KTP jika usia di bawah 17 tahun
    if (field === 'tanggalLahir') {
      const age = value ? calculateAge(value) : null;
      if (age !== null && age < 17) {
        target.statusKtp = '';
        target.alamatKtpLuar = '';
      } else if (age !== null && age >= 17 && (!target.statusKtp || target.statusKtp === '')) {
        target.statusKtp = 'KTP Blok D (Sesuai Alamat)';
      }
    }

    // Jika pekerjaan diubah ke non-bekerja (IRT, Pelajar, Belum Bekerja, Pensiun), reset penghasilan
    if (field === 'pekerjaan') {
      if (!isResidentEmployed(value)) {
        target.penghasilan = 'Tidak Ada Penghasilan';
      } else if (!target.penghasilan || target.penghasilan === 'Tidak Ada Penghasilan') {
        target.penghasilan = 'Rp 3.000.000 - Rp 5.000.000 (3 - 5 Juta)';
      }
    }

    updated[index] = target;
    setResidents(updated);
  };

  const handleToggleSpecialCategory = (resIndex: number, tag: 'Balita' | 'Lansia' | 'Ibu Hamil' | 'Disabilitas' | 'Pelajar' | 'Penerima Bansos') => {
    const updated = [...residents];
    const current = updated[resIndex].kategoriKhusus || [];
    if (current.includes(tag)) {
      updated[resIndex].kategoriKhusus = current.filter((t) => t !== tag);
    } else {
      updated[resIndex].kategoriKhusus = [...current, tag];
    }
    setResidents(updated);
  };

  const handleRemoveResident = (index: number) => {
    setResidents(residents.filter((_, i) => i !== index));
  };

  const handleAddVehicle = () => {
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}-${vehicles.length + 1}`,
      jenis: 'Sepeda Motor',
      merkModel: '',
      platNomor: '',
      warna: '',
      pemilik: residents[0]?.nama || ''
    };
    setVehicles([...vehicles, newVeh]);
  };

  const handleUpdateVehicle = (index: number, field: keyof Vehicle, value: any) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setVehicles(updated);
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const validateStep = (stepNumber: number): string | null => {
    if (stepNumber === 1) {
      if (!nomorRumahManual.trim() || !nomorRumah.trim()) {
        return 'Nomor rumah wajib dipilih atau diisi.';
      }
      if (!luasTanah.trim()) {
        return 'Luas Tanah (LT) rumah wajib diisi (contoh: 60 m²).';
      }
      if (!luasBangunan.trim()) {
        return 'Luas Bangunan (LB) rumah wajib diisi (contoh: 36 m²).';
      }
      if (!tanggalPindahMasuk.trim()) {
        return 'Tanggal Pindah Masuk ke Panorama Regency 3 wajib diisi.';
      }
      if (!rt || !rw) {
        return 'Wilayah Administrasi (RT dan RW) wajib dipilih.';
      }
      if (!dusun.trim()) {
        return 'Nama Dusun / Lingkungan wajib diisi.';
      }
      if (!perumahan.trim()) {
        return 'Nama Perumahan wajib diisi.';
      }
      if (statusHunian !== 'kosong') {
        if (!nomorKK.trim() || nomorKK === '-') {
          return 'Nomor Kartu Keluarga (KK) 16 digit wajib diisi untuk rumah berpenghuni.';
        }
        if (nomorKK.trim().replace(/\D/g, '').length !== 16) {
          return 'Nomor Kartu Keluarga (KK) harus terdiri dari 16 digit angka.';
        }
      }
    }

    if (stepNumber === 2) {
      if (statusHunian !== 'kosong' && residents.length === 0) {
        return 'Wajib menambahkan minimal 1 data anggota keluarga untuk rumah berpenghuni.';
      }
      for (let i = 0; i < residents.length; i++) {
        const r = residents[i];
        const resLabel = r.nama ? `"${r.nama}"` : `Anggota #${i + 1}`;
        if (!r.nama.trim()) {
          return `Nama lengkap pada Anggota #${i + 1} wajib diisi.`;
        }

        const isChild = r.hubunganKeluarga === 'Anak';
        const age = r.tanggalLahir ? calculateAge(r.tanggalLahir) : null;
        const isChildUnder17 = isChild && age !== null && age < 17;
        const isUnder17 = age !== null && age < 17;

        if (!isChildUnder17) {
          if (!r.nik.trim()) {
            return `NIK pada ${resLabel} wajib diisi 16 digit angka.`;
          }
          if (r.nik.trim().replace(/\D/g, '').length !== 16) {
            return `NIK pada ${resLabel} harus berupa 16 digit angka (saat ini: ${r.nik.trim().length} karakter).`;
          }
        } else {
          // Jika anak di bawah 17 tahun, NIK bersifat opsional. Namun jika diisi, harus 16 digit.
          if (r.nik.trim() && r.nik.trim() !== '-' && r.nik.trim().replace(/\D/g, '').length !== 16) {
            return `Jika diisi, NIK / KIA pada ${resLabel} harus berupa 16 digit angka (saat ini: ${r.nik.trim().length} karakter). Boleh dikosongkan jika anak belum memiliki NIK/KIA.`;
          }
        }

        if (!r.tempatLahir.trim()) {
          return `Tempat lahir pada ${resLabel} wajib diisi.`;
        }
        if (!r.tanggalLahir) {
          return `Tanggal lahir pada ${resLabel} wajib diisi.`;
        }
        if (!r.pendidikan) {
          return `Pendidikan terakhir pada ${resLabel} wajib dipilih.`;
        }
        if (!r.statusKawin) {
          return `Status perkawinan pada ${resLabel} wajib dipilih.`;
        }
        if (!r.pekerjaan.trim()) {
          return `Pekerjaan pada ${resLabel} wajib diisi (isi 'Belum Bekerja' / 'Pelajar' / 'IRT' jika tidak bekerja).`;
        }
        if (!r.agama) {
          return `Agama pada ${resLabel} wajib dipilih.`;
        }
        if (r.hubunganKeluarga === 'Kepala Keluarga' && (!r.noHp || !r.noHp.trim())) {
          return `No. HP / WhatsApp Kepala Keluarga (${resLabel}) wajib diisi untuk koordinasi RT.`;
        }
        if (!isUnder17 && r.statusKtp?.includes('Luar') && (!r.alamatKtpLuar || !r.alamatKtpLuar.trim())) {
          return `Alamat sesuai KTP pada ${resLabel} wajib diisi karena memilih status KTP Luar.`;
        }
      }
    }

    if (stepNumber === 3) {
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        if (!v.merkModel.trim()) {
          return `Merk & Model kendaraan #${i + 1} wajib diisi (misal: Honda Vario / Toyota Avanza).`;
        }
        if (!v.platNomor.trim()) {
          return `Nomor Polisi (Plat) kendaraan #${i + 1} wajib diisi.`;
        }
        if (!v.warna.trim()) {
          return `Warna kendaraan #${i + 1} wajib diisi.`;
        }
      }
    }

    if (stepNumber === 4) {
      if (!kontakNama.trim()) {
        return 'Nama Kontak Darurat wajib diisi.';
      }
      if (!kontakHubungan.trim()) {
        return 'Hubungan Kontak Darurat wajib diisi (misal: Orang Tua / Saudara / Kerabat).';
      }
      if (!kontakNoHp.trim()) {
        return 'Nomor HP Kontak Darurat wajib diisi.';
      }
      if (!petugasSensus.trim()) {
        return 'Nama Petugas Data penanggung jawab wajib diisi.';
      }
      if (!tanggalSensus) {
        return 'Tanggal Pendataan wajib diisi.';
      }
    }

    return null;
  };

  const handleGoToStep = (targetStep: number) => {
    if (targetStep > activeStep) {
      for (let s = activeStep; s < targetStep; s++) {
        const err = validateStep(s);
        if (err) {
          setErrorMsg(err);
          setActiveStep(s);
          return;
        }
      }
    }
    setErrorMsg(null);
    setActiveStep(targetStep);
  };

  const handleSaveAll = () => {
    for (let s = 1; s <= 4; s++) {
      const err = validateStep(s);
      if (err) {
        setErrorMsg(err);
        setActiveStep(s);
        return;
      }
    }
    setErrorMsg(null);

    const kepalaKeluarga = residents.find((r) => r.hubunganKeluarga === 'Kepala Keluarga') || residents[0];
    const kkName = statusHunian === 'kosong' ? (kepalaKeluarga?.nama ? `${kepalaKeluarga.nama} (Pemilik Belum Menetap)` : 'Kosong') : (kepalaKeluarga?.nama || 'Belum Ditentukan');

    const nowISO = new Date().toISOString();
    const updatedResidents: Resident[] = residents.map((r) => ({
      ...r,
      updatedAt: nowISO
    }));

    const houseToSave: HouseUnit = {
      id: initialData?.id || `D-${nomorUrut < 10 ? '0' + nomorUrut : nomorUrut}`,
      nomorRumah,
      nomorUrut,
      rt,
      rw,
      dusun,
      perumahan,
      statusHunian,
      statusSensus: statusHunian === 'kosong' && residents.length === 0 ? 'Sudah Sensus' : 'Sudah Sensus',
      kepemilikan,
      nomorKK: nomorKK.trim() || '-',
      kepalaKeluargaNama: kkName,
      dayaListrik,
      sumberAir,
      wifi: (wifi as WifiProvider) || 'Tanpa Wifi',
      luasTanah,
      luasBangunan,
      catatanRumah,
      tanggalPindahMasuk: tanggalPindahMasuk || undefined,
      tanggalSensus,
      petugasSensus,
      residents: updatedResidents,
      vehicles,
      updatedAt: nowISO,
      terakhirDiubahOleh: petugasSensus,
      kontakDarurat: {
        nama: kontakNama,
        hubungan: kontakHubungan,
        noHp: kontakNoHp
      },
      iuranHistory: initialData?.iuranHistory || [
        { bulan: '2025-01', namaBulan: 'Januari 2025', nominal: 50000, status: 'Lunas', tanggalBayar: '2025-01-05', metode: 'Transfer' },
        { bulan: '2025-02', namaBulan: 'Februari 2025', nominal: 50000, status: 'Belum Lunas' }
      ]
    };

    onSave(houseToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300">
              📝
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {initialData ? `Edit Data ${initialData.nomorRumah}` : 'Formulir Data Warga Blok D'}
              </h3>
              <p className="text-xs text-slate-400">
                Panorama Regency 3 • RT {rt} / RW {rw}, Ds. Situ Sari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Wizard Bar */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold shrink-0 overflow-x-auto no-scrollbar">
          {[
            { step: 1, label: '1. Data Rumah', icon: Home },
            { step: 2, label: `2. Anggota Keluarga (${residents.length})`, icon: Users },
            { step: 3, label: `3. Kendaraan (${vehicles.length})`, icon: Car },
            { step: 4, label: '4. Kontak & Verifikasi', icon: Phone }
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => handleGoToStep(s.step)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeStep === s.step
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Mandatory Note Banner & Error Notification */}
        <div className="px-5 pt-3 space-y-2">
          <div className="bg-amber-50/90 border border-amber-200 px-3.5 py-2 rounded-xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-extrabold text-sm">*</span>
              <span className="font-semibold">
                Semua isian bertanda <span className="text-rose-600 font-bold">* (Wajib)</span> harus diisi lengkap oleh petugas agar data tidak terlewat.
              </span>
            </div>
            <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md font-bold shrink-0 hidden sm:inline-block">
              Validasi Ketat Aktif
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 shadow-sm animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-800 flex-1">
          {/* STEP 1: Data Rumah */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-blue-950 mb-2">
                <p className="font-bold text-xs">Informasi Lokasi Unit Rumah Blok D Panorama Regency 3</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Pilih Blok (D1, D2, D3, D4) dan nomor rumah acuan resmi, lalu lengkapi seluruh spesifikasi hunian di bawah.
                </p>
              </div>

              {/* Blok & Nomor Rumah Master Data Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                {/* Blok Selection (D1, D2, D3, D4) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-bold text-slate-800 text-xs">
                      1. Pilih Blok Acuan Resmi: <span className="text-rose-600 font-bold">* (Wajib)</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Total Acuan: {TOTAL_OFFICIAL_HOUSES} Unit
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['D1', 'D2', 'D3', 'D4'] as BlokName[]).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBlokChange(b)}
                        className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center justify-center border text-center ${
                          selectedBlok === b
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <span className="text-sm tracking-wide">Blok {b}</span>
                        <span className={`text-[10px] font-medium ${selectedBlok === b ? 'text-blue-100' : 'text-slate-500'}`}>
                          {BLOK_TOTAL_UNITS[b]} Unit Resmi
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nomor Selection & Manual Input */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
                  {/* Quick Select from Master Dropdown */}
                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Pilih No. Acuan (Blok {selectedBlok}): <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <select
                      value={nomorRumahManual}
                      required
                      onChange={(e) => handleSelectMasterNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                      <option value="" disabled>-- Pilih Nomor Resmi --</option>
                      {currentOfficialNumbers.map((num) => (
                        <option key={num} value={num}>
                          No. {num} {selectedBlok === 'D2' && (num === '12A' || num === '12B') ? '★ Khusus' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manual Input / Custom Search */}
                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Atau Input No. Manual: <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      list="master-numbers-list"
                      required
                      value={nomorRumahManual}
                      onChange={(e) => handleNomorManualChange(e.target.value)}
                      placeholder={`Contoh: 1, 12, 12A...`}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                    />
                    <datalist id="master-numbers-list">
                      {currentOfficialNumbers.map((num) => (
                        <option key={num} value={num} />
                      ))}
                    </datalist>
                  </div>

                  {/* Formatted Output Name */}
                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Nama Unit Tersimpan: <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nomorRumah}
                      onChange={(e) => setNomorRumah(e.target.value)}
                      className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="Contoh: Blok D1 No. 01"
                    />
                  </div>
                </div>

                {/* Master Reference Status Badge & Alerts */}
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    {isMasterValid ? (
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Nomor ini sesuai data master acuan resmi Blok {selectedBlok} (Unit {nomorRumahManual} dari {BLOK_TOTAL_UNITS[selectedBlok]} unit)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Nomor tambahan / manual kustom (di luar {BLOK_TOTAL_UNITS[selectedBlok]} unit acuan Blok {selectedBlok})</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowQuickPicker(!showQuickPicker)}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showQuickPicker ? 'Tutup Katalog Nomor' : 'Buka Katalog Nomor Cepat'}</span>
                      {showQuickPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Warning if already registered */}
                  {alreadyRegisteredHouse && (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Perhatian:</strong> {nomorRumah} sudah terdata di sistem atas nama KK: <strong>{alreadyRegisteredHouse.kepalaKeluargaNama}</strong> ({alreadyRegisteredHouse.residents.length} Jiwa). Menyimpan form ini akan memperbarui data tersebut.
                      </span>
                    </div>
                  )}

                  {/* Interactive Quick Grid of Official Numbers */}
                  {showQuickPicker && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                        <span>Pilih Cepat dari {currentOfficialNumbers.length} Nomor Resmi Blok {selectedBlok}:</span>
                        <span className="text-slate-400 font-normal">Klik untuk memilih langsung</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                        {currentOfficialNumbers.map((num) => {
                          const isSelected = nomorRumahManual === num;
                          const isOccupied = existingHouses.some((h) => {
                            const formatted = formatHouseNumber(selectedBlok, num).toLowerCase();
                            return h.nomorRumah.toLowerCase() === formatted;
                          });

                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleSelectMasterNumber(num)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                                  : isOccupied
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'
                              }`}
                              title={isOccupied ? `No. ${num} (Sudah Terdata)` : `No. ${num} (Tersedia)`}
                            >
                              {num}
                              {isOccupied && <span className="ml-1 text-[9px] text-emerald-600">✓</span>}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                          <span>Dipilih</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300"></span>
                          <span>Sudah Terdata</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300"></span>
                          <span>Belum Terdata</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Hunian: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <select
                    value={statusHunian}
                    required
                    onChange={(e) => setStatusHunian(e.target.value as HouseOccupancyStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tetap">Dihuni Tetap (Pemilik Sendiri)</option>
                    <option value="kontrak">Sewa / Kontrak</option>
                    <option value="usaha">Tempat Usaha / Usaha & Hunian</option>
                    <option value="renovasi">Sedang Renovasi</option>
                    <option value="kosong">Kosong / Belum Dihuni</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Kepemilikan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <select
                    value={kepemilikan}
                    required
                    onChange={(e) => setKepemilikan(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Milik Sendiri (SHM/HGB)">Milik Sendiri (SHM/HGB)</option>
                    <option value="Kontrak / Sewa">Kontrak / Sewa</option>
                    <option value="Rumah Keluarga / Dinas">Rumah Keluarga / Dinas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (KK): {statusHunian !== 'kosong' ? <span className="text-rose-600 font-bold">* (Wajib 16 Digit)</span> : <span className="text-slate-400 font-normal">(Opsional bila kosong)</span>}
                  </label>
                  <input
                    type="text"
                    required={statusHunian !== 'kosong'}
                    maxLength={16}
                    value={nomorKK}
                    onChange={(e) => setNomorKK(e.target.value)}
                    placeholder="16 Digit No KK (contoh: 320101...)"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Daya Listrik PLN: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <select
                    value={dayaListrik}
                    required
                    onChange={(e) => setDayaListrik(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="900 VA">900 VA</option>
                    <option value="1300 VA">1300 VA</option>
                    <option value="2200 VA">2200 VA</option>
                    <option value="3500 VA+">3500 VA+</option>
                    <option value="Belum Terpasang">Belum Terpasang</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sumber Air Bersih: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <select
                    value={sumberAir}
                    required
                    onChange={(e) => setSumberAir(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sumur Bor / Jetpump">Sumur Bor / Jetpump</option>
                    <option value="PDAM">PDAM</option>
                    <option value="Keduanya">Keduanya (PDAM & Jetpump)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-blue-600" />
                      Wifi / Internet Rumah:
                    </span>
                    <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <select
                    value={wifi}
                    required
                    onChange={(e) => setWifi(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="Tanpa Wifi">1. Tanpa Wifi</option>
                    <option value="Home Fiber">2. Home Fiber</option>
                    <option value="Hira">3. Hira</option>
                    <option value="Bnetfit">4. Bnetfit</option>
                    <option value="My Republic">5. My Republic</option>
                    <option value="Wifi Lain">6. Wifi Lain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Luas Tanah & Bangunan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={luasTanah}
                      onChange={(e) => setLuasTanah(e.target.value)}
                      placeholder="LT: 60 m²"
                      className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                    <input
                      type="text"
                      required
                      value={luasBangunan}
                      onChange={(e) => setLuasBangunan(e.target.value)}
                      placeholder="LB: 36 m²"
                      className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tgl Pindah Masuk Panorama 3: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalPindahMasuk}
                    onChange={(e) => setTanggalPindahMasuk(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Wilayah Administrasi: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">RT:</span>
                      <select
                        value={rt}
                        required
                        onChange={(e) => setRt(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      >
                        {['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012'].map((item) => (
                          <option key={item} value={item}>RT {item}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">RW:</span>
                      <select
                        value={rw}
                        required
                        onChange={(e) => setRw(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      >
                        {['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013', '014', '015'].map((item) => (
                          <option key={item} value={item}>RW {item}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Dusun & Nama Perumahan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Dusun:</span>
                      <input
                        type="text"
                        required
                        value={dusun}
                        onChange={(e) => setDusun(e.target.value)}
                        placeholder="Situsari"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">Perumahan:</span>
                      <input
                        type="text"
                        required
                        value={perumahan}
                        onChange={(e) => setPerumahan(e.target.value)}
                        placeholder="Panorama Regency 3"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Catatan Khusus Rumah / Lingkungan: <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    value={catatanRumah}
                    onChange={(e) => setCatatanRumah(e.target.value)}
                    rows={2}
                    placeholder="Misal: Rumah hook, ada kanopi, memelihara hewan, warung kelontong, dsb."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Anggota Keluarga (Multi-Resident Adder) */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Daftar Anggota Keluarga (KK) <span className="text-rose-600 font-bold">* (Wajib diisi lengkap)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Semua kolom identitas (Nama, NIK 16 digit, Tempat/Tgl Lahir, Pendidikan, Pekerjaan, HP) wajib diisi untuk tiap anggota.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddResident}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Anggota</span>
                </button>
              </div>

              {residents.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 border-2 border-dashed border-rose-200 rounded-2xl">
                  <p className="text-rose-600 font-bold mb-1">Belum ada data anggota keluarga yang diinput!</p>
                  <p className="text-slate-500 text-xs mb-3">Wajib menambahkan minimal 1 data anggota keluarga untuk rumah berpenghuni.</p>
                  <button
                    type="button"
                    onClick={handleAddResident}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  >
                    + Input Anggota Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {residents.map((res, idx) => (
                    <div
                      key={res.id || idx}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">
                            {res.nama || `Anggota #${idx + 1}`}
                          </span>
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-semibold text-[10px]">
                            {res.hubunganKeluarga}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveResident(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Line 1: NIK & Nama & Hubungan */}
                      {(() => {
                        const isChild = res.hubunganKeluarga === 'Anak';
                        const age = res.tanggalLahir ? calculateAge(res.tanggalLahir) : null;
                        const isConfirmedChildUnder17 = isChild && age !== null && age < 17;
                        const isChildNoAgeYet = isChild && age === null;
                        const isNikOptional = isConfirmedChildUnder17 || isChildNoAgeYet;

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                Nama Lengkap: <span className="text-rose-600 font-bold">* (Wajib)</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={res.nama}
                                onChange={(e) => handleUpdateResident(idx, 'nama', e.target.value)}
                                placeholder="Nama lengkap sesuai KTP / Akta"
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  NIK / KIA:{' '}
                                  {isConfirmedChildUnder17 ? (
                                    <span className="text-emerald-700 font-semibold">(Opsional)</span>
                                  ) : isChildNoAgeYet ? (
                                    <span className="text-slate-500 font-normal">(Opsional bila &lt; 17 Thn)</span>
                                  ) : (
                                    <span className="text-rose-600 font-bold">* (Wajib 16 Digit)</span>
                                  )}
                                </label>
                                {isConfirmedChildUnder17 && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Anak &lt; 17 Thn
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                required={!isNikOptional}
                                maxLength={16}
                                value={res.nik}
                                onChange={(e) => handleUpdateResident(idx, 'nik', e.target.value)}
                                placeholder={
                                  isConfirmedChildUnder17
                                    ? '16 Digit KIA / NIK (Boleh Kosong)'
                                    : isChildNoAgeYet
                                    ? '16 Digit NIK (Opsional jika < 17 Thn)'
                                    : '16 Digit NIK KTP'
                                }
                                className={`w-full p-2 bg-white border rounded-xl font-mono focus:ring-2 ${
                                  isConfirmedChildUnder17
                                    ? 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500'
                                    : 'border-slate-300 focus:ring-blue-500'
                                }`}
                              />
                              {isConfirmedChildUnder17 && (
                                <p className="text-[10px] text-emerald-700 mt-1">
                                  💡 Anak usia {age} thn (di bawah 17 thn) tidak diwajibkan input NIK e-KTP.
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                Hubungan Keluarga: <span className="text-rose-600 font-bold">* (Wajib)</span>
                              </label>
                              <select
                                value={res.hubunganKeluarga}
                                required
                                onChange={(e) => handleUpdateResident(idx, 'hubunganKeluarga', e.target.value as FamilyRole)}
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                              >
                                <option value="Kepala Keluarga">Kepala Keluarga</option>
                                <option value="Istri">Istri</option>
                                <option value="Anak">Anak</option>
                                <option value="Orang Tua">Orang Tua</option>
                                <option value="Mertua">Mertua</option>
                                <option value="Famili Lain">Famili Lain</option>
                                <option value="Asisten Rumah Tangga">Asisten Rumah Tangga</option>
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Line 2: Gender, Tempat Lahir, Tgl Lahir */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Jenis Kelamin: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <select
                            value={res.jenisKelamin}
                            required
                            onChange={(e) => handleUpdateResident(idx, 'jenisKelamin', e.target.value as Gender)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                          >
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Tempat Lahir: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={res.tempatLahir}
                            onChange={(e) => handleUpdateResident(idx, 'tempatLahir', e.target.value)}
                            placeholder="Kota / Kab Kelahiran"
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Tanggal Lahir: <span className="text-rose-600 font-bold">* (Wajib)</span> {res.tanggalLahir ? `(Usia: ${calculateAge(res.tanggalLahir)} Thn)` : ''}
                          </label>
                          <input
                            type="date"
                            required
                            value={res.tanggalLahir}
                            onChange={(e) => handleUpdateResident(idx, 'tanggalLahir', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                          />
                        </div>
                      </div>

                      {/* Line 3: Pendidikan Terakhir, Status Perkawinan, Pekerjaan */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Pendidikan Terakhir: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <select
                            value={res.pendidikan}
                            required
                            onChange={(e) => handleUpdateResident(idx, 'pendidikan', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
                          >
                            <option value="Tidak / Belum Sekolah">Tidak / Belum Sekolah</option>
                            <option value="PAUD / TK">PAUD / TK</option>
                            <option value="SD / Sederajat">SD / Sederajat</option>
                            <option value="SMP / Sederajat">SMP / MTs / Sederajat</option>
                            <option value="SMA / SMK / Sederajat">SMA / SMK / MA / Sederajat</option>
                            <option value="Diploma (D1 - D3)">Diploma (D1 - D3)</option>
                            <option value="Sarjana (S1 / D4)">Sarjana (S1 / D4)</option>
                            <option value="Magister (S2)">Magister (S2)</option>
                            <option value="Doktor (S3)">Doktor (S3)</option>
                            <option value="Lainnya / Non-Formal">Lainnya / Non-Formal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Status Perkawinan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <select
                            value={res.statusKawin}
                            required
                            onChange={(e) => handleUpdateResident(idx, 'statusKawin', e.target.value as MaritalStatus)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                          >
                            <option value="Kawin">Kawin</option>
                            <option value="Belum Kawin">Belum Kawin</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                            <option value="Cerai Mati">Cerai Mati</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5 flex items-center justify-between">
                            <span>Pekerjaan: <span className="text-rose-600 font-bold">* (Wajib)</span></span>
                          </label>
                          <select
                            value={
                              PEKERJAAN_OPTIONS.includes(res.pekerjaan as any)
                                ? res.pekerjaan
                                : res.pekerjaan
                                ? 'Lainnya (Ketik Manual)'
                                : ''
                            }
                            required
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'Lainnya (Ketik Manual)') {
                                handleUpdateResident(idx, 'pekerjaan', res.pekerjaan && !PEKERJAAN_OPTIONS.includes(res.pekerjaan as any) ? res.pekerjaan : '');
                              } else {
                                handleUpdateResident(idx, 'pekerjaan', val);
                              }
                            }}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                          >
                            <option value="">-- Pilih Kategori / Kriteria Pekerjaan --</option>
                            {PEKERJAAN_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>

                          {/* Jika memilih Lainnya atau mengisi profesi kustom */}
                          {(res.pekerjaan === 'Lainnya (Ketik Manual)' || (!PEKERJAAN_OPTIONS.includes(res.pekerjaan as any) && res.pekerjaan !== '')) && (
                            <input
                              type="text"
                              required
                              value={res.pekerjaan === 'Lainnya (Ketik Manual)' ? '' : res.pekerjaan}
                              onChange={(e) => handleUpdateResident(idx, 'pekerjaan', e.target.value)}
                              placeholder="Ketik nama profesi / pekerjaan spesifik..."
                              className="w-full mt-1.5 p-2 bg-amber-50/60 border border-amber-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white"
                            />
                          )}
                        </div>
                      </div>

                      {/* Line 3.5: Input Penghasilan Bulanan (Hanya Muncul Jika Warga Bekerja) */}
                      {isResidentEmployed(res.pekerjaan) && (
                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Penghasilan Bulanan (Warga Bekerja):</span>
                              <span className="text-emerald-700 text-[10px] font-normal">(Kriteria Ekonomi)</span>
                            </label>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                              Warga Produktif Bekerja
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={res.penghasilan || 'Rp 3.000.000 - Rp 5.000.000 (3 - 5 Juta)'}
                              onChange={(e) => handleUpdateResident(idx, 'penghasilan', e.target.value)}
                              className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-400 outline-none"
                            >
                              {PENGHASILAN_OPTIONS.map((pOpt) => (
                                <option key={pOpt} value={pOpt}>
                                  {pOpt}
                                </option>
                              ))}
                            </select>

                            {/* Quick Chips untuk Pemilihan Cepat */}
                            <div className="flex flex-wrap gap-1 items-center">
                              {[
                                { label: '< 3 Jt', val: '< Rp 3.000.000 (< 3 Juta)' },
                                { label: '3-5 Jt (UMR)', val: 'Rp 3.000.000 - Rp 5.000.000 (3 - 5 Juta)' },
                                { label: '5-10 Jt', val: 'Rp 5.000.000 - Rp 10.000.000 (5 - 10 Juta)' },
                                { label: '10-20 Jt', val: 'Rp 10.000.000 - Rp 20.000.000 (10 - 20 Juta)' },
                                { label: '> 20 Jt', val: '> Rp 20.000.000 (> 20 Juta)' },
                                { label: 'Tidak Tetap', val: 'Penghasilan Tidak Tetap / Harian' }
                              ].map((chip) => (
                                <button
                                  key={chip.val}
                                  type="button"
                                  onClick={() => handleUpdateResident(idx, 'penghasilan', chip.val)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    res.penghasilan === chip.val
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-white/80 hover:bg-white text-emerald-900 border border-emerald-200'
                                  }`}
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-emerald-800/80">
                            * Digunakan secara anonim untuk statistik demografi, pemetaan ekonomi &amp; ketahanan sosial paguyuban Blok D.
                          </p>
                        </div>
                      )}

                      {/* Line 4: No HP, Agama, Golongan Darah */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            No. HP / WA Aktif: {res.hubunganKeluarga === 'Kepala Keluarga' ? <span className="text-rose-600 font-bold">* (Wajib KK)</span> : <span className="text-slate-400 font-normal">(Bila ada)</span>}
                          </label>
                          <input
                            type="tel"
                            required={res.hubunganKeluarga === 'Kepala Keluarga'}
                            value={res.noHp}
                            onChange={(e) => handleUpdateResident(idx, 'noHp', e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Agama: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <select
                            value={res.agama}
                            required
                            onChange={(e) => handleUpdateResident(idx, 'agama', e.target.value as Religion)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                          >
                            <option value="Islam">Islam</option>
                            <option value="Kristen">Kristen Protestan</option>
                            <option value="Katolik">Katolik</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Buddha">Buddha</option>
                            <option value="Konghucu">Konghucu</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Golongan Darah: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <select
                            value={res.golonganDarah || '-'}
                            required
                            onChange={(e) => handleUpdateResident(idx, 'golonganDarah', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                          >
                            <option value="-">- (Belum Tahu / Belum Cek)</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                          </select>
                        </div>
                      </div>

                      {/* Line 5: Status BPJS & Domisili KTP */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            Status BPJS Kesehatan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <select
                            value={res.statusBpjs}
                            required
                            onChange={(e) => handleUpdateResident(idx, 'statusBpjs', e.target.value as any)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                          >
                            <option value="Aktif (Perusahaan/PPU)">Aktif (Perusahaan / PPU)</option>
                            <option value="Aktif (Mandiri)">Aktif (Mandiri / Bayar Sendiri)</option>
                            <option value="Aktif (PBI/Bansos)">Aktif (PBI / Bantuan Pemerintah)</option>
                            <option value="Tidak Aktif / Tidak Ada">Tidak Aktif / Belum Ada</option>
                          </select>
                        </div>

                        {(() => {
                          const resAge = res.tanggalLahir ? calculateAge(res.tanggalLahir) : null;
                          const isUnder17 = resAge !== null && resAge < 17;

                          return (
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[11px] font-bold text-slate-700">
                                  Domisili KTP: {isUnder17 ? <span className="text-emerald-700 font-bold">(Otomatis Kosong / &lt; 17 Thn)</span> : <span className="text-rose-600 font-bold">* (Wajib)</span>}
                                </label>
                                {isUnder17 && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                                    Di Bawah 17 Thn
                                  </span>
                                )}
                              </div>
                              <select
                                value={isUnder17 ? '' : (res.statusKtp || 'KTP Blok D (Sesuai Alamat)')}
                                required={!isUnder17}
                                disabled={isUnder17}
                                onChange={(e) => handleUpdateResident(idx, 'statusKtp', e.target.value as any)}
                                className={`w-full p-2 rounded-xl text-xs transition-colors ${
                                  isUnder17
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed italic'
                                    : 'bg-white border border-slate-300 text-slate-800'
                                }`}
                              >
                                {isUnder17 ? (
                                  <option value="">- (Belum Memiliki KTP / Belum Wajib KTP)</option>
                                ) : (
                                  <>
                                    <option value="KTP Blok D (Sesuai Alamat)">KTP Sesuai Alamat Blok D Panorama</option>
                                    <option value="KTP Luar (Domisili Sementara)">KTP Luar (Domisili Sementara / Kontrak)</option>
                                  </>
                                )}
                              </select>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Alamat Sesuai KTP (jika memilih KTP Luar dan usia >= 17) */}
                      {(() => {
                        const resAge = res.tanggalLahir ? calculateAge(res.tanggalLahir) : null;
                        const isUnder17 = resAge !== null && resAge < 17;
                        if (isUnder17 || !res.statusKtp?.includes('Luar')) return null;

                        return (
                          <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                Alamat Sesuai KTP: <span className="text-rose-600 font-bold">* (Wajib untuk KTP Luar)</span>
                              </label>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md border border-amber-300">
                                KTP Luar
                              </span>
                            </div>
                            <input
                              type="text"
                              required
                              value={res.alamatKtpLuar || ''}
                              onChange={(e) => handleUpdateResident(idx, 'alamatKtpLuar', e.target.value)}
                              placeholder="Contoh: Jl. Kenanga No. 12, RT 03/RW 05, Kel. Sukamaju, Kec. Cilodong, Kota Depok, Jawa Barat"
                              className="w-full p-2.5 bg-white border border-amber-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none"
                            />
                            <p className="text-[10px] text-amber-800 leading-relaxed">
                              Cantumkan alamat lengkap asal sesuai yang tertera pada kartu fisik KTP/e-KTP anggota keluarga (Jalan/Gang, RT/RW, Kelurahan/Desa, Kecamatan, Kota/Kabupaten, dan Provinsi).
                            </p>
                          </div>
                        );
                      })()}

                      {/* Kategori Khusus Tags for Posyandu & Social Aid */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Tag Khusus (Kesehatan / Posyandu RT): <span className="text-slate-400 font-normal">(Pilih jika ada)</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(['Balita', 'Lansia', 'Ibu Hamil', 'Pelajar', 'Disabilitas', 'Penerima Bansos'] as const).map((tag) => {
                            const isChecked = res.kategoriKhusus?.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleToggleSpecialCategory(idx, tag)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-500'
                                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {isChecked ? '✓ ' : '+ '} {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Kendaraan */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Data Kendaraan Warga <span className="text-slate-500 font-normal">(Wajib lengkap jika ada kendaraan)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Digunakan untuk kontrol keamanan portal pintu masuk & stiker parkir warga Blok D.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Kendaraan</span>
                </button>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-600 font-bold mb-1">Tidak Ada Kendaraan Yang Didaftarkan</p>
                  <p className="text-slate-500 text-xs mb-3">Jika warga memiliki motor/mobil, klik tombol di bawah untuk mendaftarkan plat nomor.</p>
                  <button
                    type="button"
                    onClick={handleAddVehicle}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  >
                    + Daftarkan Mobil / Motor Warga
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((veh, vIdx) => (
                    <div
                      key={veh.id || vIdx}
                      className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Jenis: <span className="text-rose-600 font-bold">*</span>
                        </label>
                        <select
                          value={veh.jenis}
                          required
                          onChange={(e) => handleUpdateVehicle(vIdx, 'jenis', e.target.value as any)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                        >
                          <option value="Mobil">Mobil</option>
                          <option value="Sepeda Motor">Sepeda Motor</option>
                          <option value="Sepeda Listrik">Sepeda Listrik</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Merk & Model: <span className="text-rose-600 font-bold">* (Wajib)</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={veh.merkModel}
                          onChange={(e) => handleUpdateVehicle(vIdx, 'merkModel', e.target.value)}
                          placeholder="Avanza, Vario, Brio..."
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Nomor Polisi (Plat): <span className="text-rose-600 font-bold">* (Wajib)</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={veh.platNomor}
                          onChange={(e) => handleUpdateVehicle(vIdx, 'platNomor', e.target.value.toUpperCase())}
                          placeholder="F 1234 ABC"
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-sky-800 uppercase"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Warna: <span className="text-rose-600 font-bold">* (Wajib)</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={veh.warna}
                            onChange={(e) => handleUpdateVehicle(vIdx, 'warna', e.target.value)}
                            placeholder="Hitam, Putih..."
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(vIdx)}
                          className="text-rose-500 hover:text-rose-700 p-2 mt-4 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Kontak Darurat & Verifikasi */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Kontak Darurat (Emergency Contact) <span className="text-rose-600 font-bold">* (Wajib)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Kerabat atau saudara yang dapat dihubungi pengurus RT dalam keadaan darurat / musibah.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Kontak Darurat: <span className="text-rose-600 font-bold">* (Wajib)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={kontakNama}
                      onChange={(e) => setKontakNama(e.target.value)}
                      placeholder="Nama Kerabat / Saudara"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Hubungan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={kontakHubungan}
                      onChange={(e) => setKontakHubungan(e.target.value)}
                      placeholder="Orang Tua / Saudara / Pemilik"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      No. HP Kontak: <span className="text-rose-600 font-bold">* (Wajib)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={kontakNoHp}
                      onChange={(e) => setKontakNoHp(e.target.value)}
                      placeholder="08..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Census Officer & Date verification */}
              <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200 space-y-3">
                <h4 className="font-bold text-sky-950 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-700" />
                  Verifikasi Petugas Data Rt.005 Dan Rw.005 <span className="text-rose-600 font-bold">* (Wajib)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-sky-900 mb-1">
                      Nama Petugas Data: <span className="text-rose-600 font-bold">* (Wajib)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={petugasSensus}
                      onChange={(e) => setPetugasSensus(e.target.value)}
                      className="w-full p-2 bg-white border border-sky-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sky-900 mb-1">
                      Tanggal Pendataan: <span className="text-rose-600 font-bold">* (Wajib)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalSensus}
                      onChange={(e) => setTanggalSensus(e.target.value)}
                      className="w-full p-2 bg-white border border-sky-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                ← Sebelumnya
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Batal
            </button>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => handleGoToStep(activeStep + 1)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-all"
              >
                Lanjut Langkah {activeStep + 1} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Data Warga</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
