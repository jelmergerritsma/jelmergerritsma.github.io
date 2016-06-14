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
	// 	$.getJSON( "http://vimeo.com/api/v2/video/" + $('.video').data('videoId') + ".json", function( data ) {
	// 		var url = data[0]['thumbnail_large'].replace(/640.jpg/i, "1500.jpg");
	// 		$('.video').css('background-image', 'url(' + url + ')');
	// 	});
	// };

	$('button.playVideo').on('click', function(){
		var options = {
			videoId: $(this).data('video-id'),
			width: $(window).width(),
			wrapperZIndex: 0,
			parameters: {
			/* Vimeo API Options Here */
			}
		};

		$('.video').vimelar(options);
	});

}

function addLineHeight() {
	$('nav a').css('line-height',  (30 / 100) * $(window).height() + 'px');
}