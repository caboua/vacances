document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");

  // CALENDRIER
  const fp = flatpickr("#calendar", {
    locale: "fr",
    inline: true,
    mode: "range",
    minDate: "today",
    dateFormat: "d/m/Y",
    disableMobile: true,
    disable: []
  });

  // CHARGEMENT ICS
  fetch("https://api.allorigins.win/raw?url=" +
    encodeURIComponent("https://calendar.google.com/calendar/ical/ds98qjiuc1uqumr9dc1nnaoag24pqfsa%40import.calendar.google.com/public/basic.ics")
  )
  .then(res => res.text())
  .then(text => {

    const lines = text.split("\n");
    let start, end;

    lines.forEach(line => {
      if(line.includes("DTSTART")) start = line.split(":")[1];
      if(line.includes("DTEND")){
        end = line.split(":")[1];

        let s = new Date(start.substring(0,4), start.substring(4,6)-1, start.substring(6,8));
        let e = new Date(end.substring(0,4), end.substring(4,6)-1, end.substring(6,8));

        while(s < e){
          blockedDates.push(new Date(s));
          s.setDate(s.getDate()+1);
        }
      }
    });

    fp.set("disable", blockedDates);
    fp.redraw();

  });

  // SELECTION DATES
  fp.config.onChange.push(function(selectedDates){

    if(selectedDates.length === 2){
      startDate = selectedDates[0];
      endDate = selectedDates[1];

      let nights = (endDate - startDate)/(1000*60*60*24);

      if(nights < 4){
        billing.innerHTML = "Minimum 4 nuits";
        return;
      }

      const adults = parseInt(document.getElementById("adultCount").textContent);
      const children = parseInt(document.getElementById("childCount").textContent);
      const people = adults + children;

      const total = nights*140 + people*1.5 + 120;

      billing.innerHTML = `
        <p>${nights} nuits</p>
        <p>Ménage: 120€</p>
        <p>Taxe: ${(people*1.5).toFixed(2)}€</p>
        <h3>Total: ${total.toFixed(2)}€</h3>
      `;
    }
  });

  // VERIFICATION
  function isBlocked(date){
    return blockedDates.some(d => d.toDateString() === date.toDateString());
  }

  function isRangeAvailable(start,end){
    let current = new Date(start);
    while(current <= end){
      if(isBlocked(current)) return false;
      current.setDate(current.getDate()+1);
    }
    return true;
  }

  // RESERVATION
  btn.onclick = function(e){
    e.preventDefault();

    if(!startDate || !endDate){
      alert("Choisir dates");
      return;
    }

    if(!isRangeAvailable(startDate,endDate)){
      alert("Indisponible");
      return;
    }

    const adults = parseInt(document.getElementById("adultCount").textContent);
    const children = parseInt(document.getElementById("childCount").textContent);
    const people = adults + children;

    const nights = (endDate - startDate)/(1000*60*60*24);
    const total = nights*140 + people*1.5 + 120;

    const body = encodeURIComponent(
      `Bonjour,\nRéservation du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}\nPersonnes: ${people}\nTotal: ${total.toFixed(2)}€`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=Reservation&body=${body}`;
  };

  // COMPTEURS
  document.getElementById("adultPlus").onclick = () => {
    let el = document.getElementById("adultCount");
    el.textContent = Math.min(6, parseInt(el.textContent)+1);
  };

  document.getElementById("adultMinus").onclick = () => {
    let el = document.getElementById("adultCount");
    el.textContent = Math.max(1, parseInt(el.textContent)-1);
  };

  document.getElementById("childPlus").onclick = () => {
    let el = document.getElementById("childCount");
    el.textContent = Math.min(2, parseInt(el.textContent)+1);
  };

  document.getElementById("childMinus").onclick = () => {
    let el = document.getElementById("childCount");
    el.textContent = Math.max(0, parseInt(el.textContent)-1);
  };

});
