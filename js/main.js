// main.js

document.addEventListener("DOMContentLoaded", () => {

  // ===== CONFIG =====
  const CALENDAR_ID = 'a42682891ff3cdeba7e8d30c8deb71cd3e263aaf9d3d84b61cc4efb52f5a2c75@group.calendar.google.com';
  const API_KEY = 'AIzaSyC8Vpze8e4-Mv3D5boiNszUj5-GIfIV5Vg';

  const NIGHT_PRICE = 140;
  const CLEANING = 120;
  const TAX_PER_ADULT = 1.5;
  const MIN_NIGHTS = 4;
  const MAX_ADULTS = 6;
  const MAX_TOTAL = 8;

  let startDate, endDate, adults = 2, children = 0;

  const calendarInput = document.getElementById("calendar");
  const billing = document.getElementById("billing");

  // ===== FETCH DATES OCCUPÉES =====

  async function fetchBusyDates(){

    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 12);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${today.toISOString()}&timeMax=${maxDate.toISOString()}&singleEvents=true&orderBy=startTime`;

    try{

      const res = await fetch(url);
      const data = await res.json();

      const disabled = [];

      if(data.items){

        data.items.forEach(event => {

          const start = new Date(event.start.date || event.start.dateTime);
          const end = new Date(event.end.date || event.end.dateTime);

          let current = new Date(start);

          while(current < end){

            disabled.push(new Date(current));

            current.setDate(current.getDate() + 1);

          }

        });

      }

      return disabled;

    }catch(err){

      console.error("Erreur Google Calendar API :", err);
      return [];

    }

  }

  // ===== INITIALISER CALENDRIER =====

  async function initFlatpickr(){

    const busyDates = await fetchBusyDates();

    flatpickr("#calendar",{

      locale: flatpickr.l10ns.fr,

      mode:"range",

      dateFormat:"d/m/Y",

      minDate:"today",

      disable:busyDates,

      onChange:function(selectedDates){

        if(selectedDates.length === 2){

          startDate = selectedDates[0];
          endDate = selectedDates[1];

          updateBilling();

        }

      }

    });

  }

  initFlatpickr();

  // ===== COMPTEURS =====

  const adultCountEl = document.getElementById("adultCount");
  const childCountEl = document.getElementById("childCount");

  function updateButtons(){

    document.getElementById("adultMinus").disabled = adults <= 1;
    document.getElementById("adultPlus").disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL;

    document.getElementById("childMinus").disabled = children <= 0;
    document.getElementById("childPlus").disabled = adults + children >= MAX_TOTAL;

  }

  function changeAdult(n){

    const newAdults = adults + n;

    if(newAdults < 1 || newAdults > MAX_ADULTS || newAdults + children > MAX_TOTAL) return;

    adults = newAdults;

    adultCountEl.textContent = adults;

    updateButtons();
    updateBilling();

  }

  function changeChild(n){

    const newChildren = children + n;

    if(newChildren < 0 || adults + newChildren > MAX_TOTAL) return;

    children = newChildren;

    childCountEl.textContent = children;

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

      billing.innerHTML = '';
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

  const closeBtn = document.querySelector(".close");
  const confirmBtn = document.getElementById("confirmBooking");

  document.getElementById("checkoutButton").addEventListener("click", () => {

    const total = updateBilling();

    if(!startDate || !endDate || !total){

      alert(`Sélectionnez au moins ${MIN_NIGHTS} nuits valides`);
      return;

    }

    summary.innerHTML = `
      Du <b>${startDate.toLocaleDateString("fr-FR")}</b> au <b>${endDate.toLocaleDateString("fr-FR")}</b><br>
      <b>${adults}</b> adulte(s), <b>${children}</b> enfant(s)<br>
      Total estimé : <b>${total.toFixed(2)} €</b>
    `;

    modal.style.display = "block";

  });

  closeBtn.onclick = () => modal.style.display = "none";

  window.onclick = e => { if(e.target == modal) modal.style.display = "none"; }

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

  // ===== WHATSAPP =====

  document.getElementById("whatsappFloat").addEventListener("click", () => {

    let msg = `Bonjour, je souhaite des infos pour Villa CABOUA.`;

    if(startDate && endDate){

      msg = `Bonjour, je souhaite réserver Villa CABOUA du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s).`;

    }

    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`, "_blank");

  });

});
