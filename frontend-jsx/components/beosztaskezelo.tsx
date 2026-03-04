"use client";
import { useState } from 'react';
import styles from '../app/admin/admin.module.css';

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

export default function BeosztasKezelo({ munkasok, feladatok = [] }: { munkasok: Munkas[]; feladatok?: Feladat[] }) {
  // Ebben az állapotban tároljuk, hogy melyik feladathoz (index) melyik munkásokat rendeltük hozzá
  const [kiosztasok, setKiosztasok] = useState<{ [key: number]: number[] }>({});

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

  return (
    <div>
      <h1>Napi Beosztások Készítése</h1>
      
      <table className={styles.beosztasTable}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#1d0909', fontSize: '14px' }}>
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
              <td className={styles.taskCell}>{feladat.datum}</td>
              <td className={styles.taskCell}>
                <div style={{ 
                  maxHeight: '100px', 
                  overflowY: 'auto', 
                  border: '1px solid #ccc', 
                  padding: '5px',
                  borderRadius: '4px',
                  background: '#fff'
                }}>
                  {munkasok.map(m => (
                    <div key={m.id} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                <small style={{ color: '#666' }}>
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
      
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button className="btn-save" onClick={() => console.log("Mentendő beosztások:", kiosztasok)}>
          Beosztások Mentése
        </button>
      </div>
    </div>
  );
}