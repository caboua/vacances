let startDate, endDate
let adults = 2
let children = 0

const MAX_ADULTS = 6
const MAX_TOTAL = 8

const NIGHT_PRICE = 140
const MIN_NIGHTS = 4
const CLEANING = 120
const TAX = 1.5

const billing = document.getElementById("billing")

function updateButtons(){
document.getElementById("adultMinus").disabled = adults <= 1
document.getElementById("adultPlus").disabled = adults >= MAX_ADULTS || adults + children >= MAX_TOTAL

document.getElementById("childMinus").disabled = children <= 0
document.getElementById("childPlus").disabled = adults + children >= MAX_TOTAL
}

function changeAdult(n){
let na = adults + n
if(na < 1 || na > MAX_ADULTS || na + children > MAX_TOTAL) return
adults = na
document.getElementById("adultCount").innerText = adults
updateButtons()
calculate()
}

function changeChild(n){
let nc = children + n
if(nc < 0 || adults + nc > MAX_TOTAL) return
children = nc
document.getElementById("childCount").innerText = children
updateButtons()
calculate()
}

document.getElementById("adultMinus").onclick = ()=>changeAdult(-1)
document.getElementById("adultPlus").onclick = ()=>changeAdult(1)
document.getElementById("childMinus").onclick = ()=>changeChild(-1)
document.getElementById("childPlus").onclick = ()=>changeChild(1)

updateButtons()

function calculate(){

if(!startDate || !endDate) return

let nights = (endDate - startDate) / (1000*60*60*24)

if(nights < MIN_NIGHTS){
billing.innerHTML = `
<p style="color:red;font-weight:bold;">
Minimum ${MIN_NIGHTS} nuits
</p>
`
return
}

let nightsPrice = nights * NIGHT_PRICE
let tax = adults * TAX * nights
let total = nightsPrice + CLEANING + tax

billing.innerHTML = `

<div class="billing-line">
${nights} nuits x ${NIGHT_PRICE} €
<span>${nightsPrice.toFixed(2)} €</span>
</div>

<div class="billing-line">
Taxe de séjour (${adults} adultes)
<span>${tax.toFixed(2)} €</span>
</div>

<div class="billing-line">
Frais ménage
<span>${CLEANING} €</span>
</div>

<hr>

<div class="billing-total">
Total
<span>${total.toFixed(2)} €</span>
</div>
`
}

document.addEventListener("DOMContentLoaded",()=>{

const calendar = flatpickr("#calendar",{

mode:"range",
locale:"fr",
minDate:"today",
dateFormat:"d/m/Y",

onChange:function(selectedDates){

if(selectedDates.length === 2){

startDate = selectedDates[0]
endDate = selectedDates[1]

calculate()

}

}

})

})
