"use client";
import { useState } from "react";
import styles from '../app/admin/admin.module.css';

interface Munkas {
  id: number;
  nev: string;
  email: string;
  telefonszam: string;
  szak: string
}

interface Props {
  munkasok: Munkas[];
  setMunkasok: React.Dispatch<React.SetStateAction<Munkas[]>>;
}

export default function MunkasKezelo({ munkasok, setMunkasok }: Props) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ujEmail, setUjEmail] = useState("");
  const [ujSzakma, setUjSzakma] = useState("Festő");

  const handleKirugas = (id: number) => {
    if (confirm("Biztosan törölni szeretnéd ezt a munkást?")) {
      setMunkasok(munkasok.filter(m => m.id !== id));
    }
  };

  const handleFelvetel = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Új munkás hozzáadva: ${ujEmail}`);
    // Ide jön majd később a backend hívás!
    setUjEmail("");
    setIsModalOpen(false);
  };

  return(
    <div>
            <div className={styles.workerHeader}>
              <h1>Munkások kezelése</h1>
              
             
            </div>
            <div className={styles.workerListContainer}>
              <div className={styles.listHeader}>
                <div>Név</div>
                <div>Email</div>
                <div>Telefonszám</div>
              </div>
              <div className={styles.scrollArea}>
                {munkasok.map(munkas => (
                  <div key={munkas.id} className={styles.workerRow}>
                    <div>{munkas.nev}</div>
                    <div>{munkas.email}</div>
                    <div>{munkas.telefonszam}</div>
                    <button onClick={() => handleKirugas(munkas.id)} className={styles.fireBtn}>Kirúgás</button>
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
                    />
                    <div style={{ marginBottom: '15px' }}>
          <label htmlFor="szakma" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Munkás szakmája:
          </label>
          <select 
            id="szakma"
            value={ujSzakma} 
            onChange={(e) => setUjSzakma(e.target.value)}
            className={styles.modalSelect} // Adj neki stílust a CSS-ben!
            style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
          >
            <option value="Festő">Festő</option>
            <option value="Burkoló">Burkoló</option>
            <option value="Vízvezetékszerelő">Vízvezetékszerelő</option>
            <option value="Villanyszerelő">Villanyszerelő</option>
            <option value="Általános segéd">Általános segéd</option>
          </select>
        </div>
                   <div>
                    <button type="submit" className={styles.saveBtn}>Munkás hozzáadása</button>
                   </div>
                   <div>
                     <button type='button' onClick={() => setIsModalOpen(false)}>Mégse</button>
                   </div>
                    
                  </form>
                 
                </div>
 
              </div> 
      )}
    </div>
  );
}
   