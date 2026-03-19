document.addEventListener("DOMContentLoaded", () => {

let startDate = null;
let endDate = null;
let blockedDates = [];

let adults = 2;
let children = 0;

const billing = document.getElementById("billing");

// =====================
// CALENDRIER
// =====================
const fp = flatpickr("#calendar", {
  locale: "fr",
  inline: true,
  mode: "range",
  minDate: "today",
  disableMobile: true,

  onChange: function(selectedDates){
    if(selectedDates.length === 2){
      startDate = selectedDates[0];
      endDate = selectedDates[1];
      updatePrice();
    }
  }
});

// =====================
// CHARGER ICS
// =====================
fetch("https://api.allorigins.win/raw?url=" +
encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics"))
.then(res=>res.text())
.then(text=>{

let lines = text.split("\n");
let start, end;

lines.forEach(line=>{
if(line.includes("DTSTART")) start = line.split(":")[1];
if(line.includes("DTEND")){
end = line.split(":")[1];

let s = new Date(start.substring(0,4), start.substring(4,6)-1, start.substring(6,8));
let e = new Date(end.substring(0,4), end.substring(4,6)-1, end.substring(6,8));

while(s < e){
blockedDates.push(new Date(s));
s.setDate(s.getDate()+1);
}
}
});

fp.set("disable", blockedDates);
fp.redraw();

});

// =====================
// PRIX
// =====================
function updatePrice(){

if(!startDate || !endDate) return;

let nights = (endDate - startDate)/(1000*60*60*24);

if(nights < 4){
billing.innerHTML = "Minimum 4 nuits";
return;
}

let totalNights = nights * 140;
let tax = (adults+children)*1.5;
let total = totalNights + tax + 120;

billing.innerHTML = `
<div class="billing-line"><span>${nights} nuits</span><span>${totalNights}€</span></div>
<div class="billing-line"><span>Taxe</span><span>${tax.toFixed(2)}€</span></div>
<div class="billing-line"><span>Ménage</span><span>120€</span></div>
<div class="billing-line total"><span>Total</span><span>${total.toFixed(2)}€</span></div>
`;

}

// =====================
// COMPTEURS
// =====================
document.getElementById("adultPlus").onclick=()=>{adults++;updatePrice();document.getElementById("adultCount").innerText=adults;}
document.getElementById("adultMinus").onclick=()=>{if(adults>1){adults--;updatePrice();document.getElementById("adultCount").innerText=adults;}}

document.getElementById("childPlus").onclick=()=>{children++;updatePrice();document.getElementById("childCount").innerText=children;}
document.getElementById("childMinus").onclick=()=>{if(children>0){children--;updatePrice();document.getElementById("childCount").innerText=children;}}

// =====================
// VERIF DISPO
// =====================
function isBlocked(date){
return blockedDates.some(d=>d.toDateString()===date.toDateString());
}

function isAvailable(start,end){
let d=new Date(start);
while(d<end){
if(isBlocked(d)) return false;
d.setDate(d.getDate()+1);
}
return true;
}

// =====================
// RESERVER
// =====================
document.getElementById("checkoutButton").onclick = function(){

if(!startDate || !endDate){
alert("Choisissez vos dates");
return;
}

let nights = (endDate - startDate)/(1000*60*60*24);

if(nights < 4){
alert("Minimum 4 nuits");
return;
}

if(!isAvailable(startDate,endDate)){
alert("Indisponible");
return;
}

let total = (nights*140)+((adults+children)*1.5)+120;

window.location.href = `mailto:villa.caboua@gmail.com?subject=Reservation&body=Bonjour, je souhaite réserver du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()} pour ${adults} adultes et ${children} enfants. Total: ${total}€`;

};

});
