"use client"; // Ez kell, mert van benne interakció (állapotkezelés)

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function BeosztasPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ nev: string; szerepkor: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const baseUrl = rawUrl.replace(/\/?$/, '');

        // Felhasználó adatok lekérése
        const userEndpoint = baseUrl.endsWith('/api') ? `${baseUrl}/auth/me` : `${baseUrl}/api/auth/me`;
        const userRes = await fetch(userEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser({
            nev: userData.name,
            szerepkor: userData.role
          });
        } else {
          setError('Hiba történt a felhasználói adatok betöltésekor.');
          setLoading(false);
          return;
        }

        // Beosztások lekérése: csak a bejelentkezett szakember saját beosztásai
        const assignmentsEndpoint = baseUrl.endsWith('/api') ? `${baseUrl}/beosztas/my-assignments` : `${baseUrl}/api/beosztas/my-assignments`;
        const assignmentsRes = await fetch(assignmentsEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json();
          setAssignments(assignmentsData);
        } else {
          const errorBody = await assignmentsRes.json().catch(() => null);
          setError(errorBody?.error || 'Hiba történt az adatok betöltésekor.');
        }
      } catch (err) {
        setError('Hiba történt az adatok betöltésekor.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const markFinished = async (assignment: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = rawUrl.replace(/\/?$/, '');
      const id = assignment.FeladatId ?? assignment.feladatId ?? assignment.FeladatID ?? assignment.id ?? assignment.feladat?.FeladatId ?? assignment.feladat?.feladatId;
      console.log('markFinished called for assignment, resolved id=', id);
      const endpoint = baseUrl.endsWith('/api') ? `${baseUrl}/beosztas/complete/${id}` : `${baseUrl}/api/beosztas/complete/${id}`;
      console.log('Calling endpoint:', endpoint);
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setAssignments(prev => prev.filter(a => !( (a.FeladatId ?? a.feladatId) === (assignment.FeladatId ?? assignment.feladatId) )));
      } else {
        // próbáljuk kiolvasni json-t, ha van, különben sima szöveget
        let bodyText = '';
        try {
          const json = await res.json();
          bodyText = JSON.stringify(json);
        } catch (e) {
          try { bodyText = await res.text(); } catch (_) { bodyText = ''; }
        }
        const msg = `Hiba: ${res.status} ${res.statusText} ${bodyText}`;
        console.error('complete assignment failed:', msg);
        setError(msg);
      }
    } catch (err) {
      setError('Hálózati hiba történt.');
    }
  };

  if (loading) {
    return (
      <main className="container mt-4 main-wrapper">
        <h1>Balatoni Vityilló</h1>
        <div className="text-center">
          <p>Adatok betöltése...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mt-4 main-wrapper">
        <h1>Balatoni Vityilló</h1>
        <div className="alert alert-danger">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="container mt-4 main-wrapper">
      <h1>Balatoni Vityilló</h1>
      
      <div id="beosztas-kontener">
        {user ? (
          <div>
            <div className="mb-3">
              <h3>Aktuális Beosztásod</h3>
              <p>Üdvözöljük, <strong>{user.nev}</strong>! Az alábbi felújítási munkákra vagy beosztva:</p>
            </div>

            {assignments && assignments.length > 0 ? (
              <div className="assignments-grid">
                {assignments
                  .filter((a) => {
                    const status = (a.Statusz ?? a.statusz ?? '').toString().trim().toLowerCase();
                    return status !== 'befejezve';
                  })
                  .map((assignment, index) => (
                    <div key={index} className="assignment-card">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h5 className="card-title text-primary">{assignment.FeladatTipus}</h5>
                          <p className="card-text"><strong>Helyszín:</strong> {assignment.HelyszinCim}</p>
                          <p className="card-text"><strong>Leírás:</strong> {assignment.Leiras}</p>
                          <p className="card-text"><strong>Státusz:</strong> {assignment.Statusz}</p>
                          <div className="row">
                            <div className="col-6">
                              <p className="mb-0"><strong>Munka dátuma:</strong></p>
                              <p className="small">{assignment.MunkaDatuma ? new Date(assignment.MunkaDatuma).toLocaleDateString('hu-HU') : 'Nincs megadva'}</p>
                            </div>
                            <div className="col-6">
                              <p className="mb-0"><strong>Kezdés:</strong></p>
                              <p className="small">{assignment.KezdesDatuma ? new Date(assignment.KezdesDatuma).toLocaleDateString('hu-HU') : 'Nincs megadva'}</p>
                            </div>
                          </div>
                          <p className="mt-2 mb-1"><strong>Terület:</strong> {assignment.Terulet} m²</p>
                          <p className="mb-2"><strong>Ár:</strong> {assignment.Ar} Ft</p>
                        </div>
                        <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                          <span className="badge bg-success">Hozzád rendelve</span>
                          {((assignment.Statusz ?? assignment.statusz) || '').toString().trim().toLowerCase() !== 'befejezve' && (
                            <button className="btn btn-sm btn-outline-success" onClick={() => markFinished(assignment)}>Befejezés</button>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-secondary">Nincs aktív munkabeosztásod.</div>
            )}
          </div>
        ) : (
          <div className="alert alert-info text-center p-5">
            <h3 className="font-bold text-xl">Nincs aktív munkabeosztásod.</h3>
            <p>Ez az oldal csak munkatársaink számára érhető el.</p>
          </div>
        )}
      </div>
    </main>
  );
}