document.addEventListener("DOMContentLoaded", () => {

const CALENDAR_ID = "a42682891ff3cdeba7e8d30c8deb71cd3e263aaf9d3d84b61cc4efb52f5a2c75@group.calendar.google.com";
const API_KEY = "AIzaSyC8Vpze8e4-Mv3D5boiNszUj5-GIfIV5Vg";

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

async function fetchBusyDates(){

const today = new Date();
const maxDate = new Date();
maxDate.setMonth(today.getMonth()+12);

const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${today.toISOString()}&timeMax=${maxDate.toISOString()}&singleEvents=true&orderBy=startTime`;

try{

const res = await fetch(url);
const data = await res.json();
const disabled = [];

if(data.items){

data.items.forEach(event =>{

const start = new Date(event.start.date || event.start.dateTime);
const end = new Date(event.end.date || event.end.dateTime);

let current = new Date(start);

while(current < end){

disabled.push(new Date(current));
current.setDate(current.getDate()+1);

}

});

}

return disabled;

}catch(e){

console.error("Erreur calendrier :",e);
return [];

}

}

async function initCalendar(){

const busyDates = await fetchBusyDates();

flatpickr(calendarInput,{

locale:"fr",
mode:"range",
dateFormat:"d/m/Y",
minDate:"today",
disable:busyDates,

disableMobile:true,

onChange:function(selectedDates){

if(selectedDates.length === 2){

startDate = selectedDates[0];
endDate = selectedDates[1];

updateBilling();

}

}

});

}

initCalendar();

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

function updateBilling(){

if(!startDate || !endDate){

billing.innerHTML="";
return;

}

const nights = Math.round((endDate - startDate)/(1000*60*60*24));

if(nights < MIN_NIGHTS){

billing.innerHTML = `<p style="color:red;">Minimum ${MIN_NIGHTS} nuits</p>`;
return;

}

const subtotal = nights * NIGHT_PRICE;
const tax = adults * TAX_PER_ADULT;
const total = subtotal + CLEANING + tax;

billing.innerHTML = `

<div class="billing-line">
<span>${nights} nuits</span>
<span>${subtotal.toFixed(2)} €</span>
</div>

<div class="billing-line">
<span>Taxe séjour</span>
<span>${tax.toFixed(2)} €</span>
</div>

<div class="billing-line">
<span>Ménage</span>
<span>${CLEANING.toFixed(2)} €</span>
</div>

<hr>

<div class="billing-line total">
<span>Total</span>
<span>${total.toFixed(2)} €</span>
</div>

`;

return total;

}

const modal = document.getElementById("reservationModal");
const summary = document.getElementById("reservationSummary");

document.getElementById("checkoutButton").onclick = () =>{

const total = updateBilling();

if(!startDate || !endDate || !total){

alert(`Sélectionnez au moins ${MIN_NIGHTS} nuits`);
return;

}

summary.innerHTML = `

Du <b>${startDate.toLocaleDateString("fr-FR")}</b>
au <b>${endDate.toLocaleDateString("fr-FR")}</b>

<br>

${adults} adulte(s) / ${children} enfant(s)

<br>

<b>Total estimé : ${total.toFixed(2)} €</b>

`;

modal.style.display="block";

};

document.querySelector(".close").onclick = () => modal.style.display="none";

window.onclick = e =>{

if(e.target == modal) modal.style.display="none";

}

document.getElementById("confirmBooking").onclick = () =>{

const subject = encodeURIComponent("Réservation Villa CABOUA");

const body = encodeURIComponent(

`Bonjour,

Je souhaite réserver la Villa CABOUA :

Dates : ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}

Adultes : ${adults}
Enfants : ${children}

Merci.`

);

window.location.href=`mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;

modal.style.display="none";

};

document.getElementById("whatsappFloat").onclick = () =>{

let msg = "Bonjour je souhaite des infos sur Villa CABOUA";

if(startDate && endDate){

msg = `Bonjour je souhaite réserver Villa CABOUA du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s)`;

}

window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`,"_blank");

};

});
