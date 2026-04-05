"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_UTAK, OLDAL_UTAK, apiVegpont } from '@/lib/utvonalak';

export default function LoginPage() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent)=> {
    e.preventDefault();
    setError('');

    try{
      const response = await fetch(apiVegpont(API_UTAK.azonositas.bejelentkezes), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_identity: identity,
          pw: password
        }),
      });
      const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        if (data.role === 'admin') {
          router.push(OLDAL_UTAK.admin);
        } else if (data.role === 'szakember') {
          router.push(OLDAL_UTAK.beosztas);
        } else {
          router.push(OLDAL_UTAK.profil);
        }
      } else {
        setError(data.message || 'Hibás felhasználónév vagy jelszó!');
      }
    } catch (err) {
      setError('Szerver hiba! Ellenőrizd, fut-e a backend.');
    }


  }





  return (
    <section className="hero">
      <div className="hero-content regisztracios-forma-tartalom">
        <h1>Bejelentkezés</h1>

        <div className="visszajelzo-sav" aria-live="polite">
          {error ? <p className="visszajelzo-uzenet visszajelzo-hiba">{error}</p> : null}
        </div>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="inputmezo" 
            name="login_identity" 
            placeholder="Email vagy telefonszám" 
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            required 
          /><br /><br />
          
          <input 
            type="password" 
            className="inputmezo" 
            name="pw" 
            placeholder="Jelszó" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          /><br /><br />
          
          <input type="submit" name="belepes" value="Belépés" />
        </form>
        <br />

        <Link href={OLDAL_UTAK.regisztracio}>
          <button className="btn secondary">Még nincs fiókom</button>
        </Link>

        &nbsp;
        <Link href="/">
          <button className="btn primary">Vissza a főoldalra</button>
        </Link>
      </div>
    </section>
  );
}