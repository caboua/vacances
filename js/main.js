document.addEventListener("DOMContentLoaded", () => {
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

  async function fetchBusyDates() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 12);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${today.toISOString()}&timeMax=${maxDate.toISOString()}&singleEvents=true&orderBy=startTime`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const disabled = [];

      if (data.items) {
        data.items.forEach(event => {
          let start = new Date(event.start.date || event.start.dateTime);
          let end = new Date(event.end.date || event.end.dateTime);
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            disabled.push(new Date(d));
          }
        });
      }

      return disabled;
    } catch (err) {
      console.error("Erreur Google Calendar API :", err);
      return [];
    }
  }

  async function initFlatpickr() {
    const busyDates = await fetchBusyDates();
    flatpickr(calendarInput, {
      locale: "fr",
      mode: "range",
      dateFormat: "d/m/Y",
      minDate: "today",
      disable: busyDates,
      disableMobile: true, // force flatpickr custom sur mobile
      onChange: function(selectedDates) {
        if (selectedDates.length === 2) {
          startDate = selectedDates[0];
          endDate = selectedDates[1];
          updateBilling();
        }
      }
    });
  }
  initFlatpickr();

  // Compteurs adultes/enfants
  const adultCountEl = document.getElementById("adultCount");
  const childCountEl = document.getElementById("childCount");

  function updateButtons() {
    document.getElementById("adultMinus").disabled = adults <= 1;
    document.getElementById("adultPlus").disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL;
    document.getElementById("childMinus").disabled = children <= 0;
    document.getElementById("childPlus").disabled = adults + children >= MAX_TOTAL;
  }

  function changeAdult(n) {
    let na = adults + n;
    if (na < 1 || na > MAX_ADULTS || na + children > MAX_TOTAL) return;
    adults = na; adultCountEl.textContent = adults; updateButtons(); updateBilling();
  }
  function changeChild(n) {
    let nc = children + n;
    if (nc < 0 || adults + nc > MAX_TOTAL) return;
    children = nc; childCountEl.textContent = children; updateButtons(); updateBilling();
  }

  document.getElementById("adultMinus").onclick = () => changeAdult(-1);
  document.getElementById("adultPlus").onclick = () => changeAdult(1);
  document.getElementById("childMinus").onclick = () => changeChild(-1);
  document.getElementById("childPlus").onclick = () => changeChild(1);
  updateButtons();

  // Facturation
  function updateBilling() {
    if (!startDate || !endDate) { billing.innerHTML = ''; return; }
    let nights = Math.round((endDate - startDate)/(1000*60*60*24));
    if (nights < MIN_NIGHTS) { billing.innerHTML = `<p style="color:red;">Minimum ${MIN_NIGHTS} nuits</p>`; return; }
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

  // Modal réservation
  const modal = document.getElementById("reservationModal");
  const summary = document.getElementById("reservationSummary");
  const closeBtn = document.querySelector(".close");
  const confirmBtn = document.getElementById("confirmBooking");

  document.getElementById("checkoutButton").addEventListener("click", () => {
    const total = updateBilling();
    if (!startDate || !endDate || !total) { alert(`Sélectionnez au moins ${MIN_NIGHTS} nuits valides`); return; }
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

  // WhatsApp
  document.getElementById("whatsappFloat").addEventListener("click", () => {
    let msg = `Bonjour, je souhaite des infos pour Villa CABOUA.`;
    if(startDate && endDate){
      msg = `Bonjour, je souhaite réserver Villa CABOUA du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s).`;
    }
    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`, "_blank");
  });
});
