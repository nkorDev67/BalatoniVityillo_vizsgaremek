"use client";
import { useState } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ujEmail, setUjEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [munkasok, setMunkasok] = useState([
    { id: 1, nev: "Kovács Elek", email: "elek@vityillo.hu", telefonszam: "123-456-7890" },
    { id: 2, nev: "Szabó János", email: "janos@vityillo.hu", telefonszam: "098-765-4321" },
    { id: 3, nev: "Nagy Lajos", email: "lajos@vityillo.hu", telefonszam: "555-123-4567" },
    { id: 4, nev: "Kiss Pál", email: "pal@vityillo.hu", telefonszam: "987-654-3210" },
    { id: 5, nev: "Horváth Béla", email: "bela@vityillo.hu", telefonszam: "111-222-3333" },
    { id: 6, nev: "Tóth Gábor", email: "gabor@vityillo.hu", telefonszam: "444-555-6666" },
    { id: 7, nev: "Varga Péter", email: "peter@vityillo.hu", telefonszam: "777-888-9999" },
    { id: 8, nev: "Molnár Tamás", email: "tamas@vityillo.hu", telefonszam: "333-444-5555" },
    { id: 9, nev: "Lukács András", email: "andras@vityillo.hu", telefonszam: "222-333-4444" },
  ]);
  const handleKirugas = (id: number) => {
    if(confirm("Biztosan törölni szeretnéd ezt a munkást?")) {
      setMunkasok(munkasok.filter(munkas => munkas.id !== id));
    }
  };
  const handleFelvetel = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Új munkás hozzáadva: ${ujEmail}`);
    setUjEmail("");
    setIsModalOpen(false);
  };

  return (
    <main className={styles.adminWrapper}>

      <aside className={styles.sidebar}> 
          <h3>Admin Menü</h3>
        <div className="profile-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className={` ${styles.navBtn} ${activeTab === 'dashboard' ? styles.activeBtn : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >🏠 Vezérlőpult</button>
          
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
          <section>
            <h1>Vezérlőpult</h1>
            <div className="profile-card"><div className="profile-body">Itt vannak a statisztikák...</div></div>
          </section>
        )}

        {activeTab === 'beosztas' && (
          <div>
          <h1>Napi Beosztások Készítése</h1>
    
      <table className={styles.beosztasTable}>
      <thead>
        <tr style={{textAlign: 'left', color: '#1d0909', fontSize: '14px'}}>
          <th className={styles.taskCell}>Helyszín / Lakás</th>
          <th className={styles.taskCell}>Munka Típusa</th>
          <th className={styles.taskCell}>Dátum</th>
          <th className={styles.taskCell}>Szakember Hozzárendelése</th>
          <th className={styles.taskCell}>Állapot</th>
        </tr>
      </thead>
      <tbody>
        {/* Első példa: Nincs még beosztva senki */}
        <tr className={styles.taskRow}>
          <td className={styles.taskCell}>Budapest, Váci út 12.</td>
          <td className={styles.taskCell}><b>Festés</b> (40 m²)</td>
          <td className={styles.taskCell}>2024.06.15.</td>
          <td className={styles.taskCell}>
            <select className="adasokmezo" style={{margin: 0, width: '100%'}}>
              <option>Válassz munkást...</option>
              {munkasok.map(m => (
                <option key={m.id}>{m.nev} ({m.email})</option> 
                /* Itt látszik a név és a telefon amit a szakma helyére írtál */
              ))}
            </select>
          </td>
          <td className={styles.taskCell}>
            <span className={`${styles.statusBadge} ${styles.statusMissing}`}>Kiosztásra vár</span>
          </td>
        </tr>

        {/* Második példa: Már be van osztva */}
        <tr className={styles.taskRow}>
          <td className={styles.taskCell}>Siófok, Balaton u. 4.</td>
          <td className={styles.taskCell}><b>Burkolás</b> (15 m²)</td>
          <td className={styles.taskCell}>2024.06.16.</td>
          <td className={styles.taskCell}>
             <select className="adasokmezo" style={{margin: 0, width: '100%', borderColor: '#55efc4'}}>
               <option>Szabó Béla (+3630123...)</option>
             </select>
          </td>
          <td className={styles.taskCell}>
            <span className={`${styles.statusBadge} ${styles.statusAssigned}`}>Beosztva</span>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div style={{marginTop: '20px', textAlign: 'right'}}>
      <button className="btn-save">Beosztások Mentése</button>
    </div>
  </div>
        )}

        {activeTab === 'munkasok' && (
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
  )}

  {activeTab === 'kerelmek' && (
          <section>
            <h1>Beérkező kérelmek</h1>
            <div className="profile-card">
              <div className="profile-body">
                <p>Ügyfelek felújítási kérései (Felujitas tábla)</p>
              </div>
            </div>
          </section>
        )}

      
      </section>

     
    </main>
  );
}