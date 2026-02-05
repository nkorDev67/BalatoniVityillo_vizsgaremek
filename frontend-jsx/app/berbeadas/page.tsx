"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const BerbeAdasPage: React.FC = () => {
    const [location, setLocation] = useState('');
    const [rooms, setRooms] = useState('');
    const [area, setArea] = useState('');
    const [price, setPrice] = useState('');
    const router = useRouter();

    const berletMentes = () => {
        const berlet = {
            hely: location,
            szobak: rooms,
            terulet: area,
            ar: price
        };

        if (!berlet.hely || !berlet.szobak || !berlet.terulet || !berlet.ar) {
            alert("Minden mezőt töltsön ki!");
            return;
        }

        // Mentés a böngészőbe
        localStorage.setItem('ujBerlet', JSON.stringify(berlet));
        router.push('/berles');
    };

    return (
        <div>
            <h1>Balatoni Vityilló</h1>
            <main>
                <h3>Bérbe adás oldal</h3>
                <div className="card">
                    <input
                        type="text"
                        id="blocation"
                        className="adasokmezo form-control"
                        placeholder="Lokáció"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                    <br />
                    <input
                        type="text"
                        id="brooms"
                        className="adasokmezo form-control"
                        placeholder="Szobák száma"
                        value={rooms}
                        onChange={(e) => setRooms(e.target.value)}
                        required
                    />
                    <br />
                    <input
                        type="text"
                        id="barea"
                        className="adasokmezo form-control"
                        placeholder="Alapterület"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        required
                    />
                    <br />
                    <input
                        type="text"
                        id="bprice"
                        className="adasokmezo form-control"
                        placeholder="Bérlési ár / nap"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <br />
                    <button onClick={berletMentes}>Bérbe adás</button>
                </div>
            </main>
        </div>
    );
};

export default BerbeAdasPage;