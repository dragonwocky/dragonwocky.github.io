<?php

/*
  Alphahex by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$email = "backup@thedragonring.me";
$subject = "Download Log Backup";
$recipient = "thedragonring.bod@gmail.com";
$mailheader = "From: Website Backup <$email> \r\n";

$content = "";
foreach(glob("../dl-logs/*.txt") as $file){
  $content = $content . "\n" . $file . " = " . file_get_contents($file);
}

mail($recipient, $subject, $content, $mailheader) or die("Error!");
exit();
?>
