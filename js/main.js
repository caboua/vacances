document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  let persons = 2;
  let babies = 0;

  const MAX_PERSONS = 6;
  const MAX_BABIES = 3;

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");
  const personCount = document.getElementById("personCount");
  const babyCount = document.getElementById("babyCount");

  if (!billing || !btn || !personCount || !babyCount) {
    console.error("Éléments de réservation introuvables");
    return;
  }

  const baseText = `
    <p><strong>À partir de 120 € / nuit pour 2 personnes</strong></p>
    <p>Minimum 2 nuits.</p>
    <p>Bébé de moins de 2 ans gratuit en lit parapluie, maximum 3 bébés.</p>
  `;

  billing.innerHTML = baseText;

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

  fetch(
    "https://api.allorigins.win/raw?url=" +
    encodeURIComponent(
      "https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics"
    )
  )
  .then((res) => res.text())
  .then((data) => {
    const events = data.split("BEGIN:VEVENT");

    events.forEach((event) => {
      const startMatch = event.match(/DTSTART[^:]*:(\d{8})/);
      const endMatch = event.match(/DTEND[^:]*:(\d{8})/);

      if (startMatch && endMatch) {
        const s = startMatch[1];
        const e = endMatch[1];

        let start = new Date(s.substr(0,4), s.substr(4,2)-1, s.substr(6,2));
        let end = new Date(e.substr(0,4), e.substr(4,2)-1, e.substr(6,2));

        while (start < end) {
          blockedDates.push(new Date(start));
          start.setDate(start.getDate() + 1);
        }
      }
    });

    fp.set("disable", blockedDates);
  })
  .catch((error) => {
    console.error("Erreur calendrier ICS :", error);
  });

  function getNightPrice(persons) {
    if (persons <= 2) return 120;
    if (persons === 3) return 140;
    if (persons === 4) return 160;
    if (persons === 5) return 180;
    if (persons === 6) return 200;
    return null;
  }

  function updatePrice() {
    if (!startDate || !endDate) {
      billing.innerHTML = baseText;
      return;
    }

    const nights = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (nights < 2) {
      billing.innerHTML = `
        ${baseText}
        <p style="color:red;"><strong>Minimum 2 nuits</strong></p>
      `;
      return;
    }

    const nightPrice = getNightPrice(persons);
    const total = nightPrice * nights;

    billing.innerHTML = `
      ${baseText}
      <p>Nombre de personnes : ${persons}</p>
      <p>Bébés de moins de 2 ans : ${babies}</p>
      <p>${nights} nuit(s) x ${nightPrice} €</p>
      <h2>Total : ${total} €</h2>
      <p>Aucune charge supplémentaire.</p>
    `;
  }

  function updateCounters() {
    personCount.innerText = persons;
    babyCount.innerText = babies;
    updatePrice();
  }

  document.getElementById("personPlus")?.addEventListener("click", () => {
    if (persons < MAX_PERSONS) {
      persons++;
    } else {
      alert("Maximum 6 personnes, hors bébés de moins de 2 ans.");
    }
    updateCounters();
  });

  document.getElementById("personMinus")?.addEventListener("click", () => {
    if (persons > 1) persons--;
    updateCounters();
  });

  document.getElementById("babyPlus")?.addEventListener("click", () => {
    if (babies < MAX_BABIES) {
      babies++;
    } else {
      alert("Maximum 3 bébés de moins de 2 ans.");
    }
    updateCounters();
  });

  document.getElementById("babyMinus")?.addEventListener("click", () => {
    if (babies > 0) babies--;
    updateCounters();
  });

  function isBlocked(date) {
    return blockedDates.some(
      (d) => d.toDateString() === new Date(date).toDateString()
    );
  }

  function isRangeAvailable(start, end) {
    const current = new Date(start);

    while (current < end) {
      if (isBlocked(current)) return false;
      current.setDate(current.getDate() + 1);
    }

    return true;
  }

  function handleReservation(event) {
    if (event) event.preventDefault();

    if (!startDate || !endDate) {
      alert("Sélectionnez vos dates");
      return;
    }

    if (!isRangeAvailable(startDate, endDate)) {
      alert("❌ Dates indisponibles");
      return;
    }

    const nights = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (nights < 2) {
      alert("Minimum 2 nuits");
      return;
    }

    const nightPrice = getNightPrice(persons);
    const total = nightPrice * nights;

    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(`Bonjour,

Je souhaite réserver la Villa CABOUA à Bouillante en Guadeloupe.

Dates :
Du ${startDate.toLocaleDateString("fr-FR")}
au ${endDate.toLocaleDateString("fr-FR")}

Nombre de nuits : ${nights}

Nombre de personnes : ${persons}
Bébés de moins de 2 ans : ${babies}

Tarif :
${nights} nuit(s) x ${nightPrice} €

Total : ${total} €

Merci.`);

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  }

  btn.addEventListener("click", handleReservation, { passive:false });

  let touched = false;

  btn.addEventListener("touchend", (e) => {
    if (touched) return;

    touched = true;
    handleReservation(e);

    setTimeout(() => {
      touched = false;
    }, 500);
  }, { passive:false });

});
