"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditToggle = () => {
    setFormData({ ...user, currentPassword: '', newPassword: '' });
    setError('');
    setIsEditing(!isEditing);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!formData.currentPassword) {
      setError('A mentéshez add meg a jelenlegi jelszavad.');
      return;
    }

    setSaving(true);
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = rawUrl.replace(/\/?$/, '');
      const apiEndpoint = baseUrl.endsWith('/api') ? `${baseUrl}/auth/me` : `${baseUrl}/api/auth/me`;
      const res = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Hiba történt a mentés során.');
        return;
      }

      setUser({ name: data.name, email: data.email, phone: data.phone });
      setIsEditing(false);
      setFormData({ ...formData, currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error('Mentés hiba:', err);
      setError('Szerverhiba: nem sikerült menteni.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = rawUrl.replace(/\/?$/, ''); // trim trailing slash
      const apiEndpoint = baseUrl.endsWith('/api') ? `${baseUrl}/auth/me` : `${baseUrl}/api/auth/me`;
      console.log('DEBUG API URL:', rawUrl, '-> using endpoint', apiEndpoint);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(apiEndpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          console.error('Profil fetch hiba:', res.status, text);
          throw new Error('Nem sikerült a profil lekérdezése');
        }

        const data = await res.json();
        setUser({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
        setFormData({ name: data.name || '', email: data.email || '', phone: data.phone || '', currentPassword: '', newPassword: '' });
      } catch (err) {
        console.error('Profil betöltési hiba:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <main className="main-wrapper" style={{ paddingTop: '100px' }}>
      <h1>Üdv, {user.name}!</h1>

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
                  <div className="info-label">Jelenlegi jelszó:</div>
                  <input 
                    type="password" 
                    className="adasokmezo" 
                    value={formData.currentPassword} 
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    required
                  />
                </div>

                <div className="info-row">
                  <div className="info-label">Új jelszó (opcionális):</div>
                  <input 
                    type="password" 
                    className="adasokmezo" 
                    value={formData.newPassword} 
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
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

        {/* JOBB OLDAL: STATISZTIKA (szintén dummy adatokkal) */}
        <div className="profile-card stat-card">
          <div className="profile-header">
            <h4>Aktivitás</h4>
          </div>
          <div className="profile-body">
            <ul className="stat-list">
              <li className="stat-item">
                <span>Aktív Felújítások</span>
                <span className="stat-badge">2</span>
              </li>
              <li className="stat-item">
                <span>Leadott hirdetések</span>
                <span className="stat-badge">1</span>
              </li>
             
            </ul>
          </div>
        </div>

      </div>
    </main>
  );
}