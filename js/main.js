document.addEventListener("DOMContentLoaded", async () => {

  const calendarInput = document.getElementById("calendar");
  const billing = document.getElementById("billing");

  let startDate, endDate;

  // 🔥 PROXY ICS (OBLIGATOIRE pour mobile)
  async function fetchBlockedDates() {
    try {
      const url = "https://api.allorigins.win/raw?url=" +
      encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics");

      const res = await fetch(url);
      const text = await res.text();

      const lines = text.split("\n");
      let dates = [];

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
            dates.push(new Date(s));
            s.setDate(s.getDate()+1);
          }
        }

      });

      return dates;

    } catch (e) {
      console.log("Erreur ICS :", e);
      return [];
    }
  }

  const blockedDates = await fetchBlockedDates();

  flatpickr("#calendar", {
    locale: "fr",
    mode: "range",
    minDate: "today",
    dateFormat: "d/m/Y",
    disable: blockedDates,

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

});
