'use client';

import { useEffect, useState } from 'react';
import styles from '../app/admin/admin.module.css'; 
import { API_UTAK, apiVegpont } from '@/lib/utvonalak';

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
    const [aktualisStatusz, setAktualisStatusz] = useState(keres.Statusz);
    const [aktualisKezdesDatum, setAktualisKezdesDatum] = useState(keres.KezdesDatuma || '');

    useEffect(() => {
        setAktualisStatusz(keres.Statusz);
        setAktualisKezdesDatum(keres.KezdesDatuma || '');
    }, [keres.Statusz, keres.KezdesDatuma]);

    const vanRogzitettIdopont = Boolean(aktualisKezdesDatum);

    const handleMentes = async () => {
        if (!datum) {
            alert("Kérlek, válassz egy dátumot!");
            return;
        }

        setBetoltes(true);
        try {
            const response = await fetch(apiVegpont(API_UTAK.adminisztracio.statuszFrissites), {
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
                setAktualisStatusz('Ütemezve');
                setAktualisKezdesDatum(datum);
                setDatum('');
            } else {
                alert("Hiba történt a mentés során.");
            }
        } catch (error) {
            console.error("Hálózati hiba:", error);
        } finally {
            setBetoltes(false);
        }
    };

    const handleBefejezes = async () => {
        const response = await fetch(apiVegpont(API_UTAK.adminisztracio.statuszFrissites), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            felujitasId: keres.FelujitasId,
            ujStatusz: 'Befejezve',
            ujDatum: aktualisKezdesDatum
        })
    });

    if (response.ok) {
        alert("Projekt lezárva! Eltűnik az admin listából.");
        window.location.reload(); 

    }

    }



    return (
        <div className={styles.requestCard}>
            <div className={styles.header}>
                <h3>{keres.UgyfelNeve}</h3>
                <span className={styles.statusBadge}>{aktualisStatusz}</span>
            </div>
            
            <div className={styles.body}>
                <p><strong>Helyszín:</strong> {keres.HelyszinCim}</p>
              <div className={styles.descriptionContainer}>
                 <strong>Leírás:</strong> 
                <p style={{ margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>
                    {keres.Leiras}
                </p>
                 </div>
                <p className={styles.dateInfo}>
                    Tervezett kezdés: {aktualisKezdesDatum ? new Date(aktualisKezdesDatum).toLocaleDateString('hu-HU') : 'Még nincs ütemezve'}
                </p>
                <button 
                    className={styles.detailsToggle} 
                    onClick={() => setNyitva(!nyitva)}
                >
                    {nyitva ? 'Részletek elrejtése' : 'Feladatok megtekintése'}
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
                {!vanRogzitettIdopont ? (
                    <>
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
                    </>
                ) : (
                    <p className={styles.actionNote}>Időpont rögzítve</p>
                )}
                {vanRogzitettIdopont && (
                    <button 
                        className={styles.completeButton} 
                        onClick={handleBefejezes}>
                        Projekt lezárása
                    </button>
                )}
            </div>
        </div>
    );
}