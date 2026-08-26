export interface UserAccount {
  username: string;
  password: string;
  nama: string;
  jabatan: string;
}

export const AUTHORIZED_USERS: UserAccount[] = [
  {
    username: 'adminmaster',
    password: 'admin12345',
    nama: 'Wily Gunawan',
    jabatan: 'Sekertaris Blok D',
  },
  {
    username: 'bendaharablokd',
    password: 'bendahara12345',
    nama: 'Fuji Oktaviani',
    jabatan: 'Bendahara Blok D',
  },
  {
    username: 'ketuablokd',
    password: 'ketuablokd123',
    nama: 'Ali Ragil Permana',
    jabatan: 'Ketua Blok D',
  },
  {
    username: 'd1depan',
    password: 'd1depan123',
    nama: 'Romadhoni',
    jabatan: 'Korlap Blok D1 Depan',
  },
  {
    username: 'd1belakang',
    password: 'd1belakang123',
    nama: 'Yongki',
    jabatan: 'Korlap Blok D1 Belakang',
  },
  {
    username: 'd2depan',
    password: 'd2depan123',
    nama: 'Satria',
    jabatan: 'Korlap Blok D2 Depan',
  },
  {
    username: 'd2belakang',
    password: 'd2belakang123',
    nama: 'Rizki Saputra',
    jabatan: 'Korlap Blok D2 Belakang, D3, & D4',
  },
];

export function findUserByCredentials(username: string, password: string): UserAccount | undefined {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();
  return AUTHORIZED_USERS.find(
    (u) => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
  );
}
