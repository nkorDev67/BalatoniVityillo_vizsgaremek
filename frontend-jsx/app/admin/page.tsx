"use client";
import { act, useEffect, useState } from 'react';
import styles from './admin.module.css';
import MunkasKezelo from '../../components/munkaskezelo';
import BeosztasKezelo from '../../components/beosztaskezelo';
import ProfilPage from '../../components/adminprofil';
import AdminCard from '@/components/AdminCard';
import FelujitasKeresePage from '../felujitaskeres/page';

interface FelujitasKeres {
  FelujitasId: number;
  HelyszinCim: string;
  Leiras: string;
  Statusz: string;
  UgyfelNeve: string;
  LetrehozasDatuma: string;
}

export default function AdminPage() {
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [keresek, setKeresek] = useState<FelujitasKeres[]>([]);
  const [feladatok, setFeladatok] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [munkasok, setMunkasok] = useState<any[]>([]);
  const [workerError, setWorkerError] = useState<string>('');
  const [workerLoading, setWorkerLoading] = useState(false);

  // lekéri az adatbázisból azokat a felhasználókat, akik "szakember" szerepkörrel rendelkeznek
  const fetchWorkers = async () => {
    setWorkerError('');
    setWorkerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/workers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Admin jogosultság szükséges.');
        }
        const text = await response.text();
        throw new Error(text || 'Nem sikerült a munkások lekérése');
      }
      const data = await response.json();
      console.log('munkások backendről:', data);
      // biztonsági szűrés még egyszer: csak azok szerepeljenek, akik jogosultsága szakember
      const szakemberek = data.filter((m: any) => m.jogosultsag === 'szakember');
      setMunkasok(szakemberek);
    } catch (err: any) {
      console.error('fetchWorkers hiba:', err);
      setWorkerError(err.message || 'Ismeretlen hiba');
    } finally {
      setWorkerLoading(false);
    }
  };
  
  const fetchKeresek = async () => {
    setLoading(true);
    try{
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/admin/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setKeresek(data);
      // alakítsuk át egyszerűbb beosztási objektummá
      const transformed = data.map((k: FelujitasKeres) => ({
        id: k.FelujitasId,
        helyszin: k.HelyszinCim,
        tipus: k.Leiras || '',
        datum: k.LetrehozasDatuma ? new Date(k.LetrehozasDatuma).toLocaleDateString() : ''
      }));
      setFeladatok(transformed);
  } finally{
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab == 'kerelmek'){
      fetchKeresek();
    }
    if (activeTab === 'munkasok') {
      fetchWorkers();
    }
  }, [activeTab])

}


  return (
    <main className={styles.adminWrapper}>

      <aside className={styles.sidebar}> 
          <h3>Admin Menü</h3>
        <div className="profile-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className={` ${styles.navBtn} ${activeTab === 'dashboard' ? styles.activeBtn : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >🏠 Profil</button>
          
          <button 
            className={` ${styles.navBtn} ${activeTab === 'beosztas' ? styles.activeBtn : ''}`} 
            onClick={() => setActiveTab('beosztas')}
          >📅 Beosztás készítő</button>
          
          <button 
            className={` ${styles.navBtn} ${activeTab === 'munkasok' ? styles.activeBtn : ''}`} 
            onClick={() => setActiveTab('munkasok')}
          >👷 Munkás kezelő</button>
          
          <button 
            className={` ${styles.navBtn} ${activeTab === 'kerelmek' ? styles.activeBtn : ''}`} 
            onClick={() => setActiveTab('kerelmek')}
          >🛠️ Felújítás kérelmek</button>
        </div>
      </aside>

      <section className={styles.content}>
        
        {activeTab === 'dashboard' && (
          <ProfilPage />
        )}

        {activeTab === 'beosztas' && (
          <BeosztasKezelo munkasok={munkasok} feladatok={feladatok} />
        )}

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
            
            {loading ? (
              <p>Betöltés...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {keresek.length > 0 ? (
                  keresek.map((keres) => (
                    <AdminCard key={keres.FelujitasId} keres={keres} />
                  ))
                ) : (
                  <p>Nincs megjeleníthető kérelem.</p>
                )}
              </div>
            )}
          </section>
        )}

      
      </section>

     
    </main>
  );
}