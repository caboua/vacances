const AIRBNB_ICAL = "https://www.airbnb.fr/calendar/ical/1637653042244841736.ics?t=b597fb5a299a46d589ae14b6b03e3b13";

const calendarInput = document.getElementById('calendar');

async function fetchBusyDates() {

    const proxy = "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(AIRBNB_ICAL);

    try {

        const response = await fetch(proxy);
        const text = await response.text();

        const events = text.split("BEGIN:VEVENT");

        const disabledDates = [];

        events.forEach(event => {

            const startMatch = event.match(/DTSTART.*:(\d{8})/);
            const endMatch = event.match(/DTEND.*:(\d{8})/);

            if(startMatch && endMatch){

                const start = parseDate(startMatch[1]);
                const end = parseDate(endMatch[1]);

                for(let d = new Date(start); d < end; d.setDate(d.getDate()+1)){

                    disabledDates.push(new Date(d));

                }

            }

        });

        return disabledDates;

    } catch(error){

        console.error("Erreur calendrier Airbnb :", error);
        return [];

    }

}

function parseDate(dateStr){

    const year = dateStr.substring(0,4);
    const month = dateStr.substring(4,6) - 1;
    const day = dateStr.substring(6,8);

    return new Date(year, month, day);

}

async function initFlatpickr(){

    const busyDates = await fetchBusyDates();

    flatpickr(calendarInput, {

        locale: "fr",
        mode: "range",
        dateFormat: "d/m/Y",
        minDate: "today",
        disable: busyDates

    });

}

initFlatpickr();
