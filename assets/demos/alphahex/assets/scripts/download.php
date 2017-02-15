<?php

/*
  Alphahex by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$num = file_get_contents("../dl-logs/" . $_GET["q"] . "-" . $_GET["t"] . ".txt");
$log = fopen("../dl-logs/" . $_GET["q"] . "-" . $_GET["t"] . ".txt", "w");
fwrite($log, $num+1);
fclose($log);

header("Location: ../downloads/" . $_GET["q"] . "." . $_GET["t"]);
exit();

?>
