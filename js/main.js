document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  let adults = 2;
  let children = 0;

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");

  // =========================
  // 📅 CALENDRIER
  // =========================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    inline: true,
    mode: "range",
    minDate: "today",
    showMonths: 1,
    disableMobile: true,

    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];
        updatePrice();
      }
    }
  });

  // =========================
  // 🔴 CHARGEMENT ICS RAPIDE
  // =========================
  fetch("https://api.allorigins.win/raw?url=" +
    encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics")
  )
  .then(res => res.text())
  .then(data => {

    const events = data.split("BEGIN:VEVENT");

    events.forEach(event => {
      const startMatch = event.match(/DTSTART:(\d{8})/);
      const endMatch = event.match(/DTEND:(\d{8})/);

      if (startMatch && endMatch) {
        let s = startMatch[1];
        let e = endMatch[1];

        let start = new Date(s.substr(0,4), s.substr(4,2)-1, s.substr(6,2));
        let end = new Date(e.substr(0,4), e.substr(4,2)-1, e.substr(6,2));

        while (start < end) {
          blockedDates.push(new Date(start));
          start.setDate(start.getDate()+1);
        }
      }
    });

    fp.set("disable", blockedDates);

  });

  // =========================
  // 💰 CALCUL PRIX
  // =========================
  function updatePrice() {

    if (!startDate || !endDate) return;

    let nights = (endDate - startDate) / (1000*60*60*24);

    if (nights < 4) {
      billing.innerHTML = "<p>Minimum 4 nuits</p>";
      return;
    }

    let price = nights * 140;
    let taxe = (adults + children) * 1.5 * nights;
    let cleaning = 120;
    let total = price + taxe + cleaning;

    billing.innerHTML = `
      <p>${nights} nuits : ${price} €</p>
      <p>Taxe : ${taxe.toFixed(2)} €</p>
      <p>Ménage : ${cleaning} €</p>
      <h2>Total : ${total.toFixed(2)} €</h2>
    `;
  }

  // =========================
  // 👨‍👩‍👧 COMPTEURS
  // =========================
  function updateCounters() {
    document.getElementById("adultCount").innerText = adults;
    document.getElementById("childCount").innerText = children;
    updatePrice();
  }

  document.getElementById("adultPlus").onclick = () => {
    if (adults < 6) adults++;
    updateCounters();
  };

  document.getElementById("adultMinus").onclick = () => {
    if (adults > 1) adults--;
    updateCounters();
  };

  document.getElementById("childPlus").onclick = () => {
    if (adults + children < 8) children++;
    updateCounters();
  };

  document.getElementById("childMinus").onclick = () => {
    if (children > 0) children--;
    updateCounters();
  };

  // =========================
  // 🔴 VERIF DISPONIBILITÉ
  // =========================
  function isBlocked(date) {
    return blockedDates.some(d =>
      d.toDateString() === new Date(date).toDateString()
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

  // =========================
  // 📩 RESERVATION
  // =========================
  btn.onclick = function(e) {

    e.preventDefault();

    if (!startDate || !endDate) {
      alert("Sélectionnez vos dates");
      return;
    }

    if (!isRangeAvailable(startDate, endDate)) {
      alert("❌ Dates indisponibles");
      return;
    }

    let nights = (endDate - startDate) / (1000*60*60*24);

    if (nights < 4) {
      alert("Minimum 4 nuits");
      return;
    }

    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(
      `Bonjour,\n\nNous souhaitons réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.\n\nAdultes: ${adults}\nEnfants: ${children}`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  };

});
document.getElementById("whatsappFloat").onclick = () => {

    let msg = "Bonjour je souhaite des infos pour Villa CABOUA";

    if(startDate && endDate){
        msg = `Bonjour, je souhaite faire une réservation du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s)`;
    }

    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`, "_blank");
};

});

