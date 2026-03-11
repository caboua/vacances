// Variables
let startDate, endDate, adults = 2, children = 0;
const MAX_ADULTS = 6, MAX_TOTAL = 8, NIGHT_PRICE = 180, CLEANING = 120, TAX_PER_ADULT = 1.5;
const calendarInput = document.getElementById('calendar');
const billing = document.getElementById('billing');

// Adultes/Enfants
function updateButtons() {
    document.getElementById("adultMinus").disabled = adults <= 1;
    document.getElementById("adultPlus").disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL;
    document.getElementById("childMinus").disabled = children <= 0;
    document.getElementById("childPlus").disabled = adults + children >= MAX_TOTAL;
}
function changeAdult(n) {
    let na = adults + n;
    if (na < 1 || na > MAX_ADULTS || na + children > MAX_TOTAL) return;
    adults = na; document.getElementById("adultCount").innerText = adults;
    updateButtons(); calculate();
}
function changeChild(n) {
    let nc = children + n;
    if (nc < 0 || adults + nc > MAX_TOTAL) return;
    children = nc; document.getElementById("childCount").innerText = children;
    updateButtons(); calculate();
}

// Calcul total
function calculate() {
    if (!startDate || !endDate) return 0;
    let nights = (endDate - startDate)/(1000*60*60*24);
    let subtotal = nights * NIGHT_PRICE;
    let tax = adults * TAX_PER_ADULT;
    let total = subtotal + CLEANING + tax;
    billing.innerHTML = `
        <div class="billing-line"><span>${nights} nuits</span><span>${subtotal.toFixed(2)} €</span></div>
        <div class="billing-line"><span>Taxe séjour</span><span>${tax.toFixed(2)} €</span></div>
        <div class="billing-line"><span>Ménage</span><span>${CLEANING.toFixed(2)} €</span></div>
        <hr>
        <div class="billing-line total"><span>Total</span><span>${total.toFixed(2)} €</span></div>
    `;
    return total;
}

// Boutons adultes/enfants
document.getElementById("adultMinus").onclick = () => changeAdult(-1);
document.getElementById("adultPlus").onclick = () => changeAdult(1);
document.getElementById("childMinus").onclick = () => changeChild(-1);
document.getElementById("childPlus").onclick = () => changeChild(1);
updateButtons();

// Calendrier
calendarInput.addEventListener("change", e => {
    let dates = calendarInput._flatpickr.selectedDates;
    if (dates.length === 2) { startDate = dates[0]; endDate = dates[1]; calculate(); }
});

// Modal réservation
const modal = document.getElementById("reservationModal");
const summary = document.getElementById("reservationSummary");
const closeBtn = document.querySelector(".close");
const confirmBtn = document.getElementById("confirmBooking");

document.getElementById("checkoutButton").addEventListener("click", () => {
    if (!startDate || !endDate) { alert("Sélectionnez vos dates"); return; }
    summary.innerHTML = `
      Du <b>${startDate.toLocaleDateString("fr-FR")}</b> au <b>${endDate.toLocaleDateString("fr-FR")}</b><br>
      <b>${adults}</b> adulte(s), <b>${children}</b> enfant(s)<br>
      Total estimé : <b>${calculate().toFixed(2)} €</b>
    `;
    modal.style.display = "block";
});

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; }

// Confirmation email
confirmBtn.onclick = () => {
    const subject = encodeURIComponent("Réservation Villa CABOUA");
    const body = encodeURIComponent(
        `Bonjour,\n\nJe souhaite réserver Villa CABOUA :\n`+
        `Dates : ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}\n`+
        `Adultes : ${adults}\nEnfants : ${children}\n\nMerci.`
    );
    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
    modal.style.display = "none";
}

// WhatsApp
const whatsappBtn = document.getElementById("whatsappFloat");

whatsappBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Empêche le href par défaut
    let msg = `Bonjour, je souhaite des infos pour Villa CABOUA.`;
    if(window.startDate && window.endDate){
        msg = `Bonjour, je souhaite réserver Villa CABOUA du ${window.startDate.toLocaleDateString("fr-FR")} au ${window.endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s).`;
    }
    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`, "_blank");
});
