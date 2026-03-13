document.addEventListener("DOMContentLoaded", () => {
  const ICAL_URL = "https://www.airbnb.fr/calendar/ical/1637653042244841736.ics?t=b597fb5a299a46d589ae14b6b03e3b13";
  const NIGHT_PRICE = 140;
  const CLEANING = 120;
  const TAX_PER_ADULT = 1.5;
  const MIN_NIGHTS = 4;
  const MAX_ADULTS = 6;
  const MAX_TOTAL = 8;

  let startDate, endDate, adults = 2, children = 0;
  const calendarInput = document.getElementById("calendar");
  const billing = document.getElementById("billing");

  // ===== PARSE iCal Airbnb =====
  async function fetchBusyDates() {
    try {
      const res = await fetch(ICAL_URL);
      const text = await res.text();
      const jcalData = ICAL.parse(text);
      const comp = new ICAL.Component(jcalData);
      const events = comp.getAllSubcomponents("vevent");
      const disabled = [];

      events.forEach(ev => {
        const e = new ICAL.Event(ev);
        let current = e.startDate.toJSDate();
        const end = e.endDate.toJSDate();
        while(current < end){
          disabled.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });
      return disabled;
    } catch(err){
      console.error("Erreur parsing iCal :", err);
      return [];
    }
  }

  async function initFlatpickr() {
    const busyDates = await fetchBusyDates();
    flatpickr(calendarInput, {
      locale: "fr",
      mode: "range",
      dateFormat: "d/m/Y",
      minDate: "today",
      disable: busyDates,
      disableMobile: true,
      onChange: function(selectedDates) {
        if(selectedDates.length === 2){
          startDate = selectedDates[0];
          endDate = selectedDates[1];
          updateBilling();
        }
      }
    });
  }
  initFlatpickr();

  // Compteurs
  const adultCountEl = document.getElementById("adultCount");
  const childCountEl = document.getElementById("childCount");

  function updateButtons() {
    document.getElementById("adultMinus").disabled = adults <= 1;
    document.getElementById("adultPlus").disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL;
    document.getElementById("childMinus").disabled = children <= 0;
    document.getElementById("childPlus").disabled = adults + children >= MAX_TOTAL;
  }

  function changeAdult(n){ let na=adults+n; if(na<1||na>MAX_ADULTS||na+children>MAX_TOTAL) return; adults=na; adultCountEl.textContent=adults; updateButtons(); updateBilling();}
  function changeChild(n){ let nc=children+n; if(nc<0||adults+nc>MAX_TOTAL) return; children=nc; childCountEl.textContent=children; updateButtons(); updateBilling();}
  document.getElementById("adultMinus").onclick = () => changeAdult(-1);
  document.getElementById("adultPlus").onclick = () => changeAdult(1);
  document.getElementById("childMinus").onclick = () => changeChild(-1);
  document.getElementById("childPlus").onclick = () => changeChild(1);
  updateButtons();

  // Facturation
  function updateBilling(){
    if(!startDate||!endDate){billing.innerHTML='';return;}
    let nights=Math.round((endDate-startDate)/(1000*60*60*24));
    if(nights<MIN_NIGHTS){billing.innerHTML=`<p style="color:red;">Minimum ${MIN_NIGHTS} nuits</p>`;return;}
    let subtotal=nights*NIGHT_PRICE;
    let tax=adults*TAX_PER_ADULT;
    let total=subtotal+CLEANING+tax;
    billing.innerHTML=`
      <div class="billing-line"><span>${nights} nuits</span><span>${subtotal.toFixed(2)} €</span></div>
      <div class="billing-line"><span>Taxe séjour</span><span>${tax.toFixed(2)} €</span></div>
      <div class="billing-line"><span>Ménage</span><span>${CLEANING.toFixed(2)} €</span></div>
      <hr>
      <div class="billing-line total"><span>Total</span><span>${total.toFixed(2)} €</span></div>
    `;
    return total;
  }

  // Modal
  const modal=document.getElementById("reservationModal");
  const summary=document.getElementById("reservationSummary");
  const closeBtn=document.querySelector(".close");
  const confirmBtn=document.getElementById("confirmBooking");

  document.getElementById("checkoutButton").addEventListener("click",()=>{
    const total=updateBilling();
    if(!startDate||!endDate||!total){alert(`Sélectionnez au moins ${MIN_NIGHTS} nuits valides`);return;}
    summary.innerHTML=`Du <b>${startDate.toLocaleDateString("fr-FR")}</b> au <b>${endDate.toLocaleDateString("fr-FR")}</b><br>
      <b>${adults}</b> adulte(s), <b>${children}</b> enfant(s)<br>
      Total estimé : <b>${total.toFixed(2)} €</b>`;
    modal.style.display="block";
  });

  closeBtn.onclick=()=>modal.style.display="none";
  window.onclick=e=>{if(e.target==modal)modal.style.display="none";}
  confirmBtn.onclick=()=>{
    const subject=encodeURIComponent("Réservation Villa CABOUA");
    const body=encodeURIComponent(`Bonjour,\n\nJe souhaite réserver Villa CABOUA :\nDates : ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}\nAdultes : ${adults}\nEnfants : ${children}\n\nMerci.`);
    window.location.href=`mailto:villa.caboua@gmail.com?subject=${subject}&body=${body}`;
    modal.style.display="none";
  }

  // WhatsApp
  document.getElementById("whatsappFloat").addEventListener("click",()=>{
    let msg=`Bonjour, je souhaite des infos pour Villa CABOUA.`;
    if(startDate&&endDate){msg=`Bonjour, je souhaite réserver Villa CABOUA du ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")} pour ${adults} adulte(s) et ${children} enfant(s).`;}
    window.open(`https://wa.me/590690520616?text=${encodeURIComponent(msg)}`,"_blank");
  });

});
