"use client"; // Ez fontos a localStorage miatt!

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  

  useEffect(() => {
    // Csak betöltéskor nézzük meg, ki van bent
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, [pathname]);

  
  return (
    <nav className="navbar">
      <ul>
        <li><Link href="/">Home</Link></li>
        
        {/* Mindenkinek látható dropdownek */}
        <li className="dropdown">
          <span className="dropbtn">Bérlés</span>
          <div className="dropdown-content">
            <Link href="/berbeadas">Bérbe adás</Link>
            <Link href="/berles">Bérlés</Link>
          </div>
          
        </li>
        <li className="dropdown">
          <span className="dropbtn">Ingatlan</span>
          <div className="dropdown-content">
            <Link href="/adas"> Adás</Link>
            <Link href="/vetel">Vétel</Link>
          </div>
          
        </li>

        {/* Feltételes menüpontok */}
        {role === "felhasznalo" && (
          <li><Link href="/felujitaskeres">Felújítás kérése</Link></li>
        )}

        {role === "szakember" && (
          <li><Link href="/beosztas">Beosztásom</Link></li>
        )}

        {role === "admin" && (
          <li><Link href="/admin">Admin</Link></li>
        )}
        {role ==="felhasznalo" || role === "szakember" &&(
             <li><Link href="/profil">Profil</Link></li>
        )}
       

      </ul>
    </nav>
  );
}