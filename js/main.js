document.addEventListener("DOMContentLoaded", () => {
  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  let adults = 2;
  let children = 0;

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");
  const adultCount = document.getElementById("adultCount");
  const childCount = document.getElementById("childCount");

  if (!billing || !btn || !adultCount || !childCount) {
    console.error("Éléments de réservation introuvables");
    return;
  }

  // 🏷️ Texte de base
  const baseText = `<p><strong>À partir de 110 € / nuit (2 personnes)</strong></p>`;
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

          let start = new Date(s.substr(0, 4), s.substr(4, 2) - 1, s.substr(6, 2));
          let end = new Date(e.substr(0, 4), e.substr(4, 2) - 1, e.substr(6, 2));

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
  // 💰 CALCUL PRIX
  // =========================
  function updatePrice() {
    if (!startDate || !endDate) {
      billing.innerHTML = baseText;
      return;
    }

    const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);

    if (nights < 2) {
      billing.innerHTML = baseText + `<p>Minimum 2 nuits</p>`;
      return;
    }

    // 💰 Base (2 adultes inclus)
    const basePrice = nights * 110;

    // ➕ Supplément à partir du 3ème adulte
    const extraAdults = adults > 2 ? adults - 2 : 0;
    const extraCost = extraAdults * 15 * nights;

    // 🧾 Taxe
    const taxe = (adults + children) * 1.5 * nights;

    // 🧹 Ménage
    const cleaning = 80;

    const total = basePrice + extraCost + taxe + cleaning;

    billing.innerHTML = `
      ${baseText}
      <p>${nights} nuits : ${basePrice} €</p>
      <p>Supplément adultes (${extraAdults}) : ${extraCost} €</p>
      <p>Taxe : ${taxe.toFixed(2)} €</p>
      <p>Ménage : ${cleaning} €</p>
      <h2>Total : ${total.toFixed(2)} €</h2>
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
    if (adults < 6) adults++;
    updateCounters();
  });

  document.getElementById("adultMinus")?.addEventListener("click", () => {
    if (adults > 1) adults--;
    updateCounters();
  });

  document.getElementById("childPlus")?.addEventListener("click", () => {
    if (adults + children < 8) children++;
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

    const subject = encodeURIComponent("Réservation Villa CABOUA");
    const body = encodeURIComponent(
      `Bonjour,

Nous souhaitons réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.

Adultes: ${adults}
Enfants: ${children}`
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
