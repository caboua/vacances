document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");
  const adultMinus = document.getElementById("adultMinus");
  const adultPlus = document.getElementById("adultPlus");
  const childMinus = document.getElementById("childMinus");
  const childPlus = document.getElementById("childPlus");
  const adultCountEl = document.getElementById("adultCount");
  const childCountEl = document.getElementById("childCount");

  let adults = parseInt(adultCountEl.textContent);
  let children = parseInt(childCountEl.textContent);

  // ========================
  // 📅 CALENDRIER FLATPICKR - MOIS ENTIER
  // ========================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    mode: "range",
    inline: true,           
    minDate: "today",
    dateFormat: "d/m/Y",
    showMonths: 1,
    disableMobile: true,
    onReady: function(selectedDates, dateStr, instance) {
      instance.calendarContainer.style.width = "100%";
      instance.calendarContainer.style.maxWidth = "400px";
    },
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
      if(line.includes("DTSTART")) start = line.split(":")[1].trim();
      if(line.includes("DTEND")){
        end = line.split(":")[1].trim();

        let s = new Date(start.substring(0,4), start.substring(4,6)-1, start.substring(6,8));
        let e = new Date(end.substring(0,4), end.substring(4,6)-1, end.substring(6,8));

        while(s < e){
          blockedDates.push(new Date(s.toDateString()));
          s.setDate(s.getDate() + 1);
        }
      }
    });

    fp.set("disable", blockedDates);
  })
  .catch(err => console.log("Erreur ICS :", err));

  // ========================
  // 🔴 COMPTEURS
  // ========================
  adultMinus.onclick = () => { if(adults > 1) { adults--; adultCountEl.textContent = adults; updateBilling(); } };
  adultPlus.onclick = () => { if(adults < 6) { adults++; adultCountEl.textContent = adults; updateBilling(); } };
  childMinus.onclick = () => { if(children > 0) { children--; childCountEl.textContent = children; updateBilling(); } };
  childPlus.onclick = () => { if(children < 8 - adults) { children++; childCountEl.textContent = children; updateBilling(); } };

  // ========================
  // 🔴 FONCTION FACTURATION
  // ========================
  function updateBilling() {
    if(!startDate || !endDate) return;
    const nights = (endDate - startDate) / (1000*60*60*24);
    const total = nights * (adults * 20 + children * 10); // exemple: adultes 20€/nuit, enfants 10€/nuit
    billing.innerHTML = `
      <div class="billing-line">
        <span>${nights} nuits</span>
        <span>${total} €</span>
      </div>
      <div class="billing-line">
        <span>Adultes: ${adults}</span>
        <span>Enfants: ${children}</span>
      </div>
    `;
  }

  // ========================
  // 🔴 VERIF DISPO
  // ========================
  function isBlocked(date){
    return blockedDates.some(d => new Date(d).toDateString() === new Date(date).toDateString());
  }

  function isRangeAvailable(start, end){
    let current = new Date(start);
    while(current < end){
      if(isBlocked(current)) return false;
      current.setDate(current.getDate() + 1);
    }
    return true;
  }

  // ========================
  // 🔴 BOUTON RESERVER
  // ========================
  btn.onclick = function(e){
    e.preventDefault();

    if(!startDate || !endDate){
      alert("Veuillez sélectionner vos dates");
      return;
    }

    if(!isRangeAvailable(startDate, endDate)){
      alert("❌ Indisponible pour cette période");
      return;
    }

    const nights = (endDate - startDate) / (1000*60*60*24);
    const total = nights * (adults * 20 + children * 10);

    const summary = `
Séjour: ${startDate.toLocaleDateString("fr-FR")} → ${endDate.toLocaleDateString("fr-FR")}
Nuits: ${nights}
Adultes: ${adults}, Enfants: ${children}
Total: ${total} €
    `;
    alert(summary); // affiche le résumé avant le mail

    const subject = encodeURIComponent("Réservation Villa CABOUA");
    const body = encodeURIComponent(`Bonjour,\n\nNous souhaitons réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.\n\n${summary}`);
    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  };

});
