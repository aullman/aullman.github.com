(function($) {
	
	/*
	 *	layout - Lays out and resizes the contents of the specified container in the optimal arrangement
	 *	and size so that they fill the space. This is intended for use with the OpenTok library to layout 
	 *	Subscribers and Publishers.
	 *
	 *	animate - Boolean value whether to animate the transition to the new layout.
	 */
	$.fn.layout = function(params) {
		var animate = params.animate || false;
		// Aspect ratio of the streams
		var vid_ratio = params.ratio || 3/4;
		var ignoreClasses = params.ignoreClasses || [];
		var duration = params.duration || 200;
		var bigClass = params.bigClass || "big";
		var bigRatio = params.bigRatio || 3/4;
		
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
		
		var bigElem = this.find(">.big");
		var offsetLeft = 0;
		var offsetTop = 0;
		if (bigElem.length > 0) {
			var availRatio = this.height() / this.width();
			// We have a big element to deal with
			var bigWidth;
			var bigHeight;
			if (availRatio > bigRatio) {
				// Size the big element to be the whole width and figure out the height based on ratio
				bigWidth = this.width();
				bigHeight = offsetTop = Math.floor(bigWidth * bigRatio);
			} else if (availRatio < bigRatio) {
				// Size the big element to be the whole height
				bigHeight = this.height();
				bigWidth = offsetLeft = Math.floor(bigHeight / bigRatio);
			} else {
				// They are equal so we need to leave some space for the other elements
				bigHeight = Math.floor(this.height() * 0.75);	// 75% of the height
				bigWidth = offsetLeft = Math.floor(bigHeight / bigRatio);
			}
			
			if (animate && bigElem.moveSWF) {
				bigElem.moveSWF(0, 0, duration, addCallback());
				bigElem.resizeSWF(bigWidth, bigHeight, duration, addCallback());
			} else {
				bigElem.height(bigHeight).width(bigWidth).css({
					top: "0px",
					left: "0px"
				});
			}
		}
        
		this.each(function() {
			var subscriberBox = this;
			// get the size of the container
			var Width = $(subscriberBox).width() - offsetLeft;
			var Height = $(subscriberBox).height() - offsetTop;
			$(subscriberBox).css("position", "relative");

			// Finds the ideal number of columns and rows to minimize the amount of wasted space
			var childSelector = ">*:not(." + bigClass + ")";
			for (var i=0; i < ignoreClasses.length; i++) {
				childSelector += ":not(." + ignoreClasses[i] + ")";
			};
			var count = $(this).find(childSelector).length;
			var min_diff;
			var targetCols;
			var targetRows;
			var availableRatio = Height / Width;
			for (var i=1; i <= count; i++) {
				var cols = i;
				var rows = Math.ceil(count / cols);
				var ratio = rows/cols * vid_ratio;
				var ratio_diff = Math.abs( availableRatio - ratio);
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
			$(this).find(childSelector).each(function(i, elem) {
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

				// Set position and size of the stream container
				if (animate && $(elem).moveSWF) {
					$(elem).moveSWF(x + offsetLeft, y + offsetTop, duration, addCallback());
					$(elem).resizeSWF(actualWidth, actualHeight, duration, addCallback());
				} else {
					var targetPosition = {
						left: (x + offsetLeft) + "px",
						top: (y + offsetTop) + "px",
						width: actualWidth + "px",
						height: actualHeight + "px"
					};
					
					$(elem).css(targetPosition);
				}

				// Set the height and width of the flash object (stream) that sits in the container
				var obj = $(elem).find("object") ? $(elem).find("object") : $(elem).find("embed");
				if (obj && obj.length > 0) {
					obj[0].width = actualWidth;
					obj[0].height = actualHeight;
				}
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
			$(container).addClass("swfContainer");

			this.appendChild(container);
		});
		return divId;
	};
})(jQuery);