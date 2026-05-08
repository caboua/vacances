document.addEventListener("DOMContentLoaded", () => {
  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  let adults = 2;
  let children = 0;
  let babies = 0;

  const MAX_PERSONS = 6;
  const MAX_BABIES = 3;

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");
  const adultCount = document.getElementById("adultCount");
  const childCount = document.getElementById("childCount");

  if (!billing || !btn || !adultCount || !childCount) {
    console.error("Éléments de réservation introuvables");
    return;
  }

  const baseText = `
    <p><strong>À partir de 120 € / nuit pour 2 personnes</strong></p>
    <p>Bébé de moins de 2 ans gratuit en lit parapluie, maximum 3 bébés.</p>
  `;

  billing.innerHTML = baseText;

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
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];
        updatePrice();
      }
    }
  });

  // =========================
  // 🔴 CHARGEMENT ICS
  // =========================
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
        const startMatch = event.match(/DTSTART:(\d{8})/);
        const endMatch = event.match(/DTEND:(\d{8})/);

        if (startMatch && endMatch) {
          const s = startMatch[1];
          const e = endMatch[1];

          let start = new Date(
            s.substr(0, 4),
            s.substr(4, 2) - 1,
            s.substr(6, 2)
          );

          let end = new Date(
            e.substr(0, 4),
            e.substr(4, 2) - 1,
            e.substr(6, 2)
          );

          while (start < end) {
            blockedDates.push(new Date(start));
            start.setDate(start.getDate() + 1);
          }
        }
      });

      fp.set("disable", blockedDates);
    })
    .catch((error) => {
      console.error("Erreur de chargement du calendrier ICS :", error);
    });

  // =========================
  // 💰 TARIF PAR NUIT
  // =========================
  function getNightPrice(persons) {
    if (persons <= 2) return 120;
    if (persons === 3) return 140;
    if (persons === 4) return 160;
    if (persons === 5) return 180;
    if (persons === 6) return 200;
    return null;
  }

  // =========================
  // 💰 CALCUL PRIX
  // =========================
  function updatePrice() {
    const persons = adults + children;

    if (persons > MAX_PERSONS) {
      billing.innerHTML = `
        ${baseText}
        <p style="color:red;">
          La villa accueille maximum 6 personnes, hors bébés de moins de 2 ans dormant dans un lit parapluie.
        </p>
      `;
      return;
    }

    if (!startDate || !endDate) {
      billing.innerHTML = baseText;
      return;
    }

    const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);

    if (nights < 2) {
      billing.innerHTML = `
        ${baseText}
        <p style="color:red;">Minimum 2 nuits</p>
      `;
      return;
    }

    const nightPrice = getNightPrice(persons);
    const total = nightPrice * nights;

    billing.innerHTML = `
      ${baseText}
      <p>Nombre de personnes : ${persons}</p>
      <p>${nights} nuit(s) x ${nightPrice} €</p>
      <h2>Total : ${total} €</h2>
      <p>Aucune charge supplémentaire.</p>
    `;
  }

  // =========================
  // 👨‍👩‍👧 COMPTEURS
  // =========================
  function updateCounters() {
    adultCount.innerText = adults;
    childCount.innerText = children;
    updatePrice();
  }

  document.getElementById("adultPlus")?.addEventListener("click", () => {
    if (adults + children < MAX_PERSONS) {
      adults++;
    } else {
      alert("Maximum 6 personnes, hors bébés de moins de 2 ans.");
    }

    updateCounters();
  });

  document.getElementById("adultMinus")?.addEventListener("click", () => {
    if (adults > 1) adults--;
    updateCounters();
  });

  document.getElementById("childPlus")?.addEventListener("click", () => {
    if (adults + children < MAX_PERSONS) {
      children++;
    } else {
      alert("Maximum 6 personnes, hors bébés de moins de 2 ans.");
    }

    updateCounters();
  });

  document.getElementById("childMinus")?.addEventListener("click", () => {
    if (children > 0) children--;
    updateCounters();
  });

  // =========================
  // 🔴 VERIF DISPONIBILITÉ
  // =========================
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

  // =========================
  // 📩 RESERVATION
  // =========================
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

    const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);

    if (nights < 2) {
      alert("Minimum 2 nuits");
      return;
    }

    const persons = adults + children;
    const nightPrice = getNightPrice(persons);
    const total = nightPrice * nights;

    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(
      `Bonjour,

Je souhaite réserver la Villa CABOUA du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.

Nombre de nuits : ${nights}
Adultes : ${adults}
Enfants : ${children}
Bébés de moins de 2 ans : à préciser

Tarif : ${nights} nuit(s) x ${nightPrice} €
Total : ${total} €

Merci.`
    );

    const mailtoLink = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
  }

  btn.addEventListener("click", handleReservation, { passive: false });

  let touched = false;

  btn.addEventListener(
    "touchend",
    (e) => {
      if (touched) return;

      touched = true;
      handleReservation(e);

      setTimeout(() => {
        touched = false;
      }, 500);
    },
    { passive: false }
  );
});
