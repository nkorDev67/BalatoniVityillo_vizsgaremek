'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';




export default function AdasPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        elocation: '',
        erooms: '',
        earea: '',
        eprice: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const mentesEsNavigalas = () => {
        if (!formData.elocation || !formData.erooms || !formData.earea || !formData.eprice) {
            alert('Kérjük, töltsön ki minden mezőt!');
            return;
        }

        const ingatlan = {
            hely: formData.elocation,
            szobak: formData.erooms,
            terulet: formData.earea,
            ar: formData.eprice
        };

        localStorage.setItem('ujIngatlan', JSON.stringify(ingatlan));
        router.push('/vetel');
    };

    return (
        <div>

            <h1>Balatoni Vityilló</h1>

            <main>
                <h3>Ingatlan eladás oldal</h3>
                <div className="card">
                    <input
                        type="text"
                        id="elocation"
                        className="form-control"
                        placeholder="Lokáció"
                        value={formData.elocation}
                        onChange={handleInputChange}
                        required
                    />
                    <br />
                    <input
                        type="number"
                        id="erooms"
                        className="form-control"
                        placeholder="Szobák száma"
                        value={formData.erooms}
                        onChange={handleInputChange}
                        required
                    />
                    <br />
                    <input
                        type="number"
                        id="earea"
                        className="form-control"
                        placeholder="Alapterület (m²)"
                        value={formData.earea}
                        onChange={handleInputChange}
                        required
                    />
                    <br />
                    <input
                        type="number"
                        id="eprice"
                        className="form-control"
                        placeholder="Eladási ár (Ft)"
                        value={formData.eprice}
                        onChange={handleInputChange}
                        required
                    />
                    <br />
                    <button onClick={mentesEsNavigalas}>Eladás</button>
                </div>
            </main>
        </div>
    );
}