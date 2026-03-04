'use client';

import { useState } from 'react';
import styles from '../app/admin/admin.module.css'; // Vagy használd a Tailwind osztályokat

interface Feladat {
    Tipus: string;
    Terulet: string;
    Ar: number;
}
interface FelujitasKeres {
    FelujitasId: number;
    HelyszinCim: string;
    Leiras: string;
    Statusz: string;
    UgyfelNeve: string;
    KezdesDatuma: string;
    Feladatok?: Feladat[];
}
 
export default function AdminCard({ keres }: { keres: FelujitasKeres }) {
    const [datum, setDatum] = useState("");
    const [betoltes, setBetoltes] = useState(false);
    const [nyitva, setNyitva] = useState(false);

    const handleMentes = async () => {
        if (!datum) {
            alert("Kérlek, válassz egy dátumot!");
            return;
        }

        setBetoltes(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/update-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    felujitasId: keres.FelujitasId,
                    ujStatusz: 'Ütemezve',
                    ujDatum: datum
                })
            });

            if (response.ok) {
                alert("Sikeresen ütemezve!");
                // Itt akár egy oldalfrissítést is nyomhatsz: window.location.reload();
            } else {
                alert("Hiba történt a mentés során.");
            }
        } catch (error) {
            console.error("Hálózati hiba:", error);
        } finally {
            setBetoltes(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>{keres.UgyfelNeve}</h3>
                <span className={styles.statusBadge}>{keres.Statusz}</span>
            </div>
            
            <div className={styles.body}>
                <p><strong>Helyszín:</strong> {keres.HelyszinCim}</p>
                <p><strong>Leírás:</strong> {keres.Leiras}</p>
                <p className={styles.dateInfo}>
                    Tervezett kezdés: {keres.KezdesDatuma ? new Date(keres.KezdesDatuma).toLocaleDateString('hu-HU') : 'Még nincs ütemezve'}
                </p>

                {/* Lenyíló gomb a feladatokhoz */}
                <button 
                    className={styles.detailsToggle} 
                    onClick={() => setNyitva(!nyitva)}
                >
                    {nyitva ? '🔼 Részletek elrejtése' : '🔽 Feladatok megtekintése'}
                </button>

                {nyitva && (
                    <div className={styles.taskList}>
                        <h4>Kért munkálatok:</h4>
                        {keres.Feladatok && keres.Feladatok.length > 0 ? (
                            <ul>
                                {keres.Feladatok.map((f, index) => (
                                    <li key={index}>
                                        {f.Tipus} - {f.Terulet} m² ({f.Ar.toLocaleString()} Ft)
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nincsenek részletes feladatok megadva.</p>
                        )}
                    </div>
                )}

                
            </div>

            <div className={styles.footer}>
               <label>Kezdés dátuma:</label>
                <input 
                    type="date" 
                    className={styles.dateInput}
                    value={datum}
                    onChange={(e) => setDatum(e.target.value)}
                />
                <button 
                    className={styles.saveButton} 
                    onClick={handleMentes}
                    disabled={betoltes}
                >
                    {betoltes ? 'Mentés...' : 'Időpont rögzítése'}
                </button>
            </div>
        </div>
    );
}