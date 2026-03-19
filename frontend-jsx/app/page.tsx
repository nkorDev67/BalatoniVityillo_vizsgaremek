import Link from 'next/link';
import HeroButtons from '../components/HeroButtons';


export default function Home() {
  return (
    <div className="main-wrapper"> 
      <section className="hero">
        <div className="hero-content">
          <h1>Balatoni Vityilló</h1>
          <p>Ha a Balaton a szíved csücske, legyen a vityillódra mindenki büszke!</p>

          <HeroButtons />
        </div>
      </section>

      <main>
        {/* Ide jön majd az oldal többi része */}
      </main>
    </div>
  );
}