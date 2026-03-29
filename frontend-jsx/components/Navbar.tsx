"use client"; // Ez fontos a localStorage miatt!

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand-mark">Balatoni Vityilló</Link>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-label="Menü megnyitása"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link href="/" className={isActive("/") ? "active" : ""}>Kezdőlap</Link>
          </li>

          {role === "felhasznalo" && (
            <li>
              <Link href="/felujitaskeres" className={isActive("/felujitaskeres") ? "active" : ""}>Felújítás kérése</Link>
            </li>
          )}

          {role === "szakember" && (
            <li>
              <Link href="/beosztas" className={isActive("/beosztas") ? "active" : ""}>Beosztásom</Link>
            </li>
          )}

          {role === "admin" && (
            <li>
              <Link href="/admin" className={isActive("/admin") ? "active" : ""}>Admin</Link>
            </li>
          )}

          {(role === "felhasznalo" || role === "szakember") && (
            <li>
              <Link href="/profil" className={isActive("/profil") ? "active" : ""}>Profil</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}