"use client";

import { useState } from 'react';

export default function FelujitasKeresePage() {
    const [lakasCim, setLakasCim] = useState('');
    const [feladatTipus, setFeladatTipus] = useState('');
    const [valasztottTipusok, setValasztottTipusok] = useState<string[]>([]);
    const [teruletPerTipus, setTeruletPerTipus] = useState<{ [key: string]: string }>({});
    const [megjegyzes, setMegjegyzes] = useState('');
    const [uzenet, setUzenet] = useState('');
    const [specifikaciok, setSpecifikaciok] = useState<{ [key: string]: string }>({});

    const tipusokOptions = [
        { value: 'festes', label: 'Festés', ar: 2000 }, // Ft/m²
        { value: 'burkolas', label: 'Burkolás', ar: 5000 },
        { value: 'vizvezetek', label: 'Vízvezeték szerelés', ar: 8000 },
        { value: 'villanyszereles', label: 'Villanyszerelés', ar: 7000 },
        { value: 'egyeb', label: 'Egyéb', ar: 3000 },
    ];

    const handleTipusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tipus = e.target.value;
        if (tipus && !valasztottTipusok.includes(tipus)) {
            setValasztottTipusok([...valasztottTipusok, tipus]);
            setTeruletPerTipus({ ...teruletPerTipus, [tipus]: '' });
        }
        setFeladatTipus('');
    };

    const removeTipus = (tipusToRemove: string) => {
        setValasztottTipusok(valasztottTipusok.filter(t => t !== tipusToRemove));
        const newTerulet = { ...teruletPerTipus };
        delete newTerulet[tipusToRemove];
        setTeruletPerTipus(newTerulet);
        const newSpec = { ...specifikaciok };
        delete newSpec[tipusToRemove];
        setSpecifikaciok(newSpec);
    };

    const needsSpecification = (tipus: string) => {
        return ['vizvezetek', 'villanyszereles'].includes(tipus);
    };

    const calculatePrice = (tipus: string, terulet: string): number => {
        const option = tipusokOptions.find(o => o.value === tipus);
        const area = parseFloat(terulet) || 0;
        return (option?.ar || 0) * area;
    };

    const calculateTotalPrice = (): number => {
        return valasztottTipusok.reduce((total, tipus) => {
            return total + calculatePrice(tipus, teruletPerTipus[tipus] || '0');
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = {
            lakasCim,
            feladatTipusok: valasztottTipusok,
            teruletPerTipus,
            megjegyzes,
            specifikaciok,
            osszAr: calculateTotalPrice(),
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
                setTeruletPerTipus({});
                setMegjegyzes('');
                setSpecifikaciok({});
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
                                {option.label} ({option.ar.toLocaleString('hu-HU')} Ft/m²)
                            </option>
                        ))}
                    </select>

                    {valasztottTipusok.length > 0 && (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                            <h3>Kiválasztott feladatok:</h3>
                            {valasztottTipusok.map((tipus) => {
                                const option = tipusokOptions.find(o => o.value === tipus);
                                const tipusAr = calculatePrice(tipus, teruletPerTipus[tipus] || '0');
                                return (
                                    <div key={tipus} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span><strong>{option?.label}</strong></span>
                                            <button
                                                type="button"
                                                onClick={() => removeTipus(tipus)}
                                                style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '18px' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            placeholder="Terület (m²)"
                                            value={teruletPerTipus[tipus] || ''}
                                            onChange={(e) => setTeruletPerTipus({
                                                ...teruletPerTipus,
                                                [tipus]: e.target.value
                                            })}
                                            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                                            required
                                        />
                                        {needsSpecification(tipus) && (
                                            <input
                                                type="text"
                                                placeholder={`Hol kell? (pl. konyha, fürdőszoba, összes szoba)`}
                                                value={specifikaciok[tipus] || ''}
                                                onChange={(e) => setSpecifikaciok({
                                                    ...specifikaciok,
                                                    [tipus]: e.target.value
                                                })}
                                                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                                                required
                                            />
                                        )}
                                        <div style={{ backgroundColor: '#fff', padding: '8px', borderRadius: '4px', textAlign: 'right' }}>
                                            <strong>{tipusAr.toLocaleString('hu-HU')} Ft</strong>
                                        </div>
                                    </div>
                                );
                            })}
                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', textAlign: 'right' }}>
                                <h3 style={{ margin: '0', fontSize: '12px' }}>(adminisztrációs feldolgozás után az ár érték változhat)</h3>
                                <h3 style={{ margin: '0' }}>Összesen: <span style={{ color: '#2e7d32' }}>{calculateTotalPrice().toLocaleString('hu-HU')} Ft / m²</span></h3>
                            </div>
                        </div>
                    )}

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
