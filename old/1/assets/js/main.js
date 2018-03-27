/*
  thedragonring.me - my personal website
  ================================================================== 
  Copyright (c) 2017 TheDragonRing <thedragonring.bod@gmail.com>, under the MIT License
*/

$(document).ready(function() {
  var $fadeIn = $('[fadeIn]');
  $fadeIn.removeAttr('fadeIn');
  $fadeIn.hide();
  $fadeIn.fadeIn(500);

  $('[scrollToTop]').click(function() {
    event.preventDefault();
    $('html, body').animate(
      {
        scrollTop: 0
      },
      500
    );
  });

  $('a').each(function() {
    if ($(this).attr('href') === '') {
      $(this).click(function() {
        event.preventDefault();
      });
    }
  });

  /* Old code to get downloads - replaced with popup saying to download from new site
  $.get('https://api.github.com/repos/thedragonring/mini-pet/releases/latest', function(data){
    $('#mini-pet #download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/new-tab/releases/latest', function(data){
    $('#new-tab #download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/password-generator/releases/latest', function(data){
    $('#password-generator #download').attr('href', data.zipball_url);
  });
  $.get('https://api.github.com/repos/thedragonring/fireworks/releases/latest', function(data){
    $('#fireworks #download').attr('href', data.zipball_url);
    $('#fireworks #downloadOther').attr('href', data.assets[0].browser_download_url);
  });
  $.get('https://api.github.com/repos/thedragonring/alphahex/releases/latest', function(data){
    $('#alphahex #download').attr('href', data.zipball_url);
  }); */
  $('#download, #downloadOther, #viewLive, #sourceCode')
    .attr('href', 'https://thedragonring.me/')
    .attr(
      'onclick',
      'alert("Hey - go check my current site to see all my projects, don\'t get them from here!")'
    );

  $('[name=subject]').keypress(function(event) {
    if (event.which === 13) {
      $('[name=message]').focus();
    }
  });
  $('#submit').hover(function() {
    var $subject = $('[name=subject]').val();
    var $body = $('[name=message]').val();
    var $url =
      'mailto:thedragonring.bod@gmail.com?subject=' +
      $subject +
      '&body=' +
      $body;
    $(this).attr('href', $url);
  });
  $('#submit').click(function() {
    if ($(this).attr('href') === '#') {
      event.preventDefault();
    }
  });
  $('#reset').click(function() {
    event.preventDefault();
    $('[name=subject]').val('');
    $('[name=message]').val('');
  });

  function getYear() {
    var year = new Date().getFullYear();
    if (year === 2017) {
      return year;
    } else {
      return '2017 - ' + year;
    }
  }
  $('#copyright').html('&copy; ' + getYear() + ' TheDragonRing');
});
