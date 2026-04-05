"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { API_UTAK, OLDAL_UTAK, apiVegpont } from '@/lib/utvonalak';
import { useRouteGuard } from '@/lib/jogosultsagOr';

export default function BeosztasPage() {
  const router = useRouter();
  const { allowed, checking } = useRouteGuard(['szakember']);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ nev: string; szerepkor: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!allowed) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        router.push(OLDAL_UTAK.kezdolap);
        return;
      }

      try {
        const userRes = await fetch(apiVegpont(API_UTAK.azonositas.profilom), {
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

        const assignmentsRes = await fetch(apiVegpont(API_UTAK.beosztas.sajatBeosztasok), {
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
  }, [allowed, router]);

  const markFinished = async (assignment: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const id = assignment.FeladatId ?? assignment.feladatId ?? assignment.FeladatID ?? assignment.id ?? assignment.feladat?.FeladatId ?? assignment.feladat?.feladatId;
      const endpoint = apiVegpont(API_UTAK.beosztas.befejezes(id));
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setAssignments(prev => prev.filter(a => !((a.FeladatId ?? a.feladatId) === (assignment.FeladatId ?? assignment.feladatId))));
      } else {
        let bodyText = '';
        try {
          const json = await res.json();
          bodyText = JSON.stringify(json);
        } catch (e) {
          try {
            bodyText = await res.text();
          } catch (_) {
            bodyText = '';
          }
        }
        const msg = `Hiba: ${res.status} ${res.statusText} ${bodyText}`;
        console.error('complete assignment failed:', msg);
        setError(msg);
      }
    } catch (err) {
      setError('Hálózati hiba történt.');
    }
  };

  const activeAssignments = assignments.filter((assignment) => {
    const status = (assignment.Statusz ?? assignment.statusz ?? '').toString().trim().toLowerCase();
    return status !== 'befejezve';
  });

  if (checking || !allowed) {
    return null;
  }

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

            {activeAssignments.length > 0 ? (
              <div className="assignments-grid">
                {activeAssignments.map((assignment, index) => {
                  const assignmentId = assignment.FeladatId ?? assignment.feladatId ?? assignment.FeladatID ?? assignment.id ?? index;
                  const status = ((assignment.Statusz ?? assignment.statusz) || '').toString().trim().toLowerCase();

                  return (
                    <div key={assignmentId} className="assignment-card">
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
                          {status !== 'befejezve' ? (
                            <button className="btn btn-sm btn-outline-success" onClick={() => markFinished(assignment)}>Befejezés</button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
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