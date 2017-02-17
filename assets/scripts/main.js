/*
  Alphahex by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$(document).ready(function(){

  var $fadeIn = $('[fadeIn]');
  $fadeIn.removeAttr('fadeIn');
  $fadeIn.hide();
  $fadeIn.fadeIn(500);

  $('[scrollToTop]').click(function(){
    event.preventDefault();
    $('html, body').animate({
        scrollTop: 0
    }, 500);
  });

  $.get('https://api.github.com/repos/thedragonring/new-tab/releases/latest', function(data){
    $('#new-tab #download').attr('href', data.zipball_url);
    $('#new-tab #downloadCount').html(data.assets.download_count);
  });

  function getYear(){
    var year = new Date().getFullYear();
    if(year === 2017){
      document.write(year);
    }else{
      document.write('2017 - ' + year);
    }
  }

});
