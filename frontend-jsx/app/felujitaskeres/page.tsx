"use client";

import { useState } from 'react';
import styles from './felujitaskeres.module.css';
import { API_UTAK, apiVegpont } from '@/lib/utvonalak';
import { useRouteGuard } from '@/lib/jogosultsagOr';

export default function FelujitasKeresePage() {
    const { allowed, checking } = useRouteGuard(['felhasznalo']);
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
        if (!allowed) {
            return;
        }

        const feladatokTomb = valasztottTipusok.map((tipus) => {
        const option = tipusokOptions.find(o => o.value === tipus);
        return {

            tipus: specifikaciok[tipus] 
                ? `${option?.label} (${specifikaciok[tipus]})` 
                : (option?.label || tipus),
            terulet: parseFloat(teruletPerTipus[tipus]) || 0,
            ar: calculatePrice(tipus, teruletPerTipus[tipus] || '0')
        };
    });

    const payload = {
        helyszinCim: lakasCim, 
        leiras: megjegyzes,    
        feladatok: feladatokTomb
    };
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(apiVegpont(API_UTAK.felujitas.keres), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            setUzenet('A felújítási kérés sikeresen elküldve!');
           
            setLakasCim('');
            setValasztottTipusok([]);
            setTeruletPerTipus({});
            setMegjegyzes('');
            setSpecifikaciok({});
        } else {
            const errorData = await response.json();
            setUzenet(`Hiba: ${errorData.error || 'Szerver hiba'}`);
        }
    } catch (error) {
        setUzenet('Hiba az adatküldés során! Ellenőrizd a szervert.');
    }
    };

    if (checking || !allowed) {
        return null;
    }

    return (
        <main className={styles.pageShell}>
            <section className={styles.heroPanel}>
                <span className={styles.eyebrow}>Árajánlat és felmérés</span>
                <h1 className={styles.title}>Felújítás kérése</h1>
                <p className={styles.subtitle}>
                    Itt tudod elindítani az ajánlatkérést. Minden mezőt ugyanabban a letisztult stílusban tartottam,
                    hogy a profil oldalhoz hasonlóan ez a felület is egységesen nézzen ki.
                </p>
            </section>

            <form onSubmit={handleSubmit} id="felujitasForm" className={styles.formPanel}>
                <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="lakasCim" className={styles.fieldLabel}>Lakás címe</label>
                    <input
                        type="text"
                        id="lakasCim"
                        name="lakasCim"
                        placeholder="Írd be a címet"
                        value={lakasCim}
                        onChange={(e) => setLakasCim(e.target.value)}
                        className={styles.textInput}
                        required
                    />
                    </div>

                    <div className={styles.fieldGroup}>
                    <label htmlFor="feladatTipus" className={styles.fieldLabel}>Feladat típusa</label>
                    <select
                        id="feladatTipus"
                        name="feladatTipus"
                        value={feladatTipus}
                        onChange={handleTipusChange}
                        className={styles.selectInput}
                    >
                        <option value="">Válassz egy típust</option>
                        {tipusokOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.ar.toLocaleString('hu-HU')} Ft/m²)
                            </option>
                        ))}
                    </select>
                    </div>
                </div>

                {valasztottTipusok.length > 0 && (
                    <section className={styles.selectedPanel}>
                        <div className={styles.selectedHeading}>
                            <div>
                                <h2 className={styles.selectedTitle}>Kiválasztott feladatok</h2>
                                <p className={styles.selectedSubtitle}>Minden feladathoz itt tudsz területet és részletezést adni.</p>
                            </div>
                        </div>
                        <div className={styles.taskList}>
                            {valasztottTipusok.map((tipus) => {
                                const option = tipusokOptions.find(o => o.value === tipus);
                                const tipusAr = calculatePrice(tipus, teruletPerTipus[tipus] || '0');
                                return (
                                    <div key={tipus} className={styles.taskRow}>
                                        <div className={styles.taskHeader}>
                                            <span className={styles.taskTitle}>{option?.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTipus(tipus)}
                                                className={styles.removeButton}
                                            >
                                                Eltávolítás
                                            </button>
                                        </div>
                                        <div className={styles.taskFields}>
                                        <input
                                            type="number"
                                            placeholder="Terület (m²)"
                                            value={teruletPerTipus[tipus] || ''}
                                            onChange={(e) => setTeruletPerTipus({
                                                ...teruletPerTipus,
                                                [tipus]: e.target.value
                                            })}
                                            className={styles.numberInput}
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
                                                className={styles.specInput}
                                                required
                                            />
                                        )}
                                        </div>
                                        <div className={styles.priceTag}>
                                            {tipusAr.toLocaleString('hu-HU')} Ft
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.priceSummary}>
                            <p className={styles.priceNotice}>Adminisztrációs feldolgozás után a végleges ár változhat.</p>
                            <strong className={styles.priceTotal}>Összesen: {calculateTotalPrice().toLocaleString('hu-HU')} Ft</strong>
                        </div>
                    </section>
                )}

                <div className={styles.fieldGroup}>
                    <label htmlFor="megjegyzes" className={styles.fieldLabel}>Megjegyzés</label>
                    <textarea
                        id="megjegyzes"
                        name="megjegyzes"
                        placeholder="Részletezd a kérést"
                        value={megjegyzes}
                        onChange={(e) => setMegjegyzes(e.target.value)}
                        className={styles.textareaInput}
                    />
                </div>

                <button type="submit" className={styles.submitButton}>Kérés elküldése</button>
            </form>

            {uzenet ? <div id="uzenet" className={styles.messageBox}>{uzenet}</div> : null}
        </main>
    );
}
