"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_UTAK, OLDAL_UTAK, apiVegpont } from '@/lib/utvonalak';
import styles from '@/app/admin/admin.module.css';

type AdminProfileData = {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type AdminProfileFormData = {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
};

export default function AdminProfil() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<AdminProfileData>({ id: null, name: '', email: '', phone: '', role: '' });
  const [formData, setFormData] = useState<AdminProfileFormData>({ name: '', email: '', phone: '', currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(apiVegpont(API_UTAK.azonositas.profilom), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push(OLDAL_UTAK.bejelentkezes);
          return;
        }
        if (res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          router.push(OLDAL_UTAK.bejelentkezes);
          return;
        }
        if (!res.ok) {
          const text = await res.text();
          console.error('admin profil fetch hiba:', res.status, text);
          throw new Error('Profil lekérdezési hiba');
        }
        const data = await res.json();
        setUser({ id: data.id ?? null, name: data.name || '', email: data.email || '', phone: data.phone || '', role: data.role || '' });
        setFormData({ name: data.name || '', email: data.email || '', phone: data.phone || '', currentPassword: '', newPassword: '' });
      } catch (err) {
        console.error('admin profil betöltési hiba', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = OLDAL_UTAK.bejelentkezes;
  };

  const handleEditToggle = () => {
    setFormData({ name: user.name, email: user.email, phone: user.phone, currentPassword: '', newPassword: '' });
    setError('');
    setIsEditing(!isEditing);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) { router.push(OLDAL_UTAK.bejelentkezes); return; }
    if (!formData.currentPassword) { setError('Add meg a jelenlegi jelszavad a mentéshez.'); return; }

    try {
      const res = await fetch(apiVegpont(API_UTAK.azonositas.profilom), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Hiba a mentésnél.'); return; }
      setUser((current) => ({ ...current, name: data.name, email: data.email, phone: data.phone }));
      setIsEditing(false);
    } catch (err) {
      console.error('admin mentés hiba', err);
      setError('Szerverhiba során nem sikerült menteni.');
    }
  };

  if (loading) {
    return (
      <section className={styles.loadingCard}>
        <p className={styles.statusText}>Profil betöltése...</p>
      </section>
    );
  }

  return (
    <section className={styles.profileShell}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <span className={styles.sectionEyebrow}>Admin profil</span>
          <h2 className={styles.sectionTitle}>Szia, {user.name || 'Admin'}!</h2>
          <p className={styles.sectionDescription}>A saját adataid szerkesztése és a hozzáférésedhez tartozó beállítások innen érhetők el.</p>
        </div>
      </div>

      <div className={styles.profileCard}>
        {!isEditing ? (
          <>
            <div className={styles.profileHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionEyebrow}>Áttekintés</span>
                <h3 className={styles.sectionTitle}>Személyes adatok</h3>
              </div>
              <div className={styles.buttonRow}>
                <button className={styles.dangerAction} onClick={handleLogout}>Kijelentkezés</button>
                <button className={styles.primaryAction} onClick={handleEditToggle}>Szerkesztés</button>
              </div>
            </div>
            <div className={styles.profileBody}>
              <div className={styles.profileGrid}>
                <div className={styles.profileItem}><span className={styles.profileLabel}>Teljes név</span><strong className={styles.profileValue}>{user.name || 'Nincs megadva'}</strong></div>
                <div className={styles.profileItem}><span className={styles.profileLabel}>E-mail</span><strong className={styles.profileValue}>{user.email || 'Nincs megadva'}</strong></div>
                <div className={styles.profileItem}><span className={styles.profileLabel}>Telefon</span><strong className={styles.profileValue}>{user.phone || 'Nincs megadva'}</strong></div>
                <div className={styles.profileItem}><span className={styles.profileLabel}>Jogosultság</span><strong className={styles.profileValue}>{user.role || 'admin'}</strong></div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.profileHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionEyebrow}>Szerkesztés</span>
                <h3 className={styles.sectionTitle}>Adatok módosítása</h3>
              </div>
            </div>
            <div className={styles.profileBody}>
              {error && <p className={styles.errorText}>{error}</p>}
              <form onSubmit={handleSave} className={styles.formGrid}>
                <label className={styles.formField}>
                  <span className={styles.profileLabel}>Név</span>
                  <input type="text" className={styles.textInput} value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} />
                </label>
                <label className={styles.formField}>
                  <span className={styles.profileLabel}>E-mail</span>
                  <input type="email" className={styles.textInput} value={formData.email} onChange={(e)=>setFormData({...formData,email:e.target.value})} />
                </label>
                <label className={styles.formField}>
                  <span className={styles.profileLabel}>Telefon</span>
                  <input type="tel" className={styles.textInput} value={formData.phone} onChange={(e)=>setFormData({...formData,phone:e.target.value})} />
                </label>
                <label className={styles.formField}>
                  <span className={styles.profileLabel}>Jelenlegi jelszó</span>
                  <input type="password" className={styles.textInput} value={formData.currentPassword} onChange={(e)=>setFormData({...formData,currentPassword:e.target.value})} required />
                </label>
                <label className={styles.formField}>
                  <span className={styles.profileLabel}>Új jelszó</span>
                  <input type="password" className={styles.textInput} value={formData.newPassword} onChange={(e)=>setFormData({...formData,newPassword:e.target.value})} />
                </label>
                <div className={styles.buttonRow}>
                  <button type="button" className={styles.secondaryAction} onClick={handleEditToggle}>Mégse</button>
                  <button type="submit" className={styles.primaryAction}>Mentés</button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
}