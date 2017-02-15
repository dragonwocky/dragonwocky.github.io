<!--
  Alphahex by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
-->

<!DOCTYPE html>
<html>
  <head>
    <title>Projects | TheDragonRing</title>
    <meta charset="UTF-8">
    <meta name="description" content="I am the first website template TheDragonRing has ever made from scratch. I also have a few pre-built scripts included that'll make building your next site much easier.">
    <meta name="keywords" content="TheDragonRing, Alphahex, Home, Contact, Projects, Blog, Coding, GitHub, Twitter, Designing, Templates">
    <meta http-equiv="refresh" content="300">
    <meta name="author" content="TheDragonRing">
    <link rel="shortcut icon" type="image/x-icon" href="../assets/images/favicon.ico">
    <link rel="stylesheet" type="text/css" href="../assets/styles.css">
    <script src="../assets/scripts/jquery.js"></script>
    <script src="../assets/scripts/main.js"></script>
  </head>
  <body>
    <header>
      <ul class="normal">
        <li><a href="../" left>Home</a></li>
        <li><a href="../contact">Contact</a></li>
        <li><a class="heading">Alphahex</a></li>
        <li><a href="" active>Projects</a></li>
        <li><a href="../blog" right>Blog</a></li>
      </ul>
      <ul class="mobile">
        <li><a class="heading">Alphahex</a></li>
          <br>
        <li><a href="../" left>Home</a></li>
        <li><a href="../contact">Contact</a></li>
        <li><i class="fa fa-code fa-2x"></i></li>
        <li><a href="" active>Projects</a></li>
        <li><a href="../blog" right>Blog</a></li>
      </ul>
    </header>
    <section id="main" fadeIn>
      <section id="title">
        <h1>Projects</h1>
        <h2>Want to see some of my work or download something I've made? Just take a look at the stuff below. Everything is licensed under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">Creative Commons Attribution 4.0 License</a>.</h2>
      </section>
      <section id="projects">
        <section id="text">
          <img src="../assets/images/text.png"></img>
          <div class="text">
            <h2>Text File</h2>
            <p>Text files. Just simple files full of text! Want to download one?</p>
          </div>
          <div class="buttons">
            <a href="../assets/scripts/download.php?q=text&t=zip" special>Download (<?php echo file_get_contents("../assets/dl-logs/text-zip.txt"); ?>)</a>
            <a href="../assets/demos/text.txt" target="_blank">View</a>
          </div>
        </section>
        <section id="thedragonring">
          <img src="../assets/images/thedragonring.png"></img>
          <div class="text">
            <h2>TheDragonRing</h2>
            <p>This is the first person to use Alphahex. Probably because he made it.</p>
          </div>
          <div class="buttons">
            <a href="https://thedragonring.me" special>View</a>
            <a href="https://twitter.com/TheDragonRing" target="_blank">Twitter</a>
            <a href="https://github.com/TheDragonRing" target="_blank">GitHub</a>
          </div>
        </section>
      </section>
    </section>
    <footer>
      <ul>
        <li><a href="https://twitter.com/" target="_blank"><i class="fa fa-twitter"></i></a></li>
        <li><a href="" scrollToTop><i class="fa fa-chevron-up"></i></a></li>
        <li><a href="https://github.com/" target="_blank"><i class="fa fa-github-alt"></i></a></li>
          <br>
        <li><a href="https://example.com">Content: &copy; <script>getYear()</script> Alphahex.</a> <a href="https://thedragonring.me">Design: &copy; <script>getYear()</script> TheDragonRing</a></li>
      </ul>
    </footer>
  </body>
</html>
