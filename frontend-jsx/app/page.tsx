import Link from 'next/link';



export default function Home() {
  return (
<div className="main-wrapper"> 
      <section className="hero">
        <div className="hero-content">
          <h1>Balatoni Vityilló</h1>
          <p>Ha a Balaton a szíved csücske, legyen a vityillódra mindenki büszke!</p>

          <div className="hero-buttons">
            <Link href="/login" className="btn secondary">Bejelentkezés</Link>
            <Link href="/register" className="btn primary">Regisztráció</Link>
          </div>
        </div>
      </section>

      <main>
        {/* Ide jön majd az oldal többi része */}
      </main>
    </div>
  );
}