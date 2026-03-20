document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];
  let adults = 2;
  let children = 0;

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");
  const adultMinus = document.getElementById("adultMinus");
  const adultPlus = document.getElementById("adultPlus");
  const childMinus = document.getElementById("childMinus");
  const childPlus = document.getElementById("childPlus");
  const adultCount = document.getElementById("adultCount");
  const childCount = document.getElementById("childCount");

  const NIGHT_PRICE = 140;
  const CLEANING_FEE = 120;
  const TAX_PER_PERSON = 1.5;
  const MIN_NIGHTS = 4;

  // ========================
  // 📅 CALENDRIER FLATPICKR
  // ========================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    mode: "range",
    inline: true,
    minDate: "today",
    dateFormat: "d/m/Y",
    showMonths: 1,
    disableMobile: true,
    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];
        updateBilling();
      }
    }
  });

  // ========================
  // 🔴 CHARGER DATES BLOQUEES ICS
  // ========================
  fetch("https://api.allorigins.win/raw?url=" +
    encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics")
  )
  .then(res => res.text())
  .then(text => {

    const lines = text.split("\n");
    let start, end;

    lines.forEach(line => {
      if (line.includes("DTSTART")) start = line.split(":")[1].trim();
      if (line.includes("DTEND")) {
        end = line.split(":")[1].trim();

        let s = new Date(start.substring(0,4), start.substring(4,6)-1, start.substring(6,8));
        let e = new Date(end.substring(0,4), end.substring(4,6)-1, end.substring(6,8));

        while (s < e) {
          blockedDates.push(new Date(s.toDateString()));
          s.setDate(s.getDate()+1);
        }
      }
    });

    fp.set("disable", blockedDates);

  })
  .catch(err => console.log("Erreur ICS :", err));

  // ========================
  // 🔴 CALCUL ET AFFICHAGE PRIX
  // ========================
  function updateBilling() {
    if(!startDate || !endDate) return;

    const nights = Math.round((endDate - startDate)/(1000*60*60*24));
    if(nights < MIN_NIGHTS){
      billing.innerHTML = `<p style="color:red;">Séjour minimum ${MIN_NIGHTS} nuits</p>`;
      return;
    }

    const subtotal = nights * NIGHT_PRICE;
    const tax = (adults + children) * TAX_PER_PERSON;
    const total = subtotal + CLEANING_FEE + tax;

    billing.innerHTML = `
      <div class="billing-line">
        <span>${nights} nuits</span>
        <span>${subtotal} €</span>
      </div>
      <div class="billing-line">
        <span>Adultes: ${adults}</span>
        <span>Enfants: ${children}</span>
      </div>
      <div class="billing-line">
        <span>Frais ménage</span>
        <span>${CLEANING_FEE} €</span>
      </div>
      <div class="billing-line">
        <span>Taxe</span>
        <span>${tax.toFixed(2)} €</span>
      </div>
      <div class="billing-line total">
        <span>Total final</span>
        <span>${total.toFixed(2)} €</span>
      </div>
    `;
  }

  // ========================
  // 🔴 GESTION COUNTERS
  // ========================
  adultPlus.onclick = () => { if(adults<6){ adults++; adultCount.textContent = adults; updateBilling(); }};
  adultMinus.onclick = () => { if(adults>1){ adults--; adultCount.textContent = adults; updateBilling(); }};
  childPlus.onclick = () => { if(adults+children<8){ children++; childCount.textContent = children; updateBilling(); }};
  childMinus.onclick = () => { if(children>0){ children--; childCount.textContent = children; updateBilling(); }};

  // ========================
  // 🔴 VERIFICATION DISPO
  // ========================
  function isBlocked(date) {
    return blockedDates.some(d =>
      new Date(d).toDateString() === new Date(date).toDateString()
    );
  }

  function isRangeAvailable(start, end) {
    let current = new Date(start);
    while (current < end) {
      if (isBlocked(current)) return false;
      current.setDate(current.getDate()+1);
    }
    return true;
  }

  // ========================
  // 🔴 BOUTON RESERVER
  // ========================
  btn.onclick = function(e) {
    e.preventDefault();

    if(!startDate || !endDate){
      alert("Veuillez sélectionner vos dates");
      return;
    }

    const nights = Math.round((endDate - startDate)/(1000*60*60*24));
    if(nights < MIN_NIGHTS){
      alert(`Séjour minimum ${MIN_NIGHTS} nuits`);
      return;
    }

    if(!isRangeAvailable(startDate, endDate)){
      alert("❌ Indisponible pour cette période");
      return;
    }

    const subtotal = nights * NIGHT_PRICE;
    const tax = (adults + children) * TAX_PER_PERSON;
    const total = subtotal + CLEANING_FEE + tax;

    const subject = encodeURIComponent("Réservation Villa CABOUA");
    const body = encodeURIComponent(
      `Bonjour,\n\nNous souhaitons réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.\nAdultes: ${adults}\nEnfants: ${children}\nFrais ménage: ${CLEANING_FEE} €\nTaxe: ${tax.toFixed(2)} €\nTotal: ${total.toFixed(2)} €`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  };

});
