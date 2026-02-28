"use client";

import { useState } from 'react';

export default function ProfilPage() {
  // 1. DUMMY ADATOK - Ezt fogjuk később lecserélni a backendről jövő adatokra
  const dummyUser = {
    name: "Kovács János",
    email: "janos.kovacs@example.com",
    phone: "+36 30 123 4567",
    password: "CSimicsanga67"
  };

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(dummyUser);
  const [formData, setFormData] = useState(dummyUser);

  const handleLogout = () => {
      localStorage.clear();
      window.location.href = "/login";
    }
  
  const handleEditToggle = () => {
    setFormData(user);
    setIsEditing(!isEditing);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(formData);
    setIsEditing(false);
    console.log("Mentés a dummy adatbázisba:", formData);
  };

  return (
    <main className="main-wrapper" style={{ paddingTop: '100px' }}>
      <h1>Szia Admin!</h1>

      <div className="profile-container">
        
        {/* BAL OLDAL: PROFIL VAGY SZERKESZTÉS */}
        {!isEditing ? (
          <div className="profile-card">
            <div className="profile-header">
              <h3>Személyes adatok</h3>
              <button className="btn-logout" onClick={handleLogout}>Kijelentkezés</button>

              <button className="btn-edit" onClick={handleEditToggle}>Szerkesztés</button>
              
            </div>
            <div className="profile-body">
              
              <div className="info-row">
                <div className="info-label">Teljes név:</div>
                <div className="info-value">{user.name}</div>
              </div>
              <div className="info-row">
                <div className="info-label">E-mail:</div>
                <div className="info-value">{user.email}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Telefon:</div>
                <div className="info-value">{user.phone}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-card">
            <div className="profile-header">
              <h3>Adatok módosítása</h3>
            </div>
            <div className="profile-body">
              <form onSubmit={handleSave}>
                <div className="info-row">
                  <div className="info-label">Név:</div>
                  <input 
                    type="text" 
                    className="adasokmezo" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="info-row">
                  <div className="info-label">E-mail:</div>
                  <input 
                    type="email" 
                    className="adasokmezo" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                 <div className="info-row">
                  <div className="info-label">Jelszó:</div>
                  <input 
                    type="password" 
                    className="adasokmezo" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn-cancel" onClick={handleEditToggle}>Mégse</button>
                  <button type="submit" className="btn-save">Mentés</button>
                </div>
              </form>
            </div>
          </div>

 
        )}
        </div>
    </main>
    )};