document.addEventListener("DOMContentLoaded", () => {

const NIGHT_PRICE = 140;
const CLEANING = 120;
const TAX_PER_ADULT = 1.5;
const MIN_NIGHTS = 4;
const MAX_ADULTS = 6;
const MAX_TOTAL = 8;

let startDate = null;
let endDate = null;
let adults = 2;
let children = 0;

const calendarInput = document.getElementById("calendar");
const billing = document.getElementById("billing");

// ===== CALENDAR =====
flatpickr(calendarInput,{
    locale:"fr",
    mode:"range",
    dateFormat:"d/m/Y",
    minDate:"today",
    disableMobile:true,
    onChange:function(selectedDates){
        if(selectedDates.length === 2){
            startDate = selectedDates[0];
            endDate = selectedDates[1];
            updateBilling();
        }
    }
});

// ===== COMPTEURS =====
const adultCount = document.getElementById("adultCount");
const childCount = document.getElementById("childCount");

function updateButtons(){
    document.getElementById("adultMinus").disabled = adults <= 1;
    document.getElementById("adultPlus").disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL;
    document.getElementById("childMinus").disabled = children <= 0;
    document.getElementById("childPlus").disabled = adults + children >= MAX_TOTAL;
}

function changeAdult(n){
    let newVal = adults + n;
    if(newVal < 1 || newVal > MAX_ADULTS || newVal + children > MAX_TOTAL) return;
    adults = newVal;
    adultCount.textContent = adults;
    updateButtons();
    updateBilling();
}

function changeChild(n){
    let newVal = children + n;
    if(newVal < 0 || adults + newVal > MAX_TOTAL) return;
    children = newVal;
    childCount.textContent = children;
    updateButtons();
    updateBilling();
}

document.getElementById("adultMinus").onclick = () => changeAdult(-1);
document.getElementById("adultPlus").onclick = () => changeAdult(1);
document.getElementById("childMinus").onclick = () => changeChild(-1);
document.getElementById("childPlus").onclick = () => changeChild(1);

updateButtons();

// ===== FACTURATION =====
function updateBilling(){

    if(!startDate || !endDate){
        billing.innerHTML = "";
        return;
    }

    const nights = Math.round((endDate - startDate)/(1000*60*60*24));

    if(nights < MIN_NIGHTS){
        billing.innerHTML = `<p style="color:red;">Minimum ${MIN_NIGHTS} nuits</p>`;
        return 0;
    }

    const subtotal = nights * NIGHT_PRICE;
    const tax = adults * TAX_PER_ADULT;
    const total = subtotal + CLEANING + tax;

    billing.innerHTML = `
        <div class="billing-line"><span>${nights} nuits</span><span>${subtotal.toFixed(2)} €</span></div>
        <div class="billing-line"><span>Taxe séjour</span><span>${tax.toFixed(2)} €</span></div>
        <div class="billing-line"><span>Ménage</span><span>${CLEANING.toFixed(2)} €</span></div>
        <hr>
        <div class="billing-line total"><span>Total</span><span>${total.toFixed(2)} €</span></div>
    `;

    return total;
}

// ===== MODAL =====
const modal = document.getElementById("reservationModal");
const summary = document.getElementById("reservationSummary");

document.getElementById("checkoutButton").addEventListener("click", () => {

    if (!startDate || !endDate) {
        alert("Sélectionnez vos dates");
        return;
    }

    const total = updateBilling();

    if (!total) {
        alert(`Minimum ${MIN_NIGHTS} nuits`);
        return;
    }

    summary.innerHTML = `
        Du <b>${startDate.toLocaleDateString("fr-FR")}</b> au <b>${endDate.toLocaleDateString("fr-FR")}</b><br>
        ${adults} adulte(s), ${children} enfant(s)<br>
        <b>Total : ${total.toFixed(2)} €</b>
    `;

    modal.style.display = "block";
});

document.querySelector(".close").onclick = () => modal.style.display = "none";

window.onclick = e => {
    if(e.target == modal) modal.style.display = "none";
};

document.getElementById("confirmBooking").onclick = () => {
    window.location.href = `mailto:villa.caboua@gmail.com`;
    modal.style.display = "none";
};

// ===== WHATSAPP =====
document.getElementById("whatsappFloat").onclick = () => {
    let msg = "Bonjour je souhaite des infos pour Villa CABOUA";

    if(startDate && endDate){
        msg = `Bonjour, réservation du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s)`;
    }

    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`, "_blank");
};

});
