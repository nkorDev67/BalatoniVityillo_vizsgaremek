"use client"; // Ez kell, mert van benne interakció (állapotkezelés)

import { useState, useEffect } from "react";

export default function BeosztasPage() {
  // Szimulált bejelentkezett felhasználó adatai
  const user = {
    szerepkor: "munkas", // Próbáld átírni 'ugyfel'-re a teszteléshez!
    nev: "Kovács János"
  };

  // Szimulált munkák adatai
  const munkak = [
    {
      tipus: "Festés",
      cim: "8600 Siófok, Petőfi sétány 12.",
      kezdet: "2024.05.20. 08:00",
      vege: "2024.05.22. 16:00"
    }
  ];

  return (
    <main className="container mt-4 main-wrapper">
      <h1>Balatoni Vityilló</h1>
      
      <div id="beosztas-kontener">
        {user.szerepkor === "munkas" ? (
          // MUNKÁS NÉZET
          <div className="card shadow border-primary">
            <div className="card-header bg-primary text-white p-3">
              <h3 className="mb-0">Aktuális Beosztásod</h3>
            </div>
            <div className="card-body p-4">
              <p>Üdvözöljük, <strong>{user.nev}</strong>! Az alábbi felújítási munkára vagy beosztva:</p>
              <hr />
              
              {munkak.map((munka, index) => (
                <div key={index} className="mb-3 p-3 bg-light rounded border-start border-4 border-success shadow-sm">
                  <h4 className="text-success">{munka.tipus}</h4>
                  <p><strong>Helyszín:</strong> {munka.cim}</p>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Munkavégzés kezdete:</strong><br /> {munka.kezdet}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Várható befejezés:</strong><br /> {munka.vege}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // ÜGYFÉL / EGYÉB NÉZET
          <div className="alert alert-info text-center p-5">
            <h3 className="font-bold text-xl">Nincs aktív munkabeosztásod.</h3>
            <p>Ez az oldal csak munkatársaink számára érhető el.</p>
          </div>
        )}
      </div>
    </main>
  );
}