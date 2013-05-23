function SlideCtrl($scope) {
    // Do nothing for now
}

var OpenTokCtrl = TB.angular.createOpentokCtrl(1127, 
            "1_MX4xMTI3fn5UdWUgTWF5IDE0IDE3OjM0OjMyIFBEVCAyMDEzfjAuNTI4ODU1NH4", 
            "T1==cGFydG5lcl9pZD0xMTI3JnNka192ZXJzaW9uPXRicHktdjAuOTEuMjAxMS0wNy0wNSZzaWc9OWZlYmIxMGQ2ZTJmODkzNzE4YTIxZDk5ZWYzZGFiNWYzZWVjZjdjNTpleHBpcmVfdGltZT0xMzcxMjA2MDczJm5vbmNlPTc0MTA5MyZjcmVhdGVfdGltZT0xMzY4NTc4MDczJnJvbGU9bW9kZXJhdG9yJnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNVVkV1VnVFdGNUlERTBJREUzT2pNME9qTXlJRkJFVkNBeU1ERXpmakF1TlRJNE9EVTFOSDQ=");

function SlidesCtrl($scope, $routeParams, $location, $window) {
    $scope.slides = OT._.map([1,2,3,4,5,6,7,8,9,10,11,12,13], function(num) {
        return "slide/" + num + ".html";
    });
    
    $($window).on("resize", function() {
        $scope.$apply(function() {
            $scope.slideWidth = $window.innerWidth;
        });
    });
    var slidesRef = new Firebase('https://webrtc-meetup.firebaseIO.com/slideNum');
    
    var getSlideNum = function() {
        if ($location.$$path) return parseInt($location.$$path.match("\/slide\/(.+)")[1], 10);
        return 1;
    };
    
    var setSlideNum = function(slideNum, push) {
        $scope.$apply(function() {
            $scope.slideNum = slideNum;
            $location.path("/slide/" + $scope.slideNum);
            
            if (push) slidesRef.set(slideNum);
        });
    };
    
    var slideNumUpdated = function(snapshot) {
        if (snapshot.val()) setSlideNum(parseInt(snapshot.val(), 10), false);
    };
    
    slidesRef.on("value", slideNumUpdated);
    
    $scope.slideNum = getSlideNum();
    
    var arrowControls = function(event) {
        var slideNum;
        if (event.keyCode === 37) {
            slideNum = getSlideNum() - 1;
        } else if (event.keyCode === 39) {
            slideNum = getSlideNum() + 1;
        }
        
        if (slideNum) {
            setSlideNum(slideNum, true);
        }
    };
    
    angular.element(document.body).bind("keydown", arrowControls);
    
    $scope.$on("$destroy", function() {
        angular.element(document.body).unbind("keydown", arrowControls);
        slidesRef.off("value", slideNumUpdated);
    });
}
