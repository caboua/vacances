// === CONFIGURATION ===
const CALENDAR_ID = 'villa.caboua@gmail.com'; // Ton calendrier public
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Mets ici ta clé API Google
const calendarInput = document.getElementById('calendar');

// Récupère les événements du calendrier public via Google Calendar API
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

            // Bloque toutes les dates entre start et end
            for(let d = new Date(start); d < end; d.setDate(d.getDate() + 1)){
                disabledDates.push(new Date(d));
            }
        });
    }
    return disabledDates;
}

// Initialise Flatpickr avec les dates occupées
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

// Démarre
initFlatpickr();