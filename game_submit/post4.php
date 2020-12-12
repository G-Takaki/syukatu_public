<?php
	ini_set('display_errors', 1);
	$username = $_POST["username"];
	$score = $_POST["score"];

	$db = new SQLite3('./score.db');
	$sql = "INSERT INTO score(username, score) VALUES('$username', $score)";
	$db->query($sql);
?>
