import Link from 'next/link';

export default function RegisterPage() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Regisztráció</h1>
        <br/>
        
        <form>
          <input type="text" className="inputmezo form-control" name="un" placeholder="Teljes név" required />
          <br /><br />
          <input type="email" className="inputmezo form-control" name="email" placeholder="Email cím" required />
          <br /><br />
          <input type="tel" className="inputmezo form-control" name="phone" placeholder="Telefonszám" required />
          <br /><br />
          <input type="password" className="inputmezo form-control" name="pw" placeholder="Jelszó" required />
          <br /><br />
          
          <input type="submit" className="gomb form-control" name="regisztracio" value="Regisztráció" />
        </form>
        
        <br/>
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