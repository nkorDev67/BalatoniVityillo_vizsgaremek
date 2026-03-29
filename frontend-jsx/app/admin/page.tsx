"use client";
import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import MunkasKezelo from '../../components/munkaskezelo';
import BeosztasKezelo from '../../components/beosztaskezelo';
import ProfilPage from '../../components/adminprofil';
import AdminCard from '@/components/AdminCard';
import { API_UTAK, apiVegpont } from '@/lib/utvonalak';
import { useRouteGuard } from '@/lib/jogosultsagOr';

interface Feladat {
  Tipus: string;
  Terulet: string;
  Ar: number;
}

interface FelujitasKeres {
  FelujitasId: number;
  HelyszinCim: string;
  Leiras: string;
  Statusz: string;
  UgyfelNeve: string;
  KezdesDatuma: string;
  Feladatok?: Feladat[];
}

export default function AdminPage() {
  const { allowed, checking } = useRouteGuard(['admin']);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [keresek, setKeresek] = useState<FelujitasKeres[]>([]);
  const [loading, setLoading] = useState(false);
  const [munkasok, setMunkasok] = useState<any[]>([]);
  const [workerError, setWorkerError] = useState<string>('');
  const [workerLoading, setWorkerLoading] = useState(false);

  const fetchWorkers = async () => {
    setWorkerError('');
    setWorkerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiVegpont(API_UTAK.adminisztracio.munkasok), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Nem sikerült a munkások lekérése');
      const data = await response.json();
      setMunkasok(data.filter((m: any) => m.jogosultsag === 'szakember'));
    } catch (err: any) {
      setWorkerError(err.message);
    } finally {
      setWorkerLoading(false);
    }
  };
  
  const fetchKeresek = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiVegpont(API_UTAK.adminisztracio.kerelmek), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error(`Hiba a kérésben: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('A visszakapott adat nem tömb.');
      }
      setKeresek(data);
    } catch (error) {
      console.error("Hiba a letöltéskor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!allowed) return;
  if (activeTab === 'kerelmek' || activeTab === 'beosztas') fetchKeresek();
  if (activeTab === 'munkasok' || activeTab === 'beosztas') fetchWorkers();
}, [activeTab, allowed]);

  const tabMeta: Record<string, { cim: string; leiras: string }> = {
    dashboard: {
      cim: 'Admin profil',
      leiras: 'Itt kezeled a saját adataidat és az admin hozzáféréshez tartozó alapbeállításokat.',
    },
    beosztas: {
      cim: 'Beosztások',
      leiras: 'A jóváhagyott feladatokhoz itt tudsz szakembereket rendelni és menteni a napi kiosztásokat.',
    },
    munkasok: {
      cim: 'Munkások kezelése',
      leiras: 'Szakemberek felvétele, visszafokozása és a teljes adminisztrációs lista karbantartása egy helyen.',
    },
    kerelmek: {
      cim: 'Felújítási kérelmek',
      leiras: 'Az új igények áttekintése, ütemezése és lezárása ugyanabban az admin nézetben történik.',
    },
  };

  const aktualisTab = tabMeta[activeTab] ?? tabMeta.dashboard;

  if (checking || !allowed) {
    return null;
  }

  return (
    <main className={styles.adminWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sectionEyebrow}>Vezérlőpult</span>
          <h3 className={styles.sidebarTitle}>Admin menü</h3>
          <p className={styles.sidebarSubtitle}>Minden napi ügyintézés és döntés ugyanebben a felületben marad.</p>
        </div>
        <div className={styles.navList}>
          <button className={`${styles.navBtn} ${activeTab === 'dashboard' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('dashboard')}>🏠 Profil</button>
          <button className={`${styles.navBtn} ${activeTab === 'beosztas' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('beosztas')}>📅 Beosztás</button>
          <button className={`${styles.navBtn} ${activeTab === 'munkasok' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('munkasok')}>👷 Munkások</button>
          <button className={`${styles.navBtn} ${activeTab === 'kerelmek' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('kerelmek')}>🛠️ Kérelmek</button>
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <span className={styles.contentEyebrow}>Adminisztráció</span>
          <h1 className={styles.contentTitle}>{aktualisTab.cim}</h1>
          <p className={styles.contentDescription}>{aktualisTab.leiras}</p>
        </div>

        {activeTab === 'dashboard' && <ProfilPage />}
        {activeTab === 'beosztas' && <BeosztasKezelo />}
        {activeTab === 'munkasok' && (
          <section className={styles.sectionCard}>
            {workerLoading && <p className={styles.statusText}>Betöltés...</p>}
            {workerError && <p className={styles.errorText}>{workerError}</p>}
            <MunkasKezelo munkasok={munkasok} setMunkasok={setMunkasok} />
          </section>
        )}
        {activeTab === 'kerelmek' && (
          <section className={styles.sectionCard}>
            {loading ? <p className={styles.statusText}>Betöltés...</p> : (
              <div className={styles.requestGrid}>
                {keresek.length > 0 ? keresek.map((k) => <AdminCard key={k.FelujitasId} keres={k} />) : <p>Nincs megjeleníthető kérelem.</p>}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}