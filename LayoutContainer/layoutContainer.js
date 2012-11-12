(function($) {
	var defaultAnimate = false,
		defaultVidRatio = 3/4,
		defaultIgnoreClasses = [],
		defaultDuration = 200,
		defaultBigClass = "big",
		defaultBigRatio = 3/4;

	// Return the layout container children that would be laid out
	// when calling the layout function.
	//
	// If you call the layout function with a custom bigClass or ignoreClasses,
	// then you'll need to pass them into layoutChildren as part of the +params+
	// options hash.
	//
	// Note: This won't work on a collection, only on a single result
	$.fn.layoutChildren = function(params) {
		if (!params) params = {};

		var ignoreClasses = params.ignoreClasses || defaultIgnoreClasses,
			bigClass = params.bigClass || defaultBigClass,
			childSelector = ">*:not(." + bigClass + ")";

		for (var i=0, numIgnoreClasses = ignoreClasses.length; i < numIgnoreClasses; i++) {
			childSelector += ":not(." + ignoreClasses[i] + ")";
		};

		return $(this[0]).find(childSelector);
	};

	/*
	 *	layout - Lays out and resizes the contents of the specified container in the optimal arrangement
	 *	and size so that they fill the space. This is intended for use with the OpenTok library to layout 
	 *	Subscribers and Publishers.
	 *
	 *	animate - Boolean value whether to animate the transition to the new layout.
	 */
	$.fn.layout = function(params) {
		if (!params) params = {};
		var animate = params.animate || defaultAnimate;
		// Aspect ratio of the streams
		var vid_ratio = params.ratio || defaultVidRatio;
		var ignoreClasses = params.ignoreClasses || defaultIgnoreClasses;
		var duration = params.duration || defaultDuration;
		var bigClass = params.bigClass || defaultBigClass;
		var bigRatio = params.bigRatio || defaultBigRatio;
		var positionedClass = "TB_layout_positioned";
		
		// Register callbacks for every animation callback and when they all fire we call
		// the params.complete method
		var callbacks = [];
		var completed = false;
		var addCallback = function() {
			var callback = function() {
				for (var i=0; i < callbacks.length; i++) {
					if (callbacks[i] == callback) {
						callbacks.splice(i, 1);
						break;
					}
				};
				if (callbacks.length == 0 && params.complete && typeof(params.complete) == "function" && !completed) {
					completed = true;
					params.complete();
				}
			};
			callbacks.push(callback);
			
			return callback;
		};
		
		var positionElement = function(elem, x, y, width, height, duration) {			
			var $elem = $(elem);
			
			var positionSWF = function() {
				// Set the height and width of the flash object (stream) that sits in the container
				var obj = $elem.find("object") ? $elem.find("object") : $elem.find("embed");
				if (obj && obj.length > 0) {
					obj[0].width = width;
					obj[0].height = height;
				}	
			};
			
			// Set position and size of the stream container
			if (animate && $elem.hasClass(positionedClass) && $elem.moveSWF) {
				$elem.moveSWF(x, y, duration, addCallback());
				if ($elem.width() > width && $elem.height() > height) {
					// If it needs to be smaller then resize the SWF first so that 
					// it doesn't disappear (in Firefox)
					positionSWF();
					$elem.resizeSWF(width, height, duration, addCallback());
				} else {
					// Resize the swf after it animates if it needs to be bigger so that it doesn't
					// disappear (in Firefox)
					$elem.resizeSWF(width, height, duration, function() {
						positionSWF();
						addCallback()();
					});
				}
			} else {
				var targetPosition = {
					left: x + "px",
					top: y + "px",
					width: width + "px",
					height: height + "px"
				};
				
				$elem.css(targetPosition);
				positionSWF();
				// Fade us in if this element has never been positioned before
				if (!$elem.hasClass(positionedClass)) {
					$elem.css("opacity", 0.1).animate({opacity: 1}, duration).addClass(positionedClass);
				}
			}
		};
		
		var bigElem = this.find(">." + bigClass);
		var offsetLeft = 0;
		var offsetTop = 0;
		if (bigElem.length > 0) {
			firstBigElem = $(bigElem[0]);
			var availRatio = this.height() / this.width();
			// We have a big element to deal with
			var bigWidth;
			var bigHeight;
			if (availRatio > bigRatio) {
				// Size the big element to be the whole width up to 90% and figure out the height based on ratio
				bigWidth = Math.min(this.width(), Math.floor(this.width() * 0.9));
				bigHeight = Math.floor(bigWidth * bigRatio);
				offsetTop = bigHeight + parseInt(firstBigElem.css("paddingTop"), 10) + parseInt(firstBigElem.css("paddingBottom"), 10) +
                                    parseInt(firstBigElem.css("marginTop"), 10) + parseInt(firstBigElem.css("marginBottom"), 10);
			} else {
				// Size the big element to be the whole height up to 90% of the height
				bigHeight = Math.min(this.height(), Math.floor(this.height() * 0.9));
				bigWidth = Math.floor(bigHeight / bigRatio);
				offsetLeft = bigWidth + parseInt(firstBigElem.css("paddingLeft"), 10) + parseInt(firstBigElem.css("paddingRight"), 10) + 
                                    parseInt(firstBigElem.css("marginLeft"), 10) + parseInt(firstBigElem.css("marginRight"), 10);
			}
			
			positionElement(firstBigElem, 0, 0, bigWidth, bigHeight, duration);			
		}
        
		this.each(function() {
			var subscriberBox = this;
			// get the size of the container
			var Width = $(subscriberBox).width() - offsetLeft;
			var Height = $(subscriberBox).height() - offsetTop;
			$(subscriberBox).css("position", "relative");

			var layoutChildren = $(this).layoutChildren({
				ignoreClasses: ignoreClasses, 
				bigClass: bigClass
			});

			var count = layoutChildren.length;
			var min_diff;
			var targetCols;
			var targetRows;
			var availableRatio = Height / Width;

			for (var i=1; i <= count; i++) {
				var cols = i;
				var rows = Math.ceil(count / cols);
				var ratio = rows/cols * vid_ratio;
				var ratio_diff = Math.abs(availableRatio - ratio);
				if (!min_diff || (ratio_diff < min_diff)) {
					min_diff = ratio_diff;
					targetCols = cols;
					targetRows = rows;
				}
			};


			var videos_ratio = (targetRows/targetCols) * vid_ratio;

			if (videos_ratio > availableRatio) {
				targetHeight = Math.floor( Height/targetRows );
				targetWidth = Math.floor( targetHeight/vid_ratio );
			} else {
				targetWidth = Math.floor( Width/targetCols );
				targetHeight = Math.floor( targetWidth*vid_ratio );
			}

			var spacesInLastRow = (targetRows * targetCols) - count;
			var lastRowMargin = (spacesInLastRow * targetWidth / 2);
			var lastRowIndex = (targetRows - 1) * targetCols;

			var firstRowMarginTop = ((Height - (targetRows * targetHeight)) / 2);
			var firstColMarginLeft = ((Width - (targetCols * targetWidth)) / 2);

			// Loop through each stream in the container and place it inside
			var x = 0;
			var y = 0;
			layoutChildren.each(function(i, elem) {
				if (i % targetCols == 0) {
					// We are the first element of the row
					x = firstColMarginLeft;
					if (i == lastRowIndex) x += lastRowMargin;
					y += i == 0 ? firstRowMarginTop : targetHeight;
				} else {
					x += targetWidth;
				}

				$(elem).css("position", "absolute");
                var actualWidth = targetWidth - parseInt($(elem).css("paddingLeft"), 10) - parseInt($(elem).css("paddingRight"), 10) - 
                                    parseInt($(elem).css("marginLeft"), 10) - parseInt($(elem).css("marginRight"), 10);
                var actualHeight = targetHeight - parseInt($(elem).css("paddingTop"), 10) - parseInt($(elem).css("paddingBottom"), 10) -
                                    parseInt($(elem).css("marginTop"), 10) - parseInt($(elem).css("marginBottom"), 10);

				positionElement(elem, x+offsetLeft, y+offsetTop, actualWidth, actualHeight, duration);
			});
		});
		
		// If we didn't animate then just call the callback straight away
		if (!animate && params.complete) params.complete();
		
		return this;
	};
	
	var divCount = 0;
	
	/*
	 *	createElement - creates a new element inside the layout container and returns its div id to
	 * 		be passed to the publish or subscribe method in the OpenTok API.
	 */
	$.fn.createElement = function() {
		var divId;
		this.each(function() {
			divId = "stream" + divCount++;
			var container = document.createElement("div");

			var div = document.createElement("div");
			div.setAttribute('id', divId);
			container.appendChild(div);
			$(container).addClass("swfContainer").css("overflow", "hidden");

			this.appendChild(container);
		});
		return divId;
	};
})(jQuery);