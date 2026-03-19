document.addEventListener("DOMContentLoaded", async () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  let adults = 2;
  let children = 0;

  const billing = document.getElementById("billing");

  const NIGHT_PRICE = 140;
  const CLEANING = 120;
  const TAX = 1.5;
  const MIN_NIGHTS = 4;

  // ============================
  // 🔴 CHARGER ICS AVANT TOUT
  // ============================
  async function loadBlockedDates() {

    try {
      const res = await fetch("https://api.allorigins.win/raw?url=" +
        encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics")
      );

      const text = await res.text();

      const lines = text.split("\n");
      let start, end;

      lines.forEach(line => {
        if (line.includes("DTSTART")) start = line.split(":")[1];
        if (line.includes("DTEND")) {
          end = line.split(":")[1];

          let s = new Date(start.substring(0,4), start.substring(4,6)-1, start.substring(6,8));
          let e = new Date(end.substring(0,4), end.substring(4,6)-1, end.substring(6,8));

          while (s < e) {
            blockedDates.push(new Date(s));
            s.setDate(s.getDate()+1);
          }
        }
      });

      console.log("Dates chargées :", blockedDates.length);

    } catch (err) {
      console.log("Erreur ICS :", err);
    }
  }

  await loadBlockedDates(); // 🔥 IMPORTANT

  // ============================
  // 📅 INITIALISATION CALENDRIER
  // ============================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    inline: true,
    mode: "range",
    minDate: "today",
    dateFormat: "d/m/Y",
    disableMobile: true,
    disable: blockedDates,

    onChange: function(selectedDates){
      if(selectedDates.length === 2){
        startDate = selectedDates[0];
        endDate = selectedDates[1];
        updatePrice();
      }
    }
  });

  // ============================
  // 💰 PRIX
  // ============================
  function updatePrice(){

    if(!startDate || !endDate) return;

    let nights = (endDate - startDate)/(1000*60*60*24);

    if(nights < MIN_NIGHTS){
      billing.innerHTML = `<p style="color:red;">Minimum ${MIN_NIGHTS} nuits</p>`;
      return;
    }

    let totalNights = nights * NIGHT_PRICE;
    let tax = (adults + children) * TAX;
    let total = totalNights + tax + CLEANING;

    billing.innerHTML = `
      <div class="billing-line"><span>${nights} nuits</span><span>${totalNights} €</span></div>
      <div class="billing-line"><span>Taxe</span><span>${tax.toFixed(2)} €</span></div>
      <div class="billing-line"><span>Ménage</span><span>${CLEANING} €</span></div>
      <div class="billing-line total"><span>Total</span><span>${total.toFixed(2)} €</span></div>
    `;
  }

  // ============================
  // 👨‍👩‍👧 COMPTEURS
  // ============================
  document.getElementById("adultPlus").onclick = () => {
    if(adults < 6){ adults++; document.getElementById("adultCount").innerText = adults; updatePrice(); }
  };

  document.getElementById("adultMinus").onclick = () => {
    if(adults > 1){ adults--; document.getElementById("adultCount").innerText = adults; updatePrice(); }
  };

  document.getElementById("childPlus").onclick = () => {
    if(adults + children < 8){ children++; document.getElementById("childCount").innerText = children; updatePrice(); }
  };

  document.getElementById("childMinus").onclick = () => {
    if(children > 0){ children--; document.getElementById("childCount").innerText = children; updatePrice(); }
  };

  // ============================
  // 🔴 VERIF DISPO
  // ============================
  function isBlocked(date){
    return blockedDates.some(d => d.toDateString() === date.toDateString());
  }

  function isAvailable(start,end){
    let d = new Date(start);
    while(d < end){
      if(isBlocked(d)) return false;
      d.setDate(d.getDate()+1);
    }
    return true;
  }

  // ============================
  // 📩 RESERVER
  // ============================
  document.getElementById("checkoutButton").onclick = function(){

    if(!startDate || !endDate){
      alert("Choisissez vos dates");
      return;
    }

    let nights = (endDate - startDate)/(1000*60*60*24);

    if(nights < MIN_NIGHTS){
      alert(`Minimum ${MIN_NIGHTS} nuits`);
      return;
    }

    if(!isAvailable(startDate,endDate)){
      alert("❌ Indisponible pour cette période");
      return;
    }

    let total = (nights * NIGHT_PRICE) + ((adults+children)*TAX) + CLEANING;

    window.location.href =
      `mailto:villa.caboua@gmail.com?subject=Réservation&body=Bonjour,%0D%0A%0D%0AJe souhaite réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}%0D%0AAdultes: ${adults}%0D%0AEnfants: ${children}%0D%0ATotal: ${total.toFixed(2)} €`;
  };

  // ============================
  // 💬 WHATSAPP
  // ============================
  document.getElementById("whatsappFloat").onclick = function(){

    let msg = "Bonjour, je souhaite des informations.";

    if(startDate && endDate){
      msg = `Bonjour, réservation du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} (${adults} adultes, ${children} enfants)`;
    }

    window.open("https://wa.me/590690520616?text=" + encodeURIComponent(msg));
  };

});
