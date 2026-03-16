document.addEventListener("DOMContentLoaded", async () => {

const calendarInput = document.getElementById("calendar");

const AIRBNB_ICAL =
"https://www.airbnb.fr/calendar/ical/1637653042244841736.ics";

const proxy =
"https://api.allorigins.win/raw?url=" + encodeURIComponent(AIRBNB_ICAL);


async function getBusyDates(){

try{

const res = await fetch(proxy);

const text = await res.text();

const events = text.split("BEGIN:VEVENT");

const disabled = [];

events.forEach(event => {

const startMatch = event.match(/DTSTART.*:(\d{8})/);
const endMatch = event.match(/DTEND.*:(\d{8})/);

if(startMatch && endMatch){

const start = parseDate(startMatch[1]);
const end = parseDate(endMatch[1]);

for(let d=new Date(start); d<end; d.setDate(d.getDate()+1)){

disabled.push(new Date(d));

}

}

});

return disabled;

}

catch(e){

console.error("Erreur calendrier Airbnb",e);
return [];

}

}


function parseDate(str){

const y = str.substring(0,4);
const m = str.substring(4,6)-1;
const d = str.substring(6,8);

return new Date(y,m,d);

}


const busyDates = await getBusyDates();

flatpickr(calendarInput,{

locale:"fr",
mode:"range",
dateFormat:"d/m/Y",
minDate:"today",
disable:busyDates

});

});
