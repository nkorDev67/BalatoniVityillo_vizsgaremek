const selectElem = document.getElementById("feladatTípus");
const listaKontener = document.getElementById("valasztottLista");
const rejtettMezo = document.getElementById("veglegesTipusok");

let kivalasztottElemek = []; // Ebben tároljuk a választott dolgokat

selectElem.addEventListener("change", function() {
    const ertek = this.value;
    const szoveg = this.options[this.selectedIndex].text;

    // Csak akkor adjuk hozzá, ha nem üres és még nincs benne a listában
    if (ertek !== "" && !kivalasztottElemek.includes(szoveg)) {
        kivalasztottElemek.push(szoveg);
        megjelenitBuborekokat();
    }
    
    // Visszaállítjuk az alaphelyzetbe, hogy újra lehessen választani
    this.value = "";
});

function megjelenitBuborekokat() {
    listaKontener.innerHTML = ""; // Töröljük a jelenlegi nézetet
    
    kivalasztottElemek.forEach((elem, index) => {
        const buborek = document.createElement("span");
        buborek.style.cssText = "background: hsl(17, 68%, 44%); color: white; padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 14px; margin-top: 5px;";
        buborek.innerHTML = `${elem} <b>×</b>`;
        
        // Ha rákattint, töröljük a listából
        buborek.onclick = function() {
            kivalasztottElemek.splice(index, 1);
            megjelenitBuborekokat();
        };
        
        listaKontener.appendChild(buborek);
    });
    
    // Frissítjük a rejtett mezőt az elküldéshez
    rejtettMezo.value = kivalasztottElemek.join(", ");
}

// Az eredeti beküldő kódod módosítása:
document.getElementById("felujitasForm").addEventListener("submit", function(e) {
    e.preventDefault(); 
    const cim = document.getElementById("LakasCím").value;
    const terulet = document.getElementById("terulet").value;

    document.getElementById("uzenet").innerHTML = `
        <p>Felújítási igény sikeresen elküldve!</p>
        <p>Cím: ${cim}</p>
        <p>Választott feladatok: ${kivalasztottElemek.join(", ")}</p>
        <p>Terület (m²): ${terulet}</p>`;
});