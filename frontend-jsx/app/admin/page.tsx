"use client";
import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import MunkasKezelo from '../../components/munkaskezelo';
import BeosztasKezelo from '../../components/beosztaskezelo';
import ProfilPage from '../../components/adminprofil';
import AdminCard from '@/components/AdminCard';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [keresek, setKeresek] = useState<FelujitasKeres[]>([]);
  const [feladatok, setFeladatok] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [munkasok, setMunkasok] = useState<any[]>([]);
  const [workerError, setWorkerError] = useState<string>('');
  const [workerLoading, setWorkerLoading] = useState(false);

  const fetchWorkers = async () => {
    setWorkerError('');
    setWorkerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/workers', {
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
      // FONTOS: Az URL-nek egyeznie kell a backenddel (api/admin/requests)
      const response = await fetch('http://localhost:5000/api/admin/requests', {
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
      
      const transformed = data.map((k: FelujitasKeres) => ({
        id: k.FelujitasId,
        helyszin: k.HelyszinCim,
        tipus: k.Leiras || '',
        datum: k.KezdesDatuma ? new Date(k.KezdesDatuma).toLocaleDateString('hu-HU') : 'Függőben'
      }));
      setFeladatok(transformed);
    } catch (error) {
      console.error("Hiba a letöltéskor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (activeTab === 'kerelmek' || activeTab === 'beosztas') fetchKeresek();
  if (activeTab === 'munkasok' || activeTab === 'beosztas') fetchWorkers();
}, [activeTab]);

  return (
    <main className={styles.adminWrapper}>
      <aside className={styles.sidebar}> 
        <h3>Admin Menü</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className={`${styles.navBtn} ${activeTab === 'dashboard' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('dashboard')}>🏠 Profil</button>
          <button className={`${styles.navBtn} ${activeTab === 'beosztas' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('beosztas')}>📅 Beosztás</button>
          <button className={`${styles.navBtn} ${activeTab === 'munkasok' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('munkasok')}>👷 Munkások</button>
          <button className={`${styles.navBtn} ${activeTab === 'kerelmek' ? styles.activeBtn : ''}`} onClick={() => setActiveTab('kerelmek')}>🛠️ Kérelmek</button>
        </div>
      </aside>

      <section className={styles.content}>
        {activeTab === 'dashboard' && <ProfilPage />}
        {activeTab === 'beosztas' && <BeosztasKezelo />}
        {activeTab === 'munkasok' && (
          <section>
            {workerLoading && <p>Betöltés...</p>}
            {workerError && <p style={{ color: 'red' }}>{workerError}</p>}
            <MunkasKezelo munkasok={munkasok} setMunkasok={setMunkasok} />
          </section>
        )}
        {activeTab === 'kerelmek' && (
          <section>
            <h1 className="mb-4">Beérkező felújítási kérelmek</h1>
            {loading ? <p>Betöltés...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {keresek.length > 0 ? keresek.map((k) => <AdminCard key={k.FelujitasId} keres={k} />) : <p>Nincs megjeleníthető kérelem.</p>}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}