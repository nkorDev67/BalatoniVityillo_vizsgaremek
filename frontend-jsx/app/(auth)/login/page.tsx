import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="main-wrapper">
      <section className="hero">
        <div className="hero-content">
          <h1>Bejelentkezés</h1>
          <br />
          {/* React-ben az onsubmit helyett onSubmit-et írunk, 
              de egyelőre maradjunk a te logikádnál */}
          <form>
            <input 
              type="text" 
              className="inputmezo form-control" 
              name="login_identity" 
              placeholder="Email vagy telefonszám" 
              required 
            /><br /><br />
            
            <input 
              type="password" 
              className="inputmezo form-control" 
              name="pw" 
              placeholder="Jelszó" 
              required 
            /><br /><br />
            
            <input type="submit" className="gomb form-control" name="belepes" value="Belépés" />
          </form>
          <br />
          
          {/* Next.js-ben gombok helyett Linket használunk a navigációhoz */}
          <Link href="/register">
            <button className="btn secondary">Még nincs fiókom</button>
          </Link>
          
          &nbsp; {/* Kis hely a gombok között */}
          <Link href="/">
            <button className="btn primary">Vissza a főoldalra</button>
          </Link>
        </div>
      </section>
    </div>
  );
}