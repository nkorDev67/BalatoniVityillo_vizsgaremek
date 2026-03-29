const API_ALAP_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export const OLDAL_UTAK = {
  kezdolap: '/',
  login: '/login',
  register: '/register',
  bejelentkezes: '/login',
  regisztracio: '/register',
  profil: '/profil',
  felujitasKeres: '/felujitaskeres',
  beosztas: '/beosztas',
  admin: '/admin',
} as const;

export const API_UTAK = {
  nyilvanos: {
    kezdolap: '/api/nyilvanos/kezdolap',
  },
  azonositas: {
    bejelentkezes: '/api/azonositas/bejelentkezes',
    regisztracio: '/api/azonositas/regisztracio',
    profilom: '/api/azonositas/profilom',
  },
  felujitas: {
    keres: '/api/felujitas/keres',
    sajatKeresek: '/api/felujitas/sajat-keresek',
    reszletek: (id: number | string) => `/api/felujitas/reszletek/${id}`,
  },
  beosztas: {
    sajatBeosztasok: '/api/beosztas/sajat-beosztasok',
    befejezes: (id: number | string) => `/api/beosztas/befejezes/${id}`,
  },
  adminisztracio: {
    munkasok: '/api/adminisztracio/munkasok',
    munkas: (id: number | string) => `/api/adminisztracio/munkasok/${id}`,
    kerelmek: '/api/adminisztracio/kerelmek',
    statuszFrissites: '/api/adminisztracio/statusz-frissites',
    feladatokKiosztashoz: '/api/adminisztracio/feladatok-kiosztashoz',
    beosztasokMentese: '/api/adminisztracio/beosztasok-mentese',
  },
} as const;

export const apiVegpont = (utvonal: string) => {
  const alap = API_ALAP_URL.replace(/\/$/, '');
  const normalizaltUtvonal = alap.endsWith('/api') && utvonal.startsWith('/api/')
    ? utvonal.replace('/api', '')
    : utvonal;

  return `${alap}${normalizaltUtvonal}`;
};