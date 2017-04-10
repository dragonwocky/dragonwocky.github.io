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

  //Remove underline on anchor elements that have a child element.
  $('a').each(function(){
    if($(this).children().length > 0){
      $(this).css('border', 'none');
    }
  });

  //Manage page changes.
  function changePage(){
    $('article').each(function(){
      //Check if another page is being accessed.
      if($(this).attr('id') === /[^\#]*$/.exec(window.location.href)[0] && $(this).css('display') !== 'block'){
        //Set to requested page.
        $('#home').fadeOut(1000);
        $(this).css('display', 'block')
        .show()
        .hide()
        .fadeIn(1500);
      }
      //Set back to the home page.
      if(/[^\#]*$/.exec(window.location.href)[0] === ''){
        $('#home').fadeIn(1500);
        $('article').fadeOut(1000);
      }
    });
  }
  //Continually process and execute page changes.
  setInterval(function(){
    changePage();
  }, 1);

  //Read page GET requests.
  function getRequests(){
    var s1 = location.search.substring(1, location.search.length).split('&'), //Separate data.
    r = {}, s2, i;
    for (i = 0; i < s1.length; i += 1) {
      s2 = s1[i].split('='); //Separate paramenters.
      r[decodeURIComponent(s2[0]).toLowerCase()] = decodeURIComponent(s2[1]); //Store data in variable.
    }
    return r;
  };
  var QueryString = getRequests(); //Usage: If the url is "index.html?q=test" then "QueryString['q']" will return "test".

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
