document.addEventListener("DOMContentLoaded", async () => {

  const NIGHT_PRICE = 140;
  const CLEANING = 120;
  const TAX_PER_ADULT = 1.5;
  const MIN_NIGHTS = 4;
  const MAX_ADULTS = 6;
  const MAX_TOTAL = 8;

  let startDate, endDate, adults = 2, children = 0;

  const calendarInput = document.getElementById("calendar");
  const billing = document.getElementById("billing");

  // =========================
  // 🔴 Récupération dates Airbnb (Google Calendar ICS)
  // =========================
  async function fetchBlockedDates() {
    try {
      const url = "https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics";

      const response = await fetch(url);
      const text = await response.text();

      const lines = text.split(/\r?\n/);
      const dates = [];

      let start = null;
      let end = null;

      for (let line of lines) {
        if (line.startsWith("DTSTART")) {
          start = line.split(":")[1];
        }

        if (line.startsWith("DTEND")) {
          end = line.split(":")[1];

          if (start && end) {
            let s = new Date(
              start.substring(0,4),
              start.substring(4,6)-1,
              start.substring(6,8)
            );

            let e = new Date(
              end.substring(0,4),
              end.substring(4,6)-1,
              end.substring(6,8)
            );

            while (s < e) {
              dates.push(new Date(s));
              s.setDate(s.getDate() + 1);
            }
          }
        }
      }

      return dates;

    } catch (error) {
      console.error("Erreur chargement calendrier :", error);
      return [];
    }
  }

  // =========================
  // 📅 Initialisation calendrier
  // =========================
  const blockedDates = await fetchBlockedDates();

  flatpickr(calendarInput, {
    locale: "fr",
    mode: "range",
    dateFormat: "d/m/Y",
    minDate: "today",
    disable: blockedDates,

    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];
        updateBilling();
      }
    }
  });

  // =========================
  // 👨‍👩‍👧 Compteurs
  // =========================
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
    adults = na;
    adultCountEl.textContent = adults;
    updateButtons();
    updateBilling();
  }

  function changeChild(n) {
    let nc = children + n;
    if (nc < 0 || adults + nc > MAX_TOTAL) return;
    children = nc;
    childCountEl.textContent = children;
    updateButtons();
    updateBilling();
  }

  document.getElementById("adultMinus").onclick = () => changeAdult(-1);
  document.getElementById("adultPlus").onclick = () => changeAdult(1);
  document.getElementById("childMinus").onclick = () => changeChild(-1);
  document.getElementById("childPlus").onclick = () => changeChild(1);

  updateButtons();

  // =========================
  // 💰 Facturation
  // =========================
  function updateBilling() {

    if (!startDate || !endDate) {
      billing.innerHTML = '';
      return;
    }

    let nights = Math.round((endDate - startDate)/(1000*60*60*24));

    if (nights < MIN_NIGHTS) {
      billing.innerHTML = `<p style="color:red;">Minimum ${MIN_NIGHTS} nuits</p>`;
      return;
    }

    let subtotal = nights * NIGHT_PRICE;
    let tax = adults * TAX_PER_ADULT;
    let total = subtotal + CLEANING + tax;

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

  // =========================
  // 🧾 Réservation
  // =========================
  const modal = document.getElementById("reservationModal");
  const summary = document.getElementById("reservationSummary");

  document.getElementById("checkoutButton").addEventListener("click", () => {

    const total = updateBilling();

    if (!startDate || !endDate || !total) {
      alert(`Sélectionnez au moins ${MIN_NIGHTS} nuits`);
      return;
    }

    summary.innerHTML = `
      Du <b>${startDate.toLocaleDateString("fr-FR")}</b> au <b>${endDate.toLocaleDateString("fr-FR")}</b><br>
      ${adults} adulte(s), ${children} enfant(s)<br>
      Total : <b>${total.toFixed(2)} €</b>
    `;

    modal.style.display = "block";
  });

  document.querySelector(".close").onclick = () => modal.style.display = "none";

  document.getElementById("confirmBooking").onclick = () => {

    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(
      `Bonjour,\n\nNous souhaitons réserver Villa CABOUA :\n` +
      `Dates : ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}\n` +
      `Adultes : ${adults}\n` +
      `Enfants : ${children}\n\nMerci.`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;

    modal.style.display = "none";
  };

  // =========================
  // 📲 WhatsApp
  // =========================
  document.getElementById("whatsappFloat").addEventListener("click", () => {

    let msg = `Bonjour, je souhaite des informations pour Villa CABOUA.`;

    if (startDate && endDate) {
      msg = `Bonjour, je souhaite réserver Villa CABOUA du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adultes et ${children} enfants.`;
    }

    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`, "_blank");
  });

});
