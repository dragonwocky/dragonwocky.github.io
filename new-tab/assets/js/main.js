/*
  New Tab by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$(document).ready(function(){

  var $fadeIn = $('[fadeIn]');
  $fadeIn.removeAttr('fadeIn');
  $fadeIn.hide();
  $fadeIn.fadeIn(1250);

  var $searchBar = $('#searchBar');
  $searchBar.focus();
  $searchBar.keypress(function(event){
    var $url = $searchBar.val();
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

  function getYear(){
    var year = new Date().getFullYear();
    if(year === 2017){
      return year;
    }else{
      return '2017 - ' + year;
    }
  }
  $('#copyright').html('&copy; ' + getYear() + ' TheDragonRing');

});
