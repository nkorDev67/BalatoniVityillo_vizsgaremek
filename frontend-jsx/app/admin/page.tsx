"use client";
import { useState } from 'react';
import styles from './admin.module.css';
import MunkasKezelo from './components/munkaskezelo';
import BeosztasKezelo from './components/beosztaskezelo';
import ProfilPage from './components/profil';

export default function AdminPage() {
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const [munkasok, setMunkasok] = useState([
    { id: 1, nev: "Kovács Elek", email: "elek@vityillo.hu", telefonszam: "123-456-7890", szak: "Festő" },
    { id: 2, nev: "Szabó János", email: "janos@vityillo.hu", telefonszam: "098-765-4321", szak: "Burkoló" },
    { id: 3, nev: "Nagy Lajos", email: "lajos@vityillo.hu", telefonszam: "555-123-4567", szak: "Vízvezetékszerelő" },
    { id: 4, nev: "Kiss Pál", email: "pal@vityillo.hu", telefonszam: "987-654-3210", szak: "Villanyszerelő" },
    { id: 5, nev: "Horváth Béla", email: "bela@vityillo.hu", telefonszam: "111-222-3333", szak: "Általános segéd" },
    { id: 6, nev: "Tóth Gábor", email: "gabor@vityillo.hu", telefonszam: "444-555-6666", szak: "Festő" },
    { id: 7, nev: "Varga Péter", email: "peter@vityillo.hu", telefonszam: "777-888-9999", szak: "Festő" },
    { id: 8, nev: "Molnár Tamás", email: "tamas@vityillo.hu", telefonszam: "333-444-5555", szak: "Burkoló" },
    { id: 9, nev: "Lukács András", email: "andras@vityillo.hu", telefonszam: "222-333-4444", szak: "Vízvezetékszerelő" },
  ]);
  

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
          <BeosztasKezelo munkasok={munkasok} />
        )}

        {activeTab === 'munkasok' && (
          <MunkasKezelo munkasok={munkasok} setMunkasok={setMunkasok} />
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