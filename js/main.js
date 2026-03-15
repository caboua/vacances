 const AIRBNB_ICAL = "https://www.airbnb.fr/calendar/ical/1637653042244841736.ics?t=b597fb5a299a46d589ae14b6b03e3b13";

const calendarInput = document.getElementById('calendar');

async function fetchBusyDates() {

```
const proxy = "https://api.allorigins.win/raw?url=" + encodeURIComponent(AIRBNB_ICAL);

try {

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

            for(let d = new Date(start); d < end; d.setDate(d.getDate()+1)){

                disabled.push(new Date(d));

            }

        }

    });

    return disabled;

} catch(err){

    console.error("Erreur calendrier Airbnb", err);
    return [];

}
```

}

function parseDate(dateString){

```
const year = dateString.substring(0,4);
const month = dateString.substring(4,6)-1;
const day = dateString.substring(6,8);

return new Date(year,month,day);
```

}

async function initFlatpickr(){

```
const busyDates = await fetchBusyDates();

flatpickr(calendarInput,{

    locale:"fr",
    mode:"range",
    dateFormat:"d/m/Y",
    minDate:"today",
    disable:busyDates

});
```

}

initFlatpickr();
