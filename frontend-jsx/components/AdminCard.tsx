'use client';

import { useState } from 'react';
import styles from '../app/admin/admin.module.css'; // Vagy használd a Tailwind osztályokat

// Típusdefiníció a TypeScript-hez
interface FelujitasKeres {
    FelujitasId: number;
    HelyszinCim: string;
    Leiras: string;
    Statusz: string;
    UgyfelNeve: string;
    LetrehozasDatuma: string;
}
 
export default function AdminCard({ keres }: { keres: FelujitasKeres }) {
    const [datum, setDatum] = useState("");
    const [betoltes, setBetoltes] = useState(false);

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
                <p className={styles.dateInfo}>Beérkezett: {new Date(keres.LetrehozasDatuma).toLocaleDateString('hu-HU')}</p>
            </div>

            <div className={styles.footer}>
                <label htmlFor={`date-${keres.FelujitasId}`}>Kezdés dátuma:</label>
                <input 
                    id={`date-${keres.FelujitasId}`}
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