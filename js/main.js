// main.js - version1

const CALENDAR_ID = 'a42682891ff3cdeba7e8d30c8deb71cd3e263aaf9d3d84b61cc4efb52f5a2c75@group.calendar.google.com';
const API_KEY = 'AIzaSyC8Vpze8e4-Mv3D5boiNszUj5-GIfIV5Vg';
const calendarInput = document.getElementById('calendar');

async function fetchBusyDates() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 6);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${today.toISOString()}&timeMax=${maxDate.toISOString()}&singleEvents=true&orderBy=startTime`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const disabled = [];

        if (data.items) {
            data.items.forEach(event => {
                let start = new Date(event.start.date || event.start.dateTime);
                let end = new Date(event.end.date || event.end.dateTime);
                for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                    disabled.push(new Date(d));
                }
            });
        }

        return disabled;
    } catch (err) {
        console.error("Erreur Google Calendar API :", err);
        return [];
    }
}

async function initFlatpickr() {
    const busyDates = await fetchBusyDates();
    flatpickr(calendarInput, {
        locale: "fr",
        mode: "range",
        dateFormat: "d/m/Y",
        minDate: "today",
        disable: busyDates,
        onClose: function(selectedDates) {
            if(selectedDates.length === 2){
                const event = new Event('change');
                calendarInput.dispatchEvent(event);
            }
        }
    });
}

initFlatpickr();
