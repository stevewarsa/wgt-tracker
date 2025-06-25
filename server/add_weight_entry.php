<?php /** @noinspection SqlResolve */
/** @noinspection SqlNoDataSourceInspection */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, X-Requested-With, Accept');
header('Content-Type: application/json; charset=utf8; Accept: application/json');

$request = file_get_contents('php://input');
if (empty($request)) {
	error_log("add_weight_entry.php - may be options call - JSON request not sent - exiting");
	exit();
}
error_log("add_weight_entry.php - Here is the JSON received: ");
error_log($request);
$weightEntry = json_decode($request);

// now insert or update this weightEntry
$db = null;
$filename = 'db/weighttracker.sqlite';
if (file_exists($filename)) {
	$db = new SQLite3($filename);
	try {
		$statement = $db->prepare('update WEIGHT_TRACKER set POUNDS = :lbs, NOTES = :notes where DATE_OF_WEIGHT = :dt');
		$statement->bindValue(':dt', $weightEntry->dt);
		$statement->bindValue(':lbs', $weightEntry->lbs);
		$statement->bindValue(':notes', $weightEntry->notes);
		$statement->execute();
		$statement->close();

		if ($db->changes() < 1) {
			$statement = $db->prepare("insert into WEIGHT_TRACKER (DATE_OF_WEIGHT, POUNDS, NOTES) values (:dt,:lbs,:notes)");
			$statement->bindValue(':dt', $weightEntry->dt);
			$statement->bindValue(':lbs', $weightEntry->lbs);
			$statement->bindValue(':notes', $weightEntry->notes);
			$statement->execute();
			$statement->close();
			error_log("add_weight_entry.php - Inserted new weightEntry...");
		} else {
			error_log("add_weight_entry.php - Updated weightEntry...");
		}
		$db->close();
		print_r(json_encode($weightEntry));
	} catch (Exception $e) {
		error_log("add_weight_entry.php - Error inserting or updating weightEntry...  Error message: " . $e->getMessage());
		$db->close();
		print_r(json_encode($weightEntry));
	}
} else {
	error_log("add_weight_entry.php - No database file " . $filename);
	print_r(json_encode("error|There is no database named " . $filename));
}
?>