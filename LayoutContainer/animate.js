(function($) {
	
	var resizers = [];
	var movers = [];
	
	/*
	 *	A custom animation plugin that works with SWFs. Default jQuery animate functions
	 *	don't behave nicely in some browsers. In Firefox it causes the SWF to reload every
	 *	time you move the SWF, in Safari it was causing the video to freeze in the Publisher
	 *	and Subscriber widgets.
	 */	
	
	function NumericAnimator(that, fromValue, targetValue, duration, callback) {
		if (duration == "fast") duration = 100;
		if (duration == "slow") duration = 500;
		var speed = 13;
		var interval;
		var step_amt;
		
		var currentValue = fromValue;

		this.getCurrentValue = function() {
			return currentValue;
		};
		
		this.setCurrentValue = function(value) {
			currentValue = value;
		};

		this.start = function() {
			var animator = this;
			interval = setInterval(function() {animator.step();}, speed);
		};

		this.step = function() {
			// Amount we change by at each step
			if (!step_amt)
				step_amt = (targetValue - this.getCurrentValue()) / (duration/speed);

			if (this.getCurrentValue() == targetValue) {
				this.stop();
				if (callback) callback();
				return;
			}

			if (step_amt > 0)
				this.setCurrentValue(this.getCurrentValue() + Math.min(Math.abs(step_amt), Math.abs(this.getCurrentValue() - targetValue)));
			else
				this.setCurrentValue(this.getCurrentValue() - Math.min(Math.abs(step_amt), Math.abs(this.getCurrentValue() - targetValue)));
		};

		this.stop = function() {
			clearInterval(interval);
		};
	}

	function Resizer (that, targetValue, duration, isWidth, callback) {
		this.parentClass = NumericAnimator;
		this.parentClass(that, isWidth ? $(that).width() : $(that).height(), targetValue, duration, callback);
		this.resizeElement = that;
		
		for (var i=0; i < resizers.length; i++) {
			if (that === resizers[i].resizeElement)
				resizers[i].stop();
		};		
		resizers.push(this);

		var superSetCurrentValue = this.setCurrentValue;
		this.setCurrentValue = function(value) {
			superSetCurrentValue(value);
			if (isWidth) {
				$(that).width(Math.round(value));
			} else {
				$(that).height(Math.round(value));
			}
		};
	}

	function Mover (that, targetValue, duration, cssKey, callback) {
		this.parentClass = NumericAnimator;
		this.parentClass(that, $(that).position()[cssKey], targetValue, duration, callback);
		this.moveElement = that;
		
		for (var i=0; i < movers.length; i++) {
			if (that === movers[i].moveElement)
				movers[i].stop();
		};		
		movers.push(this);

		var superSetCurrentValue = this.setCurrentValue;
		this.setCurrentValue = function(value) {
			superSetCurrentValue(value);
			$(that).css(cssKey, Math.round(value) + "px");
		};
	}

	/*
	 *	resizeSWF - animates a swf from it's current size to a new size.
	 *
	 *	width - The width to resize to
	 *	height - The height to resize to
	 *	duration - The duration the animation should take to execute in milliseconds
	 */
	$.fn.resizeSWF = function(width, height, duration, callback) {
		
		this.each(function() {
			var widthResizer = new Resizer(this, width, duration, true, callback);
			var heightResizer = new Resizer(this, height, duration, false, callback);
			widthResizer.start();
			heightResizer.start();
		});
		
		return this;
	};
	
	/*
	 *	moveSWF - animates a swf from it's current position to a new position.
	 *
	 *	x - The x (left) position to move to
	 *	y - The y (top) position to move to
	 *	duration - The duration the animation should take to execute in milliseconds
	 */
	$.fn.moveSWF = function(x, y, duration, callback) {
		
		this.each(function() {
			var xMover = new Mover(this, x, duration, "left", callback);
			var yMover = new Mover(this, y, duration, "top", callback);
			xMover.start();
			yMover.start();
		});
		
		return this;
	};
})(jQuery);