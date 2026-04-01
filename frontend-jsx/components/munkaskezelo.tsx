"use client";
import { useState } from "react";
import styles from '../app/admin/admin.module.css';
import { API_UTAK, apiVegpont } from '@/lib/utvonalak';

interface Munkas {
  id: number;
  felhasznaloId?: number;
  nev: string;
  email: string;
  telefonszam: string;
  szak?: string;
  jogosultsag?: string;
}

interface Props {
  munkasok: Munkas[];
  setMunkasok: React.Dispatch<React.SetStateAction<Munkas[]>>;
}

export default function MunkasKezelo({ munkasok, setMunkasok }: Props) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ujEmail, setUjEmail] = useState("");
  const [ujSzakma, setUjSzakma] = useState("Festő");

  const handleKirugas = async (munkas: Munkas) => {
    if (!confirm("Biztosan törölni / visszafokozni szeretnéd ezt a munkást?")) return;

    try {
      const token = localStorage.getItem('token');
      const torlesId = munkas.felhasznaloId ?? munkas.id;
      const resp = await fetch(apiVegpont(API_UTAK.adminisztracio.munkas(torlesId)), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.message || errData?.error || 'A szerver nem válaszolt rendesen');
      }

      setMunkasok(prev => prev.filter(item => item.id !== munkas.id));
    } catch (err: any) {
      console.error('kirúgás hiba:', err);
      alert('Nem sikerült törölni a munkást: ' + (err.message || 'ismeretlen hiba'));
    }
  };

  const handleFelvetel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiVegpont(API_UTAK.adminisztracio.munkasok), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: ujEmail, szak: ujSzakma }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Hiba történt a munkás felvételekor');
      }
      const uj = await response.json();
      // frissítsük a lista állapotát (szakemberként kell megjelenni)
      if (uj.jogosultsag === 'szakember') {
        setMunkasok(prev => [...prev, uj]);
      }
      setUjEmail("");
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Nem sikerült felvenni a munkást: ' + err.message);
      console.error(err);
    }
  };

  return(
    <div>
            <div className={styles.workerHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionEyebrow}>Szakemberek</span>
                <h2 className={styles.sectionTitle}>Munkások kezelése</h2>
                <p className={styles.sectionDescription}>A listában csak a szakember jogosultságú munkatársak jelennek meg.</p>
              </div>
            </div>
            <div className={styles.workerListContainer}>
              <div className={styles.listHeader}>
                <div>Név</div>
                <div>Email</div>
                <div>Telefonszám</div>
                <div>Szakma</div>
              </div>
              <div className={styles.scrollArea}>
                {munkasok
                  .filter(m => m.jogosultsag === 'szakember')
                  .map(munkas => (
                    <div key={munkas.id} className={styles.workerRow}>
                      <div>{munkas.nev}</div>
                      <div>{munkas.email}</div>
                      <div>{munkas.telefonszam}</div>
                      <div>{munkas.szak || '-'}</div>
                      <button onClick={() => handleKirugas(munkas)} className={styles.fireBtn}>Kirúgás</button>
                    </div>
                  ))}
              </div>

            </div>
            
            <div className={styles.addBtnContainer}>
             <button className={styles.openModalBtn} onClick={() => setIsModalOpen(true)}>Munkás hozzáadása</button>   
            </div>
            {isModalOpen && (
              <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h2>Új munkás felvétele</h2>
                    <p>Add meg az új munkás adatait!</p>
                  </div>
                  <form onSubmit={handleFelvetel}>
                    <input
                      type="email"
                      placeholder="Email cím"
                      value={ujEmail}
                      onChange={(e) => setUjEmail(e.target.value)}
                      required
                      className={styles.textInput}
                    />
                    <div className={styles.formField}>
                      <label htmlFor="szakma" className={styles.profileLabel}>Munkás szakmája</label>
                      <select 
                        id="szakma"
                        value={ujSzakma} 
                        onChange={(e) => setUjSzakma(e.target.value)}
                        className={styles.modalSelect}
                      >
                        <option value="Festő">Festő</option>
                        <option value="Burkoló">Burkoló</option>
                        <option value="Vízvezetékszerelő">Vízvezetékszerelő</option>
                        <option value="Villanyszerelő">Villanyszerelő</option>
                        <option value="Általános segéd">Általános segéd</option>
                      </select>
                    </div>
                    <div className={styles.buttonRow}>
                      <button type="submit" className={styles.primaryAction}>Munkás hozzáadása</button>
                      <button type='button' className={styles.secondaryAction} onClick={() => setIsModalOpen(false)}>Mégse</button>
                    </div>
                    
                  </form>
                 
                </div>
 
              </div> 
      )}
    </div>
  );
}
   