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

/* calendrier */

flatpickr("#calendar", {

mode: "range",
locale: "fr",
minDate: "today",
dateFormat: "d/m/Y",

onChange: function(selectedDates){

if(selectedDates.length === 2){

startDate = selectedDates[0]
endDate = selectedDates[1]

calculate()

}

}

})

/* calcul prix */

function calculate(){

let nights = (endDate - startDate) / (1000*60*60*24)

if(nights < MIN_NIGHTS){

billing.innerHTML =
"<p style='color:red;font-weight:bold'>Minimum 4 nuits</p>"

return
}

let nightsPrice = nights * NIGHT_PRICE
let tax = adults * TAX * nights
let total = nightsPrice + tax + CLEANING

billing.innerHTML = `

<div>${nights} nuits × ${NIGHT_PRICE} € = ${nightsPrice.toFixed(2)} €</div>

<div>Taxe séjour (${adults} adultes) : ${tax.toFixed(2)} €</div>

<div>Frais ménage : ${CLEANING} €</div>

<hr>

<div style="font-weight:bold;font-size:18px">
Total : ${total.toFixed(2)} €
</div>

`

}

/* compteurs */

document.getElementById("adultMinus").onclick = function(){
if(adults > 1){
adults--
document.getElementById("adultCount").innerText = adults
calculate()
}
}

document.getElementById("adultPlus").onclick = function(){
if(adults < 6){
adults++
document.getElementById("adultCount").innerText = adults
calculate()
}
}

document.getElementById("childMinus").onclick = function(){
if(children > 0){
children--
document.getElementById("childCount").innerText = children
calculate()
}
}

document.getElementById("childPlus").onclick = function(){
if(children + adults < 8){
children++
document.getElementById("childCount").innerText = children
calculate()
}
}

})
