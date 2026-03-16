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

        // Beosztások lekérése (minden feladatot megjelenítünk, de csak a sajáthoz lehet cselekedni)
        const assignmentsEndpoint = baseUrl.endsWith('/api') ? `${baseUrl}/beosztas/assignments` : `${baseUrl}/api/beosztas/assignments`;
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
          // MUNKÁS NÉZET (vagy felhasználó, akinek lehetnek munkái)
          <div className="card shadow border-primary">
            <div className="card-header bg-primary text-white p-3">
              <h3 className="mb-0">Aktuális Beosztásod</h3>
            </div>
            <div className="card-body p-4">
              <p>Üdvözöljük, <strong>{user.nev}</strong>! Az alábbi felújítási munkára vagy beosztva:</p>
              <hr />
              
              {assignments.filter(a => a.AssignedToMe === 1).length > 0 ? assignments
                .filter(a => a.AssignedToMe === 1)
                .map((assignment, index) => (
                  <div key={index} className="mb-3 p-3 bg-light rounded border-start border-4 border-success shadow-sm">
                  <h4 className="text-success">{assignment.FeladatTipus}</h4>
                  <p><strong>Helyszín:</strong> {assignment.HelyszinCim}</p>
                  <p><strong>Leírás:</strong> {assignment.Leiras}</p>
                  <p><strong>Státusz:</strong> {assignment.Statusz}</p>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Munka dátuma:</strong><br /> {assignment.MunkaDatuma ? new Date(assignment.MunkaDatuma).toLocaleDateString('hu-HU') : 'Nincs megadva'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Kezdés dátuma:</strong><br /> {assignment.KezdesDatuma ? new Date(assignment.KezdesDatuma).toLocaleDateString('hu-HU') : 'Nincs megadva'}</p>
                    </div>
                  </div>
                  <p><strong>Terület:</strong> {assignment.Terulet} m²</p>
                  <p><strong>Ár:</strong> {assignment.Ar} Ft</p>

                  <div className="mt-2">
                    {assignment.AssignedToMe ? (
                      <span className="badge bg-success">Hozzád rendelve</span>
                    ) : (
                      <span className="badge bg-secondary">Nem hozzád rendelve</span>
                    )}
                  </div>
                </div>
              )) : (
                <p>Nincs aktív munkabeosztásod.</p>
              )}
            </div>
          </div>
        ) : (
          // ÜGYFÉL / EGYÉB NÉZET
          <div className="alert alert-info text-center p-5">
            <h3 className="font-bold text-xl">Nincs aktív munkabeosztásod.</h3>
            <p>Ez az oldal csak munkatársaink számára érhető el.</p>
          </div>
        )}
      </div>
    </main>
  );
}