document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");

  // ========================
  // 📅 CALENDRIER (ouvre direct)
  // ========================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    mode: "range",
    minDate: "today",
    dateFormat: "d/m/Y",

    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];

        let nights = (endDate - startDate) / (1000*60*60*24);
        let total = nights * 140;

        billing.innerHTML = `
          <div class="billing-line">
            <span>${nights} nuits</span>
            <span>${total} €</span>
          </div>
        `;
      }
    }
  });

  // ========================
  // 🔴 CHARGER ICS (APRÈS)
  // ========================
  fetch("https://api.allorigins.win/raw?url=" +
    encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics")
  )
  .then(res => res.text())
  .then(text => {

    const lines = text.split("\n");

    let start, end;

    lines.forEach(line => {

      if (line.includes("DTSTART")) {
        start = line.split(":")[1].trim();
      }

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

    // 🔥 appliquer blocage APRÈS chargement
    fp.set("disable", blockedDates);

  })
  .catch(err => {
    console.log("Erreur ICS :", err);
  });

  // ========================
  // 🔴 VERIF DISPO
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
      current.setDate(current.getDate() + 1);
    }

    return true;
  }

  // ========================
  // 🔥 BOUTON RESERVER
  // ========================
  btn.onclick = function(e) {

    e.preventDefault();

    if (!startDate || !endDate) {
      alert("Veuillez sélectionner vos dates");
      return;
    }

    if (!isRangeAvailable(startDate, endDate)) {
      alert("❌ Indisponible pour cette période");
      return;
    }

    // ✅ OK → mail
    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(
      `Bonjour,\n\nNous souhaitons réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  };

});
