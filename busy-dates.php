<?php
// busy-dates.php
$ical = file_get_contents('basic.ics'); // place ton .ics dans le même dossier ou indique le chemin correct

preg_match_all('/DTSTART;VALUE=DATE:(\d+)/', $ical, $starts);
preg_match_all('/DTEND;VALUE=DATE:(\d+)/', $ical, $ends);

$disabled = [];

foreach($starts[1] as $i => $start){
    $s = DateTime::createFromFormat('Ymd', $start);
    $e = DateTime::createFromFormat('Ymd', $ends[1][$i]);
    while($s < $e){
        $disabled[] = $s->format('Y-m-d'); // format ISO pour Flatpickr
        $s->modify('+1 day');
    }
}

header('Content-Type: application/json');
echo json_encode($disabled);
?>