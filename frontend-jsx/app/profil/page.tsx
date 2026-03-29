"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profil.module.css';
import { API_UTAK, OLDAL_UTAK, apiVegpont } from '@/lib/utvonalak';

type ProfileData = {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
};

type RequestItem = {
  FelujitasId: number;
  HelyszinCim: string;
  Leiras: string;
  Statusz: string;
  KezdesDatuma: string | null;
};

type Worker = {
  Felhasznalonev: string;
  Telefonszam: string;
};

export default function ProfilPage() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<ProfileData>({ id: null, name: '', email: '', phone: '', role: '' });
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', email: '', phone: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [myRequests, setMyRequests] = useState<RequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const formattedRequestCount = `${myRequests.length} aktív kérés`;
  const firstName = user.name ? user.name.split(' ')[0] : 'Vendég';

  const handleEditToggle = () => {
    setFormData({ name: user.name, email: user.email, phone: user.phone, currentPassword: '', newPassword: '' });
    setError('');
    setIsEditing(!isEditing);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(OLDAL_UTAK.bejelentkezes);
      return;
    }

    if (!formData.currentPassword) {
      setError('A mentéshez add meg a jelenlegi jelszavad.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(apiVegpont(API_UTAK.azonositas.profilom), {
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

      setUser((current) => ({ ...current, name: data.name, email: data.email, phone: data.phone }));
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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = OLDAL_UTAK.bejelentkezes;
  };

  const handleOpenDetails = async (request: RequestItem) => {
    setSelectedRequest(request);
    setWorkers([]);
    setDetailsLoading(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiVegpont(API_UTAK.felujitas.reszletek(request.FelujitasId)), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.munkasok || []);
      }
    } catch (err) {
      console.error('Hiba történt a részletek lekérdezése során:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) {
      return 'Időpont egyeztetés alatt';
    }

    return new Date(date).toLocaleDateString('hu-HU');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(OLDAL_UTAK.bejelentkezes);
        return;
      }

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
          console.error('Profil fetch hiba:', res.status, text);
          throw new Error('Nem sikerült a profil lekérdezése');
        }

        const data = await res.json();
        setUser({
          id: data.id ?? null,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || ''
        });
        setFormData({ name: data.name || '', email: data.email || '', phone: data.phone || '', currentPassword: '', newPassword: '' });
        setLoadError('');
      } catch (err) {
        console.error('Profil betöltési hiba:', err);
        setLoadError('Nem sikerült betölteni a felhasználói adatokat az adatbázisból.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMyRequests = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(apiVegpont(API_UTAK.felujitas.sajatKeresek), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyRequests(data);
        }
      } catch (err) {
        console.error('Hiba történt a kérések lekérdezése során:', err);
      }
    };

    fetchMyRequests();
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <section className={styles.heroPanel}>
          <p className={styles.loadingState}>Profil betöltése folyamatban...</p>
        </section>
      </main>
    );
  }


  return (
    <main className={styles.pageShell}>
      <section className={styles.heroPanel}>
        <div>
          <span className={styles.eyebrow}>Profilközpont</span>
          <h1 className={styles.pageTitle}>Üdv, {firstName}!</h1>
          <p className={styles.pageSubtitle}>
            Minden adat, felújítási kérelmed és állapotfrissítésed egy egységes, visszafogott felületen jelenik meg.
          </p>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Kérelmek</span>
            <strong>{formattedRequestCount}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Elérési mód</span>
            <strong className={styles.summaryValue}>{user.phone || user.email || 'Nincs megadva'}</strong>
          </div>
        </div>
      </section>

      {loadError ? <p className={styles.errorText}>{loadError}</p> : null}

      <section className={styles.contentGrid}>
        {!isEditing ? (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelLabel}>Profil</span>
                <h2 className={styles.panelTitle}>Személyes adatok</h2>
              </div>
              <div className={styles.actionRow}>
                <button className={styles.secondaryButton} onClick={handleLogout}>Kijelentkezés</button>
                <button className={styles.primaryButton} onClick={handleEditToggle}>Szerkesztés</button>
              </div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Teljes név</div>
                <div className={styles.dataValue}>{user.name || 'Nincs megadva'}</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>E-mail</div>
                <div className={styles.dataValue}>{user.email || 'Nincs megadva'}</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Telefon</div>
                <div className={styles.dataValue}>{user.phone || 'Nincs megadva'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelLabel}>Szerkesztés</span>
                <h2 className={styles.panelTitle}>Adatok módosítása</h2>
              </div>
            </div>
            <div className={styles.panelBody}>
              <form onSubmit={handleSave} className={styles.formStack}>
                <div className={styles.formRow}>
                  <div className={styles.dataLabel}>Név</div>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.dataLabel}>E-mail</div>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.dataLabel}>Telefon</div>
                  <input 
                    type="tel" 
                    className={styles.input} 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.dataLabel}>Jelenlegi jelszó</div>
                  <input 
                    type="password" 
                    className={styles.input} 
                    value={formData.currentPassword} 
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.dataLabel}>Új jelszó</div>
                  <input 
                    type="password" 
                    className={styles.input} 
                    value={formData.newPassword} 
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Ha nem szeretnél jelszót cserélni, hagyd üresen"
                  />
                </div>

                {error ? <p className={styles.errorText}>{error}</p> : null}

                <div className={styles.actionRowEnd}>
                  <button type="button" className={styles.secondaryButton} onClick={handleEditToggle}>Mégse</button>
                  <button type="submit" className={styles.primaryButton} disabled={saving}>
                    {saving ? 'Mentés folyamatban...' : 'Mentés'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`${styles.panel} ${styles.fullWidthPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelLabel}>Kérelmek</span>
              <h2 className={styles.panelTitle}>Felújításaim állapota</h2>
            </div>
            <button onClick={() => router.push('/felujitaskeres')} className={styles.secondaryButton}>Új kérés indítása</button>
          </div>
          <div className={styles.panelBody}>
            {myRequests.length > 0 ? (
              <div className={styles.requestList}>
                {myRequests.map((request) => (
                  <button
                    type="button"
                    key={request.FelujitasId}
                    className={styles.requestItem}
                    onClick={() => handleOpenDetails(request)}
                  >
                    <div className={styles.requestInfo}>
                      <span className={styles.requestLocation}>{request.HelyszinCim}</span>
                      <span className={styles.requestDescription}>{request.Leiras}</span>
                    </div>

                    <div className={styles.requestMeta}>
                      <span className={styles.statusBadge}>{request.Statusz}</span>
                      <small className={styles.requestDate}>{`Kezdés: ${formatDate(request.KezdesDatuma)}`}</small>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Még nem küldtél be felújítási kérelmet.</p>
                <button onClick={() => router.push('/felujitaskeres')} className={styles.primaryButton}>Első kérelmem</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRequest(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedRequest(null)}>×</button>
            
            <h2 className={styles.modalTitle}>Részletek: {selectedRequest.HelyszinCim}</h2>
            
            <div className={styles.modalInfoGrid}>
              <p><strong>Státusz:</strong> <span className={styles.statusBadge}>{selectedRequest.Statusz}</span></p>
              <p><strong>Leírás:</strong> {selectedRequest.Leiras}</p>
              <p><strong>Kezdés:</strong> {formatDate(selectedRequest.KezdesDatuma)}</p>
            </div>

            <hr className={styles.modalDivider} />
            
            <h3 className={styles.modalSubtitle}>Beosztott szakemberek</h3>
            {detailsLoading ? (
              <p className={styles.modalText}>Betöltés...</p>
            ) : workers.length > 0 ? (
              <div className={styles.workerList}>
                {workers.map((m, idx) => (
                  <div key={idx} className={styles.workerDetailCard}>
                    <span className={styles.workerName}>{m.Felhasznalonev}</span>
                    <a href={`tel:${m.Telefonszam}`} className={styles.workerPhone}>{m.Telefonszam}</a>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noWorkersMsg}>
                {selectedRequest.Statusz === 'Függőben' 
                  ? 'Hamarosan beosztjuk a szakembereket.' 
                  : "Nincsenek beosztott munkások."}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
