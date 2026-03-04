"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+36');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // eltávolítunk minden nem számjegyet (kivéve a + jelet elején)
    if (!val.startsWith('+')) {
      val = '+' + val.replace(/\D/g, '');
    }
    // biztosítjuk, hogy +36 mindig legyen elől
    if (!val.startsWith('+36')) {
      val = '+36' + val.replace(/\D/g, '').replace(/^36/, '');
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // frontend validáció
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
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      setError('A telefonszámnak +36-tal együtt 11 számjegyűnek kell lennie.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
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
        // opcionálisan átirányíthatjuk a bejelentkező oldalra néhány másodperc után
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.message || data.error || 'Ismeretlen hiba történt.');
      }
    } catch (err) {
      setError('Szerver hiba! Ellenőrizd, fut-e a backend.');
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Regisztráció</h1>
        <br />
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        {success && <p style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="inputmezo form-control"
            name="un"
            placeholder="Teljes név"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <br /> <br />
          <input
            type="email"
            className="inputmezo form-control"
            name="email"
            placeholder="Email cím"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br /> <br />
          <input
            type="tel"
            className="inputmezo form-control"
            name="phone"
            placeholder="Telefonszám"
            value={phone}
            onChange={handlePhoneChange}
            required
          />
          <br /> <br />
          <input
            type="password"
            className="inputmezo form-control"
            name="pw"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br /> <br />

          <input
            type="submit"
            className="gomb form-control"
            name="regisztracio"
            value="Regisztráció"
          />
        </form>

        <br />
        <Link href="/login">
          <button className="btn secondary">Már van fiókom</button>
        </Link>
        &nbsp; {/* Kis hely a gombok között */}
        <Link href="/">
          <button className="btn primary">Vissza a főoldalra</button>
        </Link>
      </div>
    </section>
  );
}