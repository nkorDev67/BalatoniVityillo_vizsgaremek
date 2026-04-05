"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import HeroButtons from '../components/HeroButtons';
import { API_UTAK, apiVegpont } from '@/lib/utvonalak';

type HomeStats = {
  completedRemodels: number;
  expertTeam: number;
  activeProjects: number;
};

type HomePayload = {
  stats: HomeStats;
};

const defaultStats: HomeStats = {
  completedRemodels: 0,
  expertTeam: 0,
  activeProjects: 0,
};

const serviceCards = [
  {
    title: 'Teljes felújítás-koordináció',
    description: 'Nem kell többé aggódnod a szakemberek szervezése miatt, mert mi mindent kézben tartunkunk! A felújítási igényedet egy helyen adhatod meg, mi pedig gondoskodunk a szakemberek kiválasztásáról, a munkák ütemezéséről és a kommunikáció gördülékenységéről.',
    href: '/felujitaskeres',
    action: 'Felújítást kérek',
  },
  {
    title: 'Átlátható profil és státusz',
    description: 'Profilod egy hely, ahol minden fontos információt megtalálsz a nyaralódról: a felújítási előzményektől a szakemberek értékelésein át a következő teendők listájáig.',
    href: '/profil',
    action: 'Megnézem a profilt',
  },
  {
    title: 'Tulajdonosi ügyintézés egy helyen',
    description: 'Kevesebb telefon, kevesebb egyeztetés és gyorsabb döntések, mert minden fontos információ ugyanarra a felületre fut be.',
    href: '/login',
    action: 'Belépek a rendszerbe',
  },
];

const processSteps = [
  'Regisztrálsz, és megadod az ingatlan alapadatait.',
  'Beküldöd a felújítási igényt a belső felületen.',
  'Az admin jóváhagyja és szakembereket rendel a feladatokhoz.',
  'Miután a szakemberek elvégzik a munkát, értesítenek a megadott elérhetőségeiden.',
];

export default function Home() {
  const [stats, setStats] = useState<HomeStats>(defaultStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch(apiVegpont(API_UTAK.nyilvanos.kezdolap), { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('A publikus adatok nem érhetők el.');
        }

        const data: HomePayload = await response.json();
        setStats(data.stats ?? defaultStats);
        setError(null);
      } catch (error) {
        console.error('Hiba a kezdőoldal adatainak lekérésekor:', error);
        setStats(defaultStats);
        setError('A háttérrendszer jelenleg nem válaszol, ezért csak az alap információk látszanak.');
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage-shell">
      <section className="hero homepage-hero">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />

        <div className="hero-layout">
          <div className="hero-content" data-reveal>
            <span className="hero-eyebrow">Felújítás, üzemeltetés, nyugalom</span>
            <h1>Balatoni ingatlanod működjön úgy, mintha mindig a helyszínen lennél.</h1>
            <p>
              A Balatoni Vityilló felülete egy helyre hozza a felújításkéréseket, a szakemberbeosztást,
              a bérbeadási ügyintézést és az élő állapotkövetést.
            </p>
            <HeroButtons />

            <div className="hero-metrics">
              <div className="metric-card glass-card">
                <strong>{stats.completedRemodels}</strong>
                <span>befejezett projekt</span>
              </div>
              <div className="metric-card glass-card">
                <strong>{stats.expertTeam}</strong>
                <span>aktív szakember</span>
              </div>
              <div className="metric-card glass-card">
                <strong>{stats.activeProjects}</strong>
                <span>futó munka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="homepage-content container">
        <section className="trust-strip" data-reveal>
          <div>
            <span className="kicker">Miért hasznos?</span>
            <h2>Ez a felület azoknak készült, akik szeretnék távolról is kézben tartani a balatoni ingatlan ügyeit.</h2>
          </div>
          <p>
            Segít átlátni, hol tart egy felújítás, kik dolgoznak rajta, mikor indul a következő feladat,
            és mikor kell beavatkozni tulajdonosként. Röviden: kevesebb bizonytalanság, több kontroll.
          </p>
        </section>

        <section className="homepage-section" data-reveal>
          <div className="section-heading">
            <span className="kicker">Szolgáltatások</span>
            <h2>Miben segítünk a nyaraló körül?</h2>
          </div>

          <div className="service-grid">
            {serviceCards.map((service, index) => (
              <article className="feature-card" data-reveal key={service.title} style={{ animationDelay: `${index * 120}ms` }}>
                <span className="feature-index">0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link href={service.href} className="inline-link">{service.action}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="homepage-section split-section">
          <div className="glass-panel" data-reveal>
            <div className="section-heading left">
              <span className="kicker">Folyamat</span>
              <h2>Így indul el a munka a rendszerben</h2>
            </div>

            <div className="timeline-list">
              {processSteps.map((step, index) => (
                <div className="timeline-item" data-reveal key={step} style={{ animationDelay: `${index * 90}ms` }}>
                  <span className="timeline-badge">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel highlight-panel" data-reveal>
            <span className="kicker">Miért jobb most?</span>
            <h2>Miért minket válassz?</h2>
            <ul className="benefit-list">
              <li>Mobilon is megnyitható és átlátható a navigáció.</li>
              <li>Könnyen kezelhető felület.</li>
              <li>Valós projektszámok és legfrissebb munkák közvetlenül a kezdőlapon.</li>
              <li>Megbízható és szorgalmas munkaerő.</li>
            </ul>
          </div>
        </section>

        {error ? <div className="status-banner warning">{error}</div> : null}

        

        <section className="homepage-section-compact cta-panel" data-reveal>
          <div>
            <span className="kicker">Következő lépés</span>
            <h2>Ha van balatoni ingatlanod, innentől a rendszer végigviszi a folyamatot.</h2>
          </div>
          <div className="cta-actions">
            <Link href="/felujitaskeres" className="btn primary">Felújítás indítása</Link>
            <Link href="/profil" className="btn secondary">Profil megnyitása</Link>
          </div>
        </section>
      </div>
    </div>
  );
}