"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroButtons() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    setLoggedIn(!!token);
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!loggedIn) {
    return (
      <div className="hero-buttons">
        <Link href="/login" className="btn secondary">Bejelentkezés</Link>
        <Link href="/register" className="btn primary">Regisztráció</Link>
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="hero-buttons">
        <Link href="/admin" className="btn secondary">Admin</Link>
        <button onClick={handleLogout} className="btn primary">Kijelentkezés</button>
      </div>
    );
  }

  return (
    <div className="hero-buttons">
      <Link href="/profil" className="btn secondary">Profil</Link>
      <button onClick={handleLogout} className="btn primary">Kijelentkezés</button>
    </div>
  );
}
