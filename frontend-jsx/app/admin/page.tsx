"use client";
import { useState } from 'react';

export default function AdminDashboard() {
  // Ez dönti el, mit lássunk éppen: 'dashboard', 'munkasok', 'beosztas', 'kerelmek'
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <main className="main-wrapper" style={{ paddingTop: '80px', display: 'flex', minHeight: '100vh' }}>
      
      {/* SIDEBAR - Most már funkcióval! */}
      <aside className="profile-card" style={{ width: '100px', height: 'calc(100vh - 100px)', position: 'sticky', top: '90px'}}> 
        <div className="profile-header">
          <h4 className="mb-0">Admin Menü</h4>
        </div>
        <div className="profile-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className={`card button w-100 ${activeTab === 'dashboard' ? 'active-btn' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >🏠 Vezérlőpult</button>
          
          <button 
            className={`card button w-100 ${activeTab === 'beosztas' ? 'active-btn' : ''}`} 
            onClick={() => setActiveTab('beosztas')}
          >📅 Beosztás készítő</button>
          
          <button 
            className={`card button w-100 ${activeTab === 'munkasok' ? 'active-btn' : ''}`} 
            onClick={() => setActiveTab('munkasok')}
          >👷 Munkás kezelő</button>
          
          <button 
            className={`card button w-100 ${activeTab === 'kerelmek' ? 'active-btn' : ''}`} 
            onClick={() => setActiveTab('kerelmek')}
          >🛠️ Felújítás kérelmek</button>
        </div>
      </aside>

      {/* DINAMIKUS TARTALOM - Itt cserélődnek a modulok */}
      <div style={{ flex: 1, paddingRight: '20px' }}>
        
        {activeTab === 'dashboard' && (
          <section>
            <h1>Vezérlőpult</h1>
            <div className="profile-card"><div className="profile-body">Itt vannak a statisztikák...</div></div>
          </section>
        )}

        {activeTab === 'beosztas' && (
          <section>
            <h1>Beosztás készítése</h1>
            <div className="profile-card">
              <div className="profile-body">
                <p>Itt tudsz szakembert rendelni a lakásokhoz (MunkaKiosztas tábla)</p>
                {/* Itt jöhet egy form a kiosztáshoz */}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'munkasok' && (
          <section>
            <h1>Munkások kezelése</h1>
            <div className="profile-card">
              <div className="profile-body">
                <p>Szakemberek listája (Szakember tábla)</p>
                {/* Itt jöhet a munkások hozzáadása/törlése */}
              </div>
            </div>
          </section>
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

      </div>

      <style jsx>{`
        .active-btn {
          background-color: #d4a574 !important;
          color: white;
          font-weight: bold;
        }
      `}</style>
    </main>
  );
}