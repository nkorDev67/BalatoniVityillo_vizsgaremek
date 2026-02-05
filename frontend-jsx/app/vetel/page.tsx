'use client';
import { useState, useEffect } from 'react';


interface Ingatlan {
    hely: string;
    szobak: string;
    terulet: string;
    ar: string;
}

export default function VetelPage() {
    const [ingatlanok, setIngatlanok] = useState<Ingatlan[]>([]);

    useEffect(() => {
        const mentettAdat = localStorage.getItem('ujIngatlan');
        if (mentettAdat) {
            const ingatlan = JSON.parse(mentettAdat);
            setIngatlanok([ingatlan]);
        }
    }, []);

    const torles = () => {
        if (confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) {
            localStorage.removeItem('ujIngatlan');
            setIngatlanok([]);
        }
    };

    return (
        <div>
            <h1>Balatoni Vityilló</h1>

            <main>
                <h3>Vétel oldal</h3>
                {ingatlanok.map((ingatlan, index) => (
                    <div key={index} className="card" style={{ border: '2px solid #28a745', marginTop: '20px' }}>
                        <h3>{ingatlan.hely}</h3>
                        <p>Szobák: {ingatlan.szobak}, Alapterület: {ingatlan.terulet} m²</p>
                        <p><strong>Ár: {ingatlan.ar} Ft</strong></p>
                        <button
                            onClick={torles}
                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', cursor: 'pointer' }}
                        >
                            Hirdetés törlése
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
}