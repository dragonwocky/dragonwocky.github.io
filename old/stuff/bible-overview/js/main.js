$(document).ready(function(){

  $('body').fadeIn(1500);

  $('a').click(function(){
    if($(this).attr('href') === ''){
      event.preventDefault();
    }
    page($(this).attr('data-page'));
  });

  function page(p){
    if($('#' + p).css('display') !== 'block'){
      setTimeout(function(){
        $('#' + p).slideDown(750);
        if($('#' + p).is(':first-of-type')){
          $('html, body').animate({
            scrollTop: 0
          }, 800);
        }else{
          $('html, body').animate({
            scrollTop: $('#' + p).offset().top
          }, 800);
        }
      }, 1000);
    }else{
      $('#' + p).slideUp(750);
    }
  }
  page('creation');

});
