document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  let adults = 2;
  let children = 0;

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");
  const whatsappBtn = document.getElementById("whatsappFloat");

  // ================= CALENDRIER =================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    inline: true,
    mode: "range",
    minDate: "today",

    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];
        updatePrice();
      }
    }
  });

  // ================= ICS =================
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

  // ================= PRIX =================
  function updatePrice() {

    if (!startDate || !endDate) return;

    let nights = (endDate - startDate) / (1000*60*60*24);

    let price = nights * 140;

    billing.innerHTML = `
      <p>${nights} nuits</p>
      <p>Total estimé : ${price} €</p>
    `;
  }

  // ================= COMPTEURS =================
  document.getElementById("adultPlus").onclick = () => {
    if (adults < 6) adults++;
    document.getElementById("adultCount").innerText = adults;
  };

  document.getElementById("adultMinus").onclick = () => {
    if (adults > 1) adults--;
    document.getElementById("adultCount").innerText = adults;
  };

  document.getElementById("childPlus").onclick = () => {
    if (adults + children < 8) children++;
    document.getElementById("childCount").innerText = children;
  };

  document.getElementById("childMinus").onclick = () => {
    if (children > 0) children--;
    document.getElementById("childCount").innerText = children;
  };

  // ================= EMAIL =================
  btn.onclick = function(e) {

    e.preventDefault();

    if (!startDate || !endDate) {
      alert("Sélectionnez vos dates");
      return;
    }

    const subject = encodeURIComponent("Réservation Villa CABOUA");

    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.\n\nAdultes: ${adults}\nEnfants: ${children}`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  };

  // ================= WHATSAPP =================
  whatsappBtn.onclick = function(e) {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert("Sélectionnez vos dates");
      return;
    }

    const message = `Bonjour, je souhaite réserver la villa du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}.`;

    const phone = "590690520616";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

});
