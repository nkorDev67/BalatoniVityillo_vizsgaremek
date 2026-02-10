"use client";
import { useState } from 'react';
import styles from '../admin.module.css';

interface Munkas {
  id: number;
  nev: string;
  email: string;
  szak: string;
}

export default function BeosztasKezelo({ munkasok }: { munkasok: Munkas[] }) {
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
          {/* Példa sor */}
          <tr className={styles.taskRow}>
            <td className={styles.taskCell}>Budapest, Váci út 12.</td>
            <td className={styles.taskCell}><b>Festés</b> (40 m²)</td>
            <td className={styles.taskCell}>2024.06.15.</td>
            <td className={styles.taskCell}>
              {/* Egy kis görgethető doboz a munkásoknak */}
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
                      id={`m-${m.id}`}
                      checked={kiosztasok[0]?.includes(m.id) || false}
                      onChange={() => handleMunkasValtoztatas(0, m.id)}
                    />
                    <label htmlFor={`m-${m.id}`}>{m.nev} ({m.szak})</label>
                  </div>
                ))}
              </div>
              <small style={{ color: '#666' }}>
                Kijelölve: {kiosztasok[0]?.length || 0} fő
              </small>
            </td>
            <td className={styles.taskCell}>
              <span className={`${styles.statusBadge} ${
                (kiosztasok[0]?.length || 0) > 0 ? styles.statusAssigned : styles.statusMissing
              }`}>
                {(kiosztasok[0]?.length || 0) > 0 ? "Beosztva" : "Kiosztásra vár"}
              </span>
            </td>
          </tr>
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