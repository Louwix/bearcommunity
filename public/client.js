// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html
var nbMusic = 1;
var tagMusic = 0;

$(function() {
  console.log('hello world :o');
  $('#addMusic').before("<label for='name'>Nom de la playlist</label>")
  $('#addMusic').before("<input type='text' id='name'/>")
  $('#addMusic').before("<label for='music_1'>Musique n°1</label>")
  $('#addMusic').before("<input type='url' id='music_1'/>")
  
  /*$.get('/dreams', function(dreams) {
    dreams.forEach(function(dream) {
      $('<li></li>').text(dream).appendTo('ul#dreams');
    });
  });

  $('form').submit(function(event) {
    event.preventDefault();
    var dream = $('input').val();
    $.post('/music?' + $.param({dream: dream}), function() {
      $('<li></li>').text(dream).appendTo('ul#dreams');
      $('input').val('');
      $('input').focus();
    });
  });*/
  
  $('#addMusic').click(function() {
    nbMusic++;
    $('#addMusic').before("<label for='music_'"+ nbMusic +"/>Musique n°"+ nbMusic +"</label>")
    $('#addMusic').before("<input type='url' name=music_"+ nbMusic +"/>")
  })
});

