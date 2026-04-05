"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_UTAK, OLDAL_UTAK, apiVegpont } from '@/lib/utvonalak';

const ERVENYES_TELEFON_ELOHIVOK = new Set(['20', '30', '50', '70']);
const TELEFONSZAM_ELOHIVO_HIBA = 'A telefonszám előhívója nem megfelelő. Csak +36 20, +36 30, +36 50 vagy +36 70 kezdetű szám adható meg.';

const normalizaltMagyarTelefonszam = (ertek: string) => {
  const nyersSzamjegyek = ertek.replace(/\D/g, '');
  let normalizaltSzamjegyek = nyersSzamjegyek;

  if (normalizaltSzamjegyek.startsWith('06')) {
    normalizaltSzamjegyek = `36${normalizaltSzamjegyek.slice(2)}`;
  } else if (!normalizaltSzamjegyek.startsWith('36')) {
    normalizaltSzamjegyek = `36${normalizaltSzamjegyek.replace(/^0+/, '')}`;
  }

  return `+${normalizaltSzamjegyek.slice(0, 11)}`;
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+36');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(normalizaltMagyarTelefonszam(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (fullName.trim() === '') {
      setError('Teljes név megadása kötelező.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Helytelen email formátum.');
      return;
    }
    if (password.length < 4 || !/\d/.test(password)) {
      setError('A jelszónak legalább 4 karakter hosszúnak kell lennie és tartalmaznia kell számot.');
      return;
    }
    const telefonszamSzamjegyek = phone.replace(/\D/g, '');
    if (telefonszamSzamjegyek.length !== 11) {
      setError('A telefonszámnak +36-tal együtt 11 számjegyűnek kell lennie.');
      return;
    }
    const szolgaltatoiElohivo = telefonszamSzamjegyek.slice(2, 4);
    if (!ERVENYES_TELEFON_ELOHIVOK.has(szolgaltatoiElohivo)) {
      setError(TELEFONSZAM_ELOHIVO_HIBA);
      return;
    }

    try {
      const response = await fetch(apiVegpont(API_UTAK.azonositas.regisztracio), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          felhasznalonev: fullName,
          email,
          telefon: phone,
          jelszo: password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Sikeres regisztráció!');
        setTimeout(() => router.push(OLDAL_UTAK.bejelentkezes), 2000);
      } else {
        setError(data.message || data.error || 'Ismeretlen hiba történt.');
      }
    } catch (err) {
      setError('Szerver hiba! Ellenőrizd, fut-e a backend.');
    }
  };

  return (
    <section className="hero">
      <div className="hero-content regisztracios-forma-tartalom">
        <h1>Regisztráció</h1>

        <div className="visszajelzo-sav" aria-live="polite">
          {error ? <p className="visszajelzo-uzenet visszajelzo-hiba">{error}</p> : null}
          {!error && success ? <p className="visszajelzo-uzenet visszajelzo-siker">{success}</p> : null}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="inputmezo"
            name="un"
            placeholder="Teljes név"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <br /> <br />
          <input
            type="email"
            className="inputmezo"
            name="email"
            placeholder="Email cím"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br /> <br />
          <input
            type="tel"
            className="inputmezo"
            name="phone"
            placeholder="Telefonszám"
            value={phone}
            onChange={handlePhoneChange}
            required
          />
          <br /> <br />
          <input
            type="password"
            className="inputmezo"
            name="pw"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br /> <br />

          <input
            type="submit"
            name="regisztracio"
            value="Regisztráció"
          />
        </form>

        <br />
        <Link href={OLDAL_UTAK.bejelentkezes}>
          <button className="btn secondary">Már van fiókom</button>
        </Link>
        &nbsp;
        <Link href="/">
          <button className="btn primary">Vissza a főoldalra</button>
        </Link>
      </div>
    </section>
  );
}