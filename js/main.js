document.addEventListener("DOMContentLoaded", () => {

  let startDate = null;
  let endDate = null;
  let blockedDates = [];

  const billing = document.getElementById("billing");
  const btn = document.getElementById("checkoutButton");

  // ========================
  // 📅 INITIALISATION FLATPICKR
  // ========================
  const fp = flatpickr("#calendar", {
    locale: "fr",
    mode: "range",
    inline: true,
    minDate: "today",
    dateFormat: "d/m/Y",
    disableMobile: true,
    disable: [],       // vide au départ
    onChange: function(selectedDates) {
      if (selectedDates.length === 2) {
        startDate = selectedDates[0];
        endDate = selectedDates[1];

        // Calcul nombre de nuits
        let nights = (endDate - startDate) / (1000*60*60*24);
        if(nights < 4){
          billing.innerHTML = `<div class="billing-line">Minimum 4 nuits</div>`;
          return;
        }

        // Calcul total
        const adults = parseInt(document.getElementById("adultCount").textContent);
        const children = parseInt(document.getElementById("childCount").textContent);
        const people = adults + children;
        const total = nights*140 + 1.5*people + 120; // 140€/nuit + 1.5€/personne + 120€ ménage

        billing.innerHTML = `
          <div class="billing-line"><span>${nights} nuits</span><span>${nights*140} €</span></div>
          <div class="billing-line"><span>Frais ménage</span><span>120 €</span></div>
          <div class="billing-line"><span>Taxe/personne</span><span>${(1.5*people).toFixed(2)} €</span></div>
          <div class="billing-line total"><span>Total</span><span>${total.toFixed(2)} €</span></div>
        `;
      }
    }
  });

  // ========================
  // 🔴 CHARGER DATES BLOQUEES ICS EN BACKGROUND
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
          s.setDate(s.getDate()+1);
        }
      }
    });

    // 🔥 update Flatpickr après chargement
    fp.set("disable", blockedDates);
    fp.redraw();
  })
  .catch(err => console.log("Erreur ICS :", err));

  // ========================
  // 🔴 VERIFICATION DISPONIBILITE
  // ========================
  function isBlocked(date){
    return blockedDates.some(d => new Date(d).toDateString() === new Date(date).toDateString());
  }

  function isRangeAvailable(start, end){
    let current = new Date(start);
    while(current <= end){
      if(isBlocked(current)) return false;
      current.setDate(current.getDate()+1);
    }
    return true;
  }

  // ========================
  // 🔴 CONTROLE BOUTON RESERVER
  // ========================
  btn.onclick = function(e){
    e.preventDefault();

    if(!startDate || !endDate){
      alert("Veuillez sélectionner vos dates");
      return;
    }

    if(!isRangeAvailable(startDate,endDate)){
      alert("❌ Indisponible pour cette période");
      return;
    }

    const adults = parseInt(document.getElementById("adultCount").textContent);
    const children = parseInt(document.getElementById("childCount").textContent);
    const people = adults + children;

    const nights = (endDate - startDate)/(1000*60*60*24);
    const total = nights*140 + 1.5*people + 120;

    const subject = encodeURIComponent("Réservation Villa CABOUA");
    const body = encodeURIComponent(
      `Bonjour,\n\nNous souhaitons réserver du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${people} personnes.\nTotal: ${total.toFixed(2)} €`
    );

    window.location.href = `mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
  };

  // ========================
  // 🔴 CONTROLE ADULTES / ENFANTS
  // ========================
  const adultMinus = document.getElementById("adultMinus");
  const adultPlus = document.getElementById("adultPlus");
  const childMinus = document.getElementById("childMinus");
  const childPlus = document.getElementById("childPlus");

  adultMinus.onclick = ()=>{ 
    let v = parseInt(document.getElementById("adultCount").textContent);
    if(v>1) document.getElementById("adultCount").textContent = v-1;
  };
  adultPlus.onclick = ()=>{ 
    let v = parseInt(document.getElementById("adultCount").textContent);
    if(v<6) document.getElementById("adultCount").textContent = v+1;
  };
  childMinus.onclick = ()=>{ 
    let v = parseInt(document.getElementById("childCount").textContent);
    if(v>0) document.getElementById("childCount").textContent = v-1;
  };
  childPlus.onclick = ()=>{ 
    let v = parseInt(document.getElementById("childCount").textContent);
    if(v<2) document.getElementById("childCount").textContent = v+1;
  };

});
