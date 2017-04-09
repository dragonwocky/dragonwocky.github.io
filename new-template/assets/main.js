/*
  Alphahex by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$(document).ready(function(){

  //Fade in contents on document load.
  $('body')
  .css('visibility', 'visible')
  .hide()
  .fadeIn(1500);

  //Manage page changes.
  function changePage(){
    $('article').each(function(){
      //Check if another page is being accessed.
      if($(this).attr('id') === /[^\#]*$/.exec(window.location.href)[0] && $(this).css('display') !== 'block'){
        //Set to requested page.
        $('#home').hide(1000);
        $(this).css('display', 'block')
        .show()
        .hide()
        .fadeIn(1500);
      }
      //Set back to the home page.
      if(/[^\#]*$/.exec(window.location.href)[0] === ''){
        $('#home').fadeIn(1500);
        $('article').hide(1000);
      }
    });
  }
  //Continually process and execute page changes.
  setInterval(function(){
    changePage();
  }, 1);

  //Set the year in the footer to either the current year or the specified year till the current year.
  function getYear(){
    var year = new Date().getFullYear(); //Get current year.
    if(year === parseFloat($('.year').html()) || isNaN($('.year').html())){ //Check if the year in footer is the current year, or if it is a number.
      return year;
    }else{
      return parseFloat($('.year').html()) + ' - ' + year; //If the specified year is a number other than the current year, then set the footer to show from that year till now.
    }
  }
  $('.year').html(getYear()); //Modify footer to show correct year(s).

});
