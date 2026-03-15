const AIRBNB_ICAL = "https://www.airbnb.fr/calendar/ical/1637653042244841736.ics?t=b597fb5a299a46d589ae14b6b03e3b13";

const calendarInput = document.getElementById('calendar');

async function fetchBusyDates() {

    try {

        const response = await fetch(AIRBNB_ICAL);
        const data = await response.text();

        const jcalData = ICAL.parse(data);
        const comp = new ICAL.Component(jcalData);
        const events = comp.getAllSubcomponents("vevent");

        const disabled = [];

        events.forEach(event => {

            const e = new ICAL.Event(event);

            let start = e.startDate.toJSDate();
            let end = e.endDate.toJSDate();

            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {

                disabled.push(new Date(d));

            }

        });

        return disabled;

    } catch (error) {

        console.error("Erreur lecture calendrier Airbnb :", error);
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
