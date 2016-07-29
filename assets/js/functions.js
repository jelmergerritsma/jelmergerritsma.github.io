/* WELCOME MESSAGE, it had to be done */
console.log('%cMade %cby  %cJELMERGERRITSMA.NL ', 
			'font-family: Calibri, Helvetica; color: #555; font-weight:bold;',
			'font-family: Calibri, Helvetica; color: #555;',
			'font-family: Calibri, Helvetica; color: #c0392b; font-weight:800; font-size: 17px; letter-spacing:-2px;'
);


$(function(){
	'use strict';
  	var options = {
		debug: true,
    	prefetch: true,
    	cacheLength: 2,
    	onStart: {
      		duration: 1000, // Duration of our animation
      		render: function ($container) {
        		// Add your CSS animation reversing class
        		$container.addClass('is-loading');

        		// Restart your animation
        		smoothState.restartCSSAnimations();
      		}
    	},
    	onReady: {
      		duration: 0,
      		render: function ($container, $newContent) {
       	 		// Remove your CSS animation reversing class
        		$container.removeClass('is-loading');

        		// Inject the new content
        		$container.html($newContent);

      		}
    	},
		onAfter: function() {
			pageFunctions();
		}
	},
  	smoothState = $('#main').smoothState(options).data('smoothState');
});

$(document).ready(function(){
	pageFunctions();
});


function pageFunctions() {
	
	// $(".video").fitVids();
	
	$('button.menuButton').on('click', function(){
		$(this).add('nav').toggleClass('open');
	});

/*	if($('.video').length) {
	 	var url = "http://vimeo.com/api/v2/video/" + $('.video').data('videoId') + ".json";
	 	console.log(url);
	 	$.getJSON( url, function( data ) {
	 		console.log(data);
	 		var url = data[0]['thumbnail_large'].replace(/640.jpg/i, "1500.jpg");
	 		$('.video').css('background-image', 'url(' + url + ')');
	 	});
	};
*/

	$('button.playVideo').on('click', function(){
		var options = {
			videoId: $(this).data('video-id'),
			width: $(window).width(),
			wrapperZIndex: 0
		};

		$('.video').vimelar(options);
		$('.columns').fadeToggle();
		$('.content a > h1').css('left', '-340px');
		$('.closeVideo').css("left", '12px');
	});

	$('button.closeVideo').on('click', function(){
		if(!$(this).hasClass('home')) {
			$('.video').css('z-index', -1).children().remove();
			$('.columns').fadeToggle();
			$('.closeVideo').css("left", '-70px');
		}else {
			$('.svg-mask, .content .center').fadeToggle();
			$('.closeVideo').css("left", '-70px');
			muteVideo(document.getElementById("video"));
		}
		$('.content a > h1').css('left', '0');
	});

	$('button.hideOverlay').on('click', function(){
		$('.svg-mask, .content .center').fadeToggle();
		$('.content a > h1').css('left', '-340px');
		$('.closeVideo').css("left", '8px');
		muteVideo(document.getElementById("video"));
		event.preventDefault();
	});
}

Pace.on('done', function(){
	$('#main').show();
})

function muteVideo(video){
	var volume = video.volume;

	if(video.muted){
		video.volume = 0;
		video.muted = false;

		var vol = 0;
		var interval = 50;
		var fadein = setInterval(
			function() {
				if (vol < 1) {
					video.volume = vol;
					vol += 0.05;
				}
				else {
					clearInterval(fadeout);
				}
			}, 
		interval);
	} else {

		var vol = video.volume;
		var interval = 50;
		var fadeout = setInterval(
			function() {
				if (vol > 0) {
					video.volume = vol;
					vol -= 0.05;
				}
				else {
					muteAll(video);
					clearInterval(fadeout);
				}
			}, 
		interval);
	}
}

function muteAll(video) {
	video.volume = 0;
	video.muted = true;
}
