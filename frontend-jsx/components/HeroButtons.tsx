"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OLDAL_UTAK } from '@/lib/utvonalak';

export default function HeroButtons() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setLoggedIn(!!token);
    setRole(storedRole);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setRole(null);
    router.push(OLDAL_UTAK.login);
  };

  return (
    <div className="hero-buttons">
      {!loggedIn ? (
        <>
          <Link href="/login" className="btn secondary">Bejelentkezés</Link>
          <Link href="/register" className="btn primary">Regisztráció</Link>
        </>
      ) : (
        <>
          {role === "admin" ? (
            <Link href="/admin" className="btn secondary">Admin felület</Link>
          ) : (
            <Link href="/profil" className="btn secondary">Profilom</Link>
          )}
          <button type="button" onClick={handleLogout} className="btn primary">Kijelentkezés</button>
        </>
      )}
    </div>
  );
}