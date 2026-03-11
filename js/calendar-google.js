const CALENDAR_ID = 'villa.caboua@gmail.com';
const API_KEY = 'AIzaSyC8Vpze8e4-Mv3D5boiNszUj5-GIfIV5Vg'; // ✅ Ta nouvelle clé
const calendarInput = document.getElementById('calendar');

async function fetchBusyDates() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 6); // 6 mois à l'avance

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${today.toISOString()}&timeMax=${maxDate.toISOString()}&singleEvents=true&orderBy=startTime`;
    
    const res = await fetch(url);
    const data = await res.json();
    const disabledDates = [];

    if(data.items){
        data.items.forEach(event=>{
            let start = new Date(event.start.date || event.start.dateTime);
            let end = new Date(event.end.date || event.end.dateTime);

            for(let d = new Date(start); d < end; d.setDate(d.getDate() + 1)){
                disabledDates.push(new Date(d));
            }
        });
    }
    return disabledDates;
}

async function initFlatpickr() {
    const busy = await fetchBusyDates();
    flatpickr(calendarInput, {
        locale: "fr",
        mode: "range",
        dateFormat: "d/m/Y",
        minDate: "today",
        disable: busy
    });
}

initFlatpickr();
