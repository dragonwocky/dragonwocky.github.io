/*
  Password Generator by TheDragonRing (thedragonring.me)
  Copyright © 2017 TheDragonRing - Creative Commons Attribution 4.0 International License
*/

$(document).ready(function(){

  var $fadeIn = $('[fadeIn]');
  $fadeIn.removeAttr('fadeIn');
  $fadeIn.hide();
  $fadeIn.fadeIn(750);

  $('[scrollToTop]').click(function(){
    event.preventDefault();
    $('html, body').animate({
        scrollTop: 0
    }, 250);
  });

  $('#output').hide();
  $('[generateBtn]').click(function(){
    event.preventDefault();
    runShuffle();
  });
  $('input[name=length]').keypress(function(event){
    if(event.which === 13){
      runShuffle();
    }
  });

  $('[copyBtn]').click(function(){
    event.preventDefault();
  });
  new Clipboard('[copyBtn]', {
    text: function(trigger){
      return $('[name=pass]').val();
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

function runShuffle(){
  var $length = $('[name=length]');
  var $pass = $('[name=pass]');
  if($length.val() > 0){
    if($length.val() > 90){
      $pass.val(shuffle(90));
      $('#output').show(750);
    }else{
      $pass.val(shuffle($length.val()));
      $('#output').show(750);
    }
  }else{
    alert('Error: The password length must be set to a value above zero!');
  }
}

function shuffle(length){
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeffghijklmnopqrstuvwxyz1234567890~!@#$%^&*()=+-_{}[]:;"\'<>,./\\'.split('');
  for(var i = 0; i < chars.length - 1; i++) {
    var a = Math.floor(Math.random() * (i + 1));
    var b = chars[i];
    chars[i] = chars[a];
    chars[a] = b;
  }
  var pass = chars.join('');
  var final = '';
  for(l = length; l > 0; l--){
    final = final + pass[l];
  }
  return final;
}
