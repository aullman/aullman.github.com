(function(window) {	
	window.SlideShow = function() {
		this.init = function(slides) {
			for (var slide in slides) {
				var iframe = document.createElement("iframe");
				iframe.src = slides[slide];
				document.body.appendChild(iframe);
			};
		};
	};	
	
})(window);