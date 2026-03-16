<?php

$url = "https://www.airbnb.fr/calendar/ical/1637653042244841736.ics?t=b597fb5a299a46d589ae14b6b03e3b13";

$ical = file_get_contents($url);

$lines = explode("\n", $ical);

$events = [];
$event = [];

foreach ($lines as $line) {

    if (strpos($line, "BEGIN:VEVENT") !== false) {
        $event = [];
    }

    if (strpos($line, "DTSTART") !== false) {
        $date = substr($line, strpos($line, ":") + 1);
        $event["start"] = $date;
    }

    if (strpos($line, "DTEND") !== false) {
        $date = substr($line, strpos($line, ":") + 1);
        $event["end"] = $date;
    }

    if (strpos($line, "END:VEVENT") !== false) {
        $events[] = $event;
    }

}

header("Content-Type: application/json");

echo json_encode($events);

?>