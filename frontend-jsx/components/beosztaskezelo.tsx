"use client";
import { useEffect, useState } from 'react';
import styles from '../app/admin/admin.module.css';
import { API_UTAK, apiVegpont } from '@/lib/utvonalak';

interface Munkas {
  id: number;
  nev: string;
  email: string;
  szak?: string;
}

interface Feladat {
  id: number;
  helyszin: string;
  tipus: string;
  datum: string;
}

export default function BeosztasKezelo() {
  const [munkasok, setMunkasok] = useState<Munkas[]>([]);
  const [feladatok, setFeladatok] = useState<Feladat[]>([]);
  const [kiosztasok, setKiosztasok] = useState<{ [key: number]: number[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // 1. Lekérjük a szakembereket a checkboxokhoz
        const mRes = await fetch(apiVegpont(API_UTAK.adminisztracio.munkasok), { headers });
        const munkasAdatok = await mRes.json();
        setMunkasok(munkasAdatok);

        // 2. Lekérjük a feladatokat (amikben már ott vannak a mentett beosztások is)
        const fRes = await fetch(apiVegpont(API_UTAK.adminisztracio.feladatokKiosztashoz), { headers });
        const feladatAdatok = await fRes.json();
        setFeladatok(feladatAdatok);

        // 3. Összerakjuk a "kiosztasok" state-et a mentett adatok alapján
        const kezdetiKiosztasok: { [key: number]: number[] } = {};

        feladatAdatok.forEach((f: any) => {
          // Csak akkor adjuk hozzá, ha van mentett munkás és az egy tömb
          if (f.mentettMunkasok && Array.isArray(f.mentettMunkasok)) {
            kezdetiKiosztasok[f.id] = f.mentettMunkasok;
          } else {
            // Ha nincs semmi, legyen egy üres tömb, hogy ne legyen undefined hiba
            kezdetiKiosztasok[f.id] = [];
          }
        });

        // 4. Frissítjük a state-et, így a checkboxok "be fognak ugrani" a helyükre
        setKiosztasok(kezdetiKiosztasok);

      } catch (err) {
        console.error("Hiba az adatok betöltésekor:", err);
      }
    };

    fetchData();
  }, []);

  const handleMunkasValtoztatas = (feladatIndex: number, munkasId: number) => {
    setKiosztasok(prev => {
      const aktualisMunkasok = prev[feladatIndex] || [];
      if (aktualisMunkasok.includes(munkasId)) {
        // Ha már benne van, kikerül (uncheck)
        return { ...prev, [feladatIndex]: aktualisMunkasok.filter(id => id !== munkasId) };
      } else {
        // Ha nincs benne, bekerül (check)
        return { ...prev, [feladatIndex]: [...aktualisMunkasok, munkasId] };
      }
    });
  };

  const handleMentes = async () => {
  const token = localStorage.getItem('token');
  
  if (Object.keys(kiosztasok).length === 0) {
    alert("Nincs kijelölve semmilyen beosztás!");
    return;
  }

  try {
    const res = await fetch(apiVegpont(API_UTAK.adminisztracio.beosztasokMentese), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ kiosztasok })
    });

    if (res.ok) {
      alert("Sikeres mentés!");
    } else {
      alert("Hiba történt a mentés során.");
    }
  } catch (err) {
    console.error("Hiba:", err);
    alert("Nem érhető el a szerver.");
  }
};

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <span className={styles.sectionEyebrow}>Napi tervezés</span>
          <h2 className={styles.sectionTitle}>Beosztások készítése</h2>
          <p className={styles.sectionDescription}>Minden jóváhagyott feladathoz több szakember is rendelhető, a kijelölések pedig egyben menthetők.</p>
        </div>
      </div>
      
      <div className={styles.tableWrap}>
      <table className={styles.beosztasTable}>
        <thead>
          <tr>
            <th className={styles.taskCell}>Helyszín / Lakás</th>
            <th className={styles.taskCell}>Munka Típusa</th>
            <th className={styles.taskCell}>Dátum</th>
            <th className={styles.taskCell}>Szakemberek (több is választható)</th>
            <th className={styles.taskCell}>Állapot</th>
          </tr>
        </thead>
        <tbody>
          {feladatok.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                Nincsenek beosztandó feladatok.
              </td>
            </tr>
          )}
          {feladatok.map((feladat, fi) => (
            <tr key={feladat.id || fi} className={styles.taskRow}>
              <td className={styles.taskCell}>{feladat.helyszin}</td>
              <td className={styles.taskCell}>{feladat.tipus}</td>
              <td className={styles.taskCell}>
              {feladat.datum && feladat.datum !== 'Függőben' 
                ? new Date(feladat.datum).toLocaleDateString('hu-HU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })
                : 'Nincs megadva'}
            </td>
              <td className={styles.taskCell}>
                <div className={styles.checkboxList}>
                  {munkasok.map(m => (
                    <div key={m.id} className={styles.checkboxRow}>
                      <input 
                        type="checkbox" 
                        id={`m-${feladat.id}-${m.id}`}
                        checked={kiosztasok[feladat.id]?.includes(m.id) || false}
                        onChange={() => handleMunkasValtoztatas(feladat.id, m.id)}
                      />
                      <label htmlFor={`m-${feladat.id}-${m.id}`}>{m.nev} {m.szak ? `(${m.szak})` : ''}</label>
                    </div>
                  ))}
                </div>
                <small className={styles.selectionNote}>
                  Kijelölve: {kiosztasok[feladat.id]?.length || 0} fő
                </small>
              </td>
              <td className={styles.taskCell}>
                <span className={`${styles.statusBadge} ${
                  (kiosztasok[feladat.id]?.length || 0) > 0 ? styles.statusAssigned : styles.statusMissing
                }`}>
                  {(kiosztasok[feladat.id]?.length || 0) > 0 ? "Beosztva" : "Kiosztásra vár"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      <div className={styles.buttonRow}>
       <button className={styles.primaryAction} onClick={handleMentes}>
        Beosztások Mentése
      </button>
      </div>
    </div>
  );
}