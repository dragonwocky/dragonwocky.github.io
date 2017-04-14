/*
Unumico by TheDragonRing (thedragonring.me)
Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$(document).ready(function(){

  //Fade in contents on document load.
  $('body')
  .css('visibility', 'visible')
  .hide()
  .fadeIn(1500);

  //Scroll page to top on button click.
  $('.scrollTop').click(function(){
    event.preventDefault();
    $('html, body').animate({
      scrollTop: 0
    }, 500);
  });
  //Scroll page to bottom on button click.
  $('.scrollBottom').click(function(){
    event.preventDefault();
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 500);
  });

  //Remove underline on anchor elements that have a child element and aren't buttons.
  $('a').each(function(){
    if($(this).children().length > 0 && !$(this).hasClass('button')){
      $(this).css('border', 'none');
    }
  });

  //Stop buttons with the "disabled" class from being clicked.
  $('.disabled').click(function(){
    event.preventDefault();
  });

  //Manage download links.
  $.get('https://api.github.com/repos/thedragonring/unumico/releases/latest', function(data){
    $('[name=unumico] .download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/mini-pet/releases/latest', function(data){
    $('[name=mini-pet] .download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/new-tab/releases/latest', function(data){
    $('[name=new-tab] .download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/password-generator/releases/latest', function(data){
    $('[name=password-generator] .download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/fireworks/releases/latest', function(data){
    $('[name=fireworks] .other-download').attr('href', data.zipball_url);
    $('[name=fireworks] .download').attr('href', data.assets[0].browser_download_url);
  });
  $.get('https://api.github.com/repos/thedragonring/alphahex/releases/latest', function(data){
    $('[name=alphahex] .download').attr('href', data.zipball_url);
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
        //Change page title.
        var $siteName = /[^\|]*$/.exec($('title').html())[0];
        $('title').html(capitalizeFirstLetter(/[^\#]*$/.exec(window.location.href)[0]) + ' | ' + $siteName);
      }
      //Make sure only the current article is showing.
      if($(this).attr('id') !== /[^\#]*$/.exec(window.location.href)[0] && $(this).css('display') === 'block'){
        $(this).fadeOut(1000);
      }
      //Set back to the home page.
      if(/[^\#]*$/.exec(window.location.href)[0] === '' || $('#' + /[^\#]*$/.exec(window.location.href)[0]).length === 0){
        $('article').fadeOut(1000);
        $('#home').fadeIn(1500);
        var $currentTitle = $('title').html();
        var $siteName = /[^\|]*$/.exec($('title').html())[0];
        if($currentTitle !== 'Home |' + $siteName){
          $('title').html('Home | ' + $siteName);
        }
      }
    });
  }
  //Set to correct page on load.
  $('title').html('Home | ' + /[^\|]*$/.exec($('title').html())[0]);
  //Continually process and execute page changes.
  setInterval(function(){
    changePage();
  }, 1);
  //Return to home page when the "ESC" key is clicked.
  $(document).keyup(function(event){
    if(event.keyCode === 27){
      window.location.assign('#');
    }
  });

  //Automatically update all forms to match each other.
  $('*').change(function(){
    var $name = $(this).attr('name');
    $('[name=' + $name + ']')
    .val($(this).val())
    .css('display', 'auto');
  });
  $('.form .submit').click(function(){
    //Manage changing the link to the correct mailto url.
    var $inputs = [$('[name=name]').val(), $('[name=email]').val(), $('[name=subject]').val(), $('[name=message]').val()];
    var $filled = [false, false, false, false];
    for(var i = 0; i < $inputs.length; i++) {
      if($inputs[i] === ''){ //Check if all the fields are filed in.
        $('.form .submit').attr('href', '#');
      }else{
        $filled[i] = true;
      }
    }
    if($filled[0] && $filled[1] && $filled[2] && $filled[3]){ //Set the link to the correct mailto url.
      var $subject = $('[name=subject]').val();
      var $body = 'Name: ' + $('[name=name]').val() + '%0A Email:  ' + $('[name=email]').val() + '%0A Message: ' + encodeURI($('[name=message]').val());
      var $url = 'mailto:' + $('.form').attr('data-email-to') + '?subject=' + $subject + '&body=' + $body;
      $(this).attr('href', $url);
    }
    //Stop going back home on click with an empty form.
    if($(this).attr('href') === '#'){
      event.preventDefault();
      alert('Please fill in all the fields before submitting the form!');
    }
  });
  //Clear form input on click of a button with the id 'reset'.
  $('.form .reset').click(function(){
    event.preventDefault();
    $('.form input').val('');
    $('.form textarea').val('');
    $('.from .submit').attr('href', '#');
  });

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

  //Capitalize first letter of string.
  function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

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
