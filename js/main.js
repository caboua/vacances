const fp = flatpickr("#calendar", {
  locale: "fr",
  mode: "range",
  inline: true,           // toujours visible, pas de popup natif
  minDate: "today",
  dateFormat: "d/m/Y",
  disableMobile: true,    // empêche le calendrier natif
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
