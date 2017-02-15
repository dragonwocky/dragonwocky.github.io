/*
  New Tab by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$(document).ready(function(){


  var $fadeIn = $('[fadeIn]');
  $fadeIn.removeAttr('fadeIn');
  $fadeIn.hide();
  $fadeIn.fadeIn(750);

  $('#search-bar').focus();
  $("#search-bar:text:visible:first").focus();
  $('#search-bar').keypress(function(event){
    var $url = $('#search-bar').val();
    if(event.which === 13){
      if($url !== ''){
        if($url.indexOf(' ') >= 0 || $url.indexOf('.') <= 0){
          $url = 'https://google.com/search?q=' + $url;
        }else if(!/^((http|https|ftp):\/\/)/.test($url)){
          $url = 'http://' + $url;
        }
        window.location.assign($url);
      }
    }
  });

});

function getYear(){
  var year = new Date().getFullYear();
  if(year === 2017){
    document.write(year);
  }else{
    document.write('2017 - ' + year);
  }
}
