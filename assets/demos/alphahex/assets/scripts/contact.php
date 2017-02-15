<!--
  Alphahex by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
-->

<!DOCTYPE html>
<html>
  <head>
    <title>Contact | Alphahex</title>
    <meta charset="UTF-8">
    <meta name="description" content="I am the first website template TheDragonRing has ever made from scratch. I also have a few pre-built scripts included that'll make building your next site much easier.">
    <meta name="keywords" content="TheDragonRing, Alphahex, Home, Contact, Projects, Blog, GitHub, Twitter, Coding, Designing, Templates">
    <meta name="author" content="TheDragonRing">
    <link rel="shortcut icon" type="image/x-icon" href="../images/favicon.ico">
    <link rel="stylesheet" type="text/css" href="../styles.css">
    <script src="../scripts/jquery.js"></script>
    <script src="../scripts/main.js"></script>
  </head>
  <body>
    <header>
      <ul class="normal">
        <li><a href="../../" left>Home</a></li>
        <li><a href="../../contact" active>Contact</a></li>
        <li><a class="heading">Alphahex</a></li>
        <li><a href="../../projects">Projects</a></li>
        <li><a href="../../blog" right>Blog</a></li>
      </ul>
      <ul class="mobile">
        <li><a class="heading">Alphahex</a></li>
          <br>
        <li><a href="../../" left>Home</a></li>
        <li><a href="../../contact" active>Contact</a></li>
        <li><i class="fa fa-code fa-2x"></i></li>
        <li><a href="../../projects">Projects</a></li>
        <li><a href="../../blog" right>Blog</a></li>
      </ul>
    </header>
    <section class="script" id="main">
      <h1>

          <?php

          $name = $_POST["name"];
          $email = $_POST["email"];
          $subject = $_POST["subject"];
          $content = $_POST["message"];
          $recipient = "thedragonring.bod@gmail.com";
          $mailheader = "From: $name <$email> \r\n";

          mail($recipient, $subject, $content, $mailheader) or die("Error!");
          sleep(5);
          echo "Your email has successfully been sent! I'll try to reply within 24 hours of recieving it.";

          ?>

      </h1>
    </section>
    <footer>
      <ul>
        <li><a href="https://twitter.com/" target="_blank"><i class="fa fa-twitter"></i></a></li>
        <li><a href="#"><i class="fa fa-chevron-up"></i></a></li>
        <li><a href="https://github.com/" target="_blank"><i class="fa fa-github-alt"></i></a></li>
          <br>
        <li><a href="https://example.com">Content: &copy; <script>getYear()</script> Alphahex.</a> <a href="https://thedragonring.me">Design: &copy; <script>getYear()</script> TheDragonRing</a></li>
      </ul>
    </footer>
  </body>
</html>
