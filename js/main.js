document.addEventListener("DOMContentLoaded", function () {

let startDate = null
let endDate = null

let adults = 2
let children = 0

const NIGHT_PRICE = 140
const MIN_NIGHTS = 4
const CLEANING = 120
const TAX = 1.5

const billing = document.getElementById("billing")

flatpickr("#calendar", {

mode: "range",
locale: "fr",
minDate: "today",

onChange: function(selectedDates){

if(selectedDates.length === 2){

startDate = selectedDates[0]
endDate = selectedDates[1]

calculate()

}

}

})

function calculate(){

let nights = (endDate - startDate) / (1000*60*60*24)

if(nights < MIN_NIGHTS){

billing.innerHTML =
"<p style='color:red;font-weight:bold'>Minimum 4 nuits</p>"

return

}

let nightsPrice = nights * NIGHT_PRICE
let tax = adults * TAX * nights
let total = nightsPrice + CLEANING + tax

billing.innerHTML = `
<p>${nights} nuits × ${NIGHT_PRICE} € = ${nightsPrice.toFixed(2)} €</p>
<p>Taxe de séjour (${adults} adultes) : ${tax.toFixed(2)} €</p>
<p>Frais ménage : ${CLEANING} €</p>
<hr>
<p style="font-size:18px;font-weight:bold">
Total : ${total.toFixed(2)} €
</p>
`

}

})
