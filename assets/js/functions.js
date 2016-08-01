/* WELCOME MESSAGE, it had to be done */
console.log('%cMade %cby  %cJELMERGERRITSMA.NL ', 
			'font-family: Calibri, Helvetica; color: #555; font-weight:bold;',
			'font-family: Calibri, Helvetica; color: #555;',
			'font-family: Calibri, Helvetica; color: #c0392b; font-weight:800; font-size: 17px; letter-spacing:-2px;'
);


var md = new MobileDetect(window.navigator.userAgent);



jQuery(function(){
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
  	smoothState = jQuery('#main').smoothState(options).data('smoothState');
});

jQuery(document).ready(function(){
	pageFunctions();
});


function pageFunctions() {	
	jQuery('button.menuButton').on('click', function(){
		jQuery(this).add('nav').toggleClass('open');
	});

	// jQuery('.video').each(function()
	// 	{
	// 	if(jQuery(this).css('background-image') === 'none')
	// 		{
	// 		if(jQuery(this).length && !jQuery('.video').data('videoId')) 
	// 		{
	// 				console.log(jQuery('.video').data('videoId'));
	// 		 		var url = "http://vimeo.com/api/v2/video/" + jQuery('.video').data('videoId') + ".json";
	// 		 		jQuery.getJSON( url, function( data ) {
	// 	 	 		var url = data[0]['thumbnail_large'].replace(/640.jpg/i, "1500.jpg");
	// 				jQuery('.video').css('background-image', 'url(' + url + ')');
	// 		 	});
	// 		};
	// 	}
	// });

	// if($('.video').length) {
	//  	var url = "http://vimeo.com/api/v2/video/" + $('.video').data('videoId') + ".json";
	//  	console.log(url);
	//  	$.getJSON( url, function( data ) {
	//  		console.log(data);
	//  		var url = data[0]['thumbnail_large'].replace(/640.jpg/i, "1500.jpg");
	//  		$('.video').css('background-image', 'url(' + url + ')');
	//  	});
	// };
	

	
	if(md.mobile()) {
		jQuery('button.hideOverlay, button.playVideo').on('click', function(){
			var win = window.open(jQuery(this).data('vimeourl'), '_blank');
			win.focus();
			return;
		})
	} else {
		jQuery('button.playVideo').on('click', function(){
			var options = {
				videoId: jQuery(this).data('video-id'),
				width: jQuery(window).width(),
				wrapperZIndex: 0
			};

			jQuery('.video').vimelar(options);
			jQuery('.columns').fadeToggle();
			jQuery('.content a > h1').css('left', '-340px');
			jQuery('.closeVideo').css("left", '12px');
		});

		jQuery('button.closeVideo').on('click', function(){
			if(!jQuery(this).hasClass('home')) {
				jQuery('.video').css('z-index', -1).children().remove();
				jQuery('.columns').fadeToggle();
				jQuery('.closeVideo').css("left", '-70px');
			}else {
				jQuery('.svg-mask, .content .center').fadeToggle();
				jQuery('.closeVideo').css("left", '-70px');
				muteVideo(document.getElementById("video"));
			}
			jQuery('.content a > h1').css('left', '0');
		});

		jQuery('button.hideOverlay').on('click', function(){
			jQuery('.svg-mask, .content .center').fadeToggle();
			jQuery('.content a > h1').css('left', '-340px');
			jQuery('.closeVideo').css("left", '8px');
			muteVideo(document.getElementById("video"));
			event.preventDefault();
		});
	}
}

Pace.on('done', function(){
	jQuery('#main').show();
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




// particle cool ding 
(function() {

    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for(var x = 0; x < width; x = x + width/20) {
            for(var y = 0; y < height; y = y + height/20) {
                var px = x + Math.random()*width/20;
                var py = y + Math.random()*height/20;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(closest[k] == undefined) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if(!placed) {
                            if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a circle to each point
        for(var i in points) {
            var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
            points[i].circle = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = posy = 0;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY)    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        target.x = posx;
        target.y = posy;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        animate();
        for(var i in points) {
            shiftPoint(points[i]);
        }
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in points) {
                // detect points in range
                if(Math.abs(getDistance(target, points[i])) < 4000) {
                    points[i].active = 0.3;
                    points[i].circle.active = 0.6;
                } else if(Math.abs(getDistance(target, points[i])) < 20000) {
                    points[i].active = 0.1;
                    points[i].circle.active = 0.3;
                } else if(Math.abs(getDistance(target, points[i])) < 40000) {
                    points[i].active = 0.02;
                    points[i].circle.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].circle.active = 0;
                }

                drawLines(points[i]);
                points[i].circle.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to(p, 1+1*Math.random(), {x:p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100, ease:Circ.easeInOut,
            onComplete: function() {
                shiftPoint(p);
            }});
    }

    // Canvas manipulation
    function drawLines(p) {
        if(!p.active) return;
        for(var i in p.closest) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.closest[i].x, p.closest[i].y);
            ctx.strokeStyle = 'rgba(192,57,43,'+ p.active+')';
            ctx.stroke();
        }
    }

    function Circle(pos,rad,color) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(192,57,43,'+ _this.active+')';
            ctx.fill();
        };
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    }
    
})();