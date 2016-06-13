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
	
	$( window ).resize(function() {
		addLineHeight();
	});
	addLineHeight();
	
	$('button.menuButton').on('click', function(){
		$(this).add('nav').toggleClass('open');
	});
}

function addLineHeight() {
	$('nav a').css('line-height',  (30 / 100) * $(window).height() + 'px');
}