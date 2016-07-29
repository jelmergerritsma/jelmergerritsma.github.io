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

	$( window ).resize(function() {
		addLineHeight();
	});
	addLineHeight();
	
	$('button.menuButton').on('click', function(){
		$(this).add('nav').toggleClass('open');
	});

	// if($('.video').length) {
	// 	var url = "http://vimeo.com/api/v2/video/" + $('.video').data('videoId') + ".json";
	// 	console.log(url);
	// 	$.getJSON( url, function( data ) {
	// 		console.log(data);
	// 		var url = data[0]['thumbnail_large'].replace(/640.jpg/i, "1500.jpg");
	// 		$('.video').css('background-image', 'url(' + url + ')');
	// 	});
	// };

	$('button.playVideo').on('click', function(){
		var options = {
			videoId: $(this).data('video-id'),
			width: $(window).width(),
			wrapperZIndex: 0
		};

		$('.video').vimelar(options);
		$('.closeVideo').css("left", '12px');
	});

	$('button.closeVideo').on('click', function(){
		if(!$(this).hasClass('home')) {
			$('.video').css('z-index', -1).children().remove();
			$('.closeVideo').css("left", '-60px');
		}else {
			$('.svg-mask, .content').fadeToggle();
			$('.closeVideo').css("left", '-60px');
			vidmute2(document.getElementById("video"));
		}
	});

	$('button.hideOverlay').on('click', function(){
		$('.svg-mask, .content').fadeToggle();
		$('.closeVideo').css("left", '12px');
		vidmute2(document.getElementById("video"));
		event.preventDefault();
	});
}

function addLineHeight() {
	$('nav a').css('line-height',  (30 / 100) * $(window).height() + 'px');
}

Pace.on('done', function(){
	$('#main').show();
})

function vidmute2(video){
	if(video.muted){
		video.muted = false;
	} else {
		video.muted = true;
	}
}

/*

//this is used for the video effect only
				 if( $('.cd-bg-video-wrapper').length > 0 ) {
				 	var videoWrapper = $('.cd-bg-video-wrapper'),
				 		mq = window.getComputedStyle(document.querySelector('.cd-bg-video-wrapper'), '::after').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
				 	if( mq == 'desktop' ) {
				 		// we are not on a mobile device 
				 		var	videoUrl = videoWrapper.data('video'),
				 			video = $('<video id="video" loop muted><source src="'+videoUrl+'.mp4" type="video/mp4" /><source src="'+videoUrl+'.webm" type="video/webm" /></video>');
				 		video.appendTo(videoWrapper);
				 		video.get(0).play();
				 	}
				 }


				 */ 