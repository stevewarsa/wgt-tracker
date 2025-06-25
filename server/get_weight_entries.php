<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$db = null;
$filename = 'db/weighttracker.sqlite';
if (file_exists($filename)) {
	$db = new SQLite3($filename);
	$results = $db->query('SELECT DATE_OF_WEIGHT, POUNDS, NOTES from WEIGHT_TRACKER');

	$weightEntries = array();
	while ($row = $results->fetchArray()) {
		$weightEntry = new stdClass;
		$weightEntry->dt = $row['DATE_OF_WEIGHT'];
		$weightEntry->lbs = $row['POUNDS'];
		$weightEntry->notes = $row['NOTES'];
		array_push($weightEntries, $weightEntry);
	}

	$db->close();

	print_r(json_encode($weightEntries));
} else {
	error_log("get_weight_entries.php - No database file " . $filename);
	print_r(json_encode("error|There is no database file named " . $filename));
}
?>

