"use client";

import { useState } from 'react';
import Link from 'next/link';




export default function FelujitasKeresePage() {
    const [lakasCim, setLakasCim] = useState('');
    const [feladatTipus, setFeladatTipus] = useState('');
    const [valasztottTipusok, setValasztottTipusok] = useState<string[]>([]);
    const [terulet, setTerulet] = useState('');
    const [megjegyzes, setMegjegyzes] = useState('');
    const [uzenet, setUzenet] = useState('');

    const tipusokOptions = [
        { value: 'festes', label: 'Festés' },
        { value: 'burkolas', label: 'Burkolás' },
        { value: 'vizvezetek', label: 'Vízvezeték szerelés' },
        { value: 'villanyszereles', label: 'Villanyszerelés' },
        { value: 'egyeb', label: 'Egyéb' },
    ];

    const handleTipusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tippus = e.target.value;
        if (tippus && !valasztottTipusok.includes(tippus)) {
            setValasztottTipusok([...valasztottTipusok, tippus]);
        }
        setFeladatTipus('');
    };

    const removeTipus = (tipusToRemove: string) => {
        setValasztottTipusok(valasztottTipusok.filter(t => t !== tipusToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            lakasCim,
            feladatTipusok: valasztottTipusok,
            terulet: parseInt(terulet),
            megjegyzes,
        };

        try {
            const response = await fetch('/api/felujitas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setUzenet('Felújítás kérés sikeresen elküldve!');
                setLakasCim('');
                setValasztottTipusok([]);
                setTerulet('');
                setMegjegyzes('');
            }
        } catch (error) {
            setUzenet('Hiba az adatküldés során!');
        }
    };

    return (
        <>
            

            <main className="felujitas-main">
                <h1>Felújítás kérése</h1>
                <form onSubmit={handleSubmit} id="felujitasForm">
                    <label htmlFor="lakasCim">Lakás címe:</label>
                    <input
                        type="text"
                        id="lakasCim"
                        name="lakasCim"
                        placeholder="Írd be a címet"
                        value={lakasCim}
                        onChange={(e) => setLakasCim(e.target.value)}
                        required
                    />

                    <label htmlFor="feladatTipus">Feladat típusa:</label>
                    <select
                        id="feladatTipus"
                        name="feladatTipus"
                        value={feladatTipus}
                        onChange={handleTipusChange}
                    >
                        <option value="">Válassz egy típust</option>
                        {tipusokOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div id="valasztottLista" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {valasztottTipusok.map((tipus) => (
                            <span key={tipus} style={{ backgroundColor: '#ddd', padding: '5px 10px', borderRadius: '4px' }}>
                                {tipusokOptions.find(o => o.value === tipus)?.label}
                                <button
                                    type="button"
                                    onClick={() => removeTipus(tipus)}
                                    style={{ marginLeft: '5px', cursor: 'pointer', background: 'none', border: 'none' }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    <label htmlFor="terulet">Terület (m²):</label>
                    <input
                        type="number"
                        id="terulet"
                        name="terulet"
                        placeholder="Pl. 25"
                        value={terulet}
                        onChange={(e) => setTerulet(e.target.value)}
                        required
                    />

                    <label htmlFor="megjegyzes">Megjegyzés:</label>
                    <textarea
                        id="megjegyzes"
                        name="megjegyzes"
                        placeholder="Részletezd a kérést"
                        value={megjegyzes}
                        onChange={(e) => setMegjegyzes(e.target.value)}
                    />

                    <button type="submit">Kérés elküldése</button>
                </form>
                <div id="uzenet">{uzenet}</div>
            </main>
        </>
    );
}