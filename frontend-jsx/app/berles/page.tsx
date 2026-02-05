"use client";

import React, { useEffect, useState } from 'react';

const BerlesPage: React.FC = () => {
    const [berlet, setBerlet] = useState<any>(null);

    useEffect(() => {
        const loadBerlet = () => {
            const mentettBerlet = localStorage.getItem('ujBerlet');

            if (mentettBerlet) {
                const adat = JSON.parse(mentettBerlet);
                setBerlet(adat);
            }
        };

        loadBerlet();
    }, []);

    const berletTorles = () => {
        if (confirm("Valóban törölni szeretné ezt a bérleti hirdetést?")) {
            localStorage.removeItem('ujBerlet');
            location.reload();
        }
    };

    return (
        <div>
            <h1>Balatoni Vityilló</h1>
            <main id="berlet-lista">
                <h3>Bérbe adás/Bérlés oldal</h3>
                {berlet && (
                    <div className="card" style={{ border: "2px solid #007bff", marginTop: "15px" }}>
                        <h3>{berlet.hely}</h3>
                        <p>Szobák: {berlet.szobak}, Alapterület: {berlet.terulet} m²</p>
                        <p><strong>Ár: {berlet.ar} Ft / nap</strong></p>
                        <button onClick={berletTorles} style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>
                            Bérlet törlése
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BerlesPage;