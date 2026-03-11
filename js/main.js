let startDate,endDate,adults=2,children=0;
const MAX_ADULTS=6,MAX_TOTAL=8,NIGHT_PRICE=180,CLEANING=120,TAX_PER_ADULT=1.5,PHONE="590690520616";

const calendarInput=document.getElementById('calendar');
const adultMinus=document.getElementById('adultMinus');
const adultPlus=document.getElementById('adultPlus');
const adultCount=document.getElementById('adultCount');
const childMinus=document.getElementById('childMinus');
const childPlus=document.getElementById('childPlus');
const childCount=document.getElementById('childCount');
const billing=document.getElementById('billing');

// Counter boutons
function updateButtons(){
  adultMinus.disabled=adults<=1;
  adultPlus.disabled=adults>=MAX_ADULTS || adults+children>=MAX_TOTAL;
  childMinus.disabled=children<=0;
  childPlus.disabled=adults+children>=MAX_TOTAL;
}

function changeAdult(n){
  let na=adults+n;
  if(na<1||na>MAX_ADULTS||na+children>MAX_TOTAL) return;
  adults=na; adultCount.innerText=adults; updateButtons(); calculate();
}

function changeChild(n){
  let nc=children+n;
  if(nc<0||adults+nc>MAX_TOTAL) return;
  children=nc; childCount.innerText=children; updateButtons(); calculate();
}

// Calcul
function calculate(){
  if(!startDate||!endDate) return 0;
  let nights=(endDate-startDate)/(1000*60*60*24);
  let subtotal=nights*NIGHT_PRICE;
  let tax=adults*TAX_PER_ADULT;
  let total=subtotal+CLEANING+tax;
  billing.innerHTML=`<div class="billing-line"><span>${nights} nuits</span><span>${subtotal.toFixed(2)} €</span></div>
  <div class="billing-line"><span>Taxe séjour</span><span>${tax.toFixed(2)} €</span></div>
  <div class="billing-line"><span>Ménage</span><span>${CLEANING.toFixed(2)} €</span></div>
  <hr><div class="billing-line total"><span>Total</span><span>${total.toFixed(2)} €</span></div>`;
  return total;
}

// Flatpickr basique
flatpickr(calendarInput,{locale:"fr",mode:"range",dateFormat:"d/m/Y",minDate:"today",
onChange:function(d){if(d.length===2){startDate=d[0];endDate=d[1];calculate();}}});

updateButtons();

// WhatsApp
document.getElementById("whatsappFloat").addEventListener("click",()=>{
  let msg=`Bonjour, je souhaite des infos pour Villa CABOUA.`;
  if(startDate && endDate){
    let s=startDate.toLocaleDateString("fr-FR");
    let e=endDate.toLocaleDateString("fr-FR");
    msg=`Bonjour, je souhaite réserver Villa CABOUA du ${s} au ${e} pour ${adults} adulte(s) et ${children} enfant(s).`;
  }
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,"_blank");
});
