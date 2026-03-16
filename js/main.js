document.addEventListener("DOMContentLoaded", () => {

  const calendarInput = document.getElementById("calendar");
  const billing = document.getElementById("billing");

  if(!calendarInput){
    console.error("Input calendar introuvable");
    return;
  }

  // CONFIG
  const CALENDAR_ID = 'a42682891ff3cdeba7e8d30c8deb71cd3e263aaf9d3d84b61cc4efb52f5a2c75@group.calendar.google.com';
  const API_KEY = 'AIzaSyC8Vpze8e4-Mv3D5boiNszUj5-GIfIV5Vg';

  const NIGHT_PRICE = 140;
  const CLEANING = 120;
  const TAX_PER_ADULT = 1.5;
  const MIN_NIGHTS = 4;
  const MAX_ADULTS = 6;
  const MAX_TOTAL = 8;

  let startDate, endDate;
  let adults = 2;
  let children = 0;

  // ===== GOOGLE CALENDAR =====
  async function fetchBusyDates(){
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 12);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${today.toISOString()}&timeMax=${maxDate.toISOString()}&singleEvents=true&orderBy=startTime`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const disabled = [];

      if(data.items){
        data.items.forEach(event => {
          const start = new Date(event.start.date || event.start.dateTime);
          const end = new Date(event.end.date || event.end.dateTime);
          let current = new Date(start);
          while(current < end){
            // Convert to YYYY-MM-DD string for Flatpickr
            disabled.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate()+1);
          }
        });
      }
      return disabled;
    } catch(err){
      console.error("Erreur Google Calendar:", err);
      return [];
    }
  }

  // ===== INIT CALENDAR =====
  async function initCalendar(){
    calendarInput.disabled = true; // Empêche l'ouverture avant init

    const busyDates = await fetchBusyDates();

    flatpickr(calendarInput, {
      locale: "fr",
      mode: "range",
      dateFormat: "d/m/Y",
      minDate: "today",
      disable: busyDates,
      // disableMobile: true, // Commenté pour permettre calendrier natif mobile
      onChange: function(selectedDates){
        if(selectedDates.length === 2){
          startDate = selectedDates[0];
          endDate = selectedDates[1];
          updateBilling();
        }
      }
    });

    calendarInput.disabled = false; // Activation après init
  }

  initCalendar();

  // ===== COMPTEURS =====
  const adultCount = document.getElementById("adultCount");
  const childCount = document.getElementById("childCount");
  const adultMinus = document.getElementById("adultMinus");
  const adultPlus = document.getElementById("adultPlus");
  const childMinus = document.getElementById("childMinus");
  const childPlus = document.getElementById("childPlus");

  function updateButtons(){
    if(adultMinus) adultMinus.disabled = adults <= 1;
    if(adultPlus) adultPlus.disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL;
    if(childMinus) childMinus.disabled = children <= 0;
    if(childPlus) childPlus.disabled = adults + children >= MAX_TOTAL;
  }

  function changeAdult(n){
    let newVal = adults + n;
    if(newVal < 1 || newVal > MAX_ADULTS || newVal + children > MAX_TOTAL) return;
    adults = newVal;
    if(adultCount) adultCount.textContent = adults;
    updateButtons();
    updateBilling();
  }

  function changeChild(n){
    let newVal = children + n;
    if(newVal < 0 || adults + newVal > MAX_TOTAL) return;
    children = newVal;
    if(childCount) childCount.textContent = children;
    updateButtons();
    updateBilling();
  }

  if(adultMinus) adultMinus.onclick = () => changeAdult(-1);
  if(adultPlus) adultPlus.onclick = () => changeAdult(1);
  if(childMinus) childMinus.onclick = () => changeChild(-1);
  if(childPlus) childPlus.onclick = () => changeChild(1);

  updateButtons();

  // ===== FACTURATION =====
  function updateBilling(){
    if(!billing) return;
    if(!startDate || !endDate){
      billing.innerHTML = "";
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

});
