document.addEventListener("DOMContentLoaded", function(){
const calendarId = "a42682891ff3cdeba7e8d30c8deb71cd3e263aaf9d3d84b61cc4efb52f5a2c75@group.calendar.google.com"

const apiKey = "AIzaSyC8Vpze8e4-Mv3D5boiNszUj5-GIfIV5Vg"
  fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}`)
  disable: blockedDates
let price = 140
let taxe = 1.5
let minNights = 4

let adult = 2
let child = 0

const adultCount = document.getElementById("adultCount")
const childCount = document.getElementById("childCount")

document.getElementById("adultPlus").onclick = () => {
if(adult < 6){
adult++
adultCount.innerText = adult
}
}

document.getElementById("adultMinus").onclick = () => {
if(adult > 1){
adult--
adultCount.innerText = adult
}
}

document.getElementById("childPlus").onclick = () => {
if(adult + child < 8){
child++
childCount.innerText = child
}
}

document.getElementById("childMinus").onclick = () => {
if(child > 0){
child--
childCount.innerText = child
}
}

flatpickr("#calendar",{

mode:"range",

minDate:"today",

locale:"fr",

disableMobile:true,

onClose:function(selectedDates){

if(selectedDates.length === 2){

let nights = (selectedDates[1] - selectedDates[0]) / 86400000

if(nights < minNights){

alert("Minimum 4 nuits")

document.getElementById("billing").innerHTML = ""

return

}

let totalNuit = nights * price

let taxeTotal = (adult + child) * taxe * nights

let total = totalNuit + taxeTotal

document.getElementById("billing").innerHTML =

nights + " nuits : " + totalNuit + " €<br>" +

"Taxe séjour : " + taxeTotal.toFixed(2) + " €<br>" +

"<b>Total : " + total.toFixed(2) + " €</b>"

}

}

})

})
