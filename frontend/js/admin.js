const modal = document.getElementById("workerModal");
const openModalBtn = document.getElementById("addWorkerbtn");
const closeModalBtn = document.getElementById("closeWorkerbtn");

openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";

});
closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

document.getElementById("saveWorkerbtn").addEventListener("click", () => {
  const email = document.getElementById("workerEmail").value;

  if (!email) {
    alert("Adj meg egy email címet!");
    return;
  }

  console.log("Szakember hozzáadása:", email);

  modal.style.display = "none";
});
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function showSection(sectionId) {
        // Összes szekció elrejtése
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active-section');
        });

        // A kiválasztott szekció megjelenítése
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active-section');
        } else {
            console.error("Szekció nem található: " + sectionId);
        }
    } 
    // Szekciók váltása után (ha mobil méreten vagyunk) zárjuk be
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
