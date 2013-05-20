angular.module('slideviewer', []).
    config(['$routeProvider', function($routeProvider) {
      $routeProvider.
            when('/slide/14', {redirectTo: '/slide/1'}).
            when('/slide/:slideNum', {templateUrl:'slides/slides.html', controller: SlideCtrl}).
            otherwise({redirectTo: '/slide/1'});
    }]).
    directive('publisher', TB.angular.PublisherDirective).
    directive('subscriber', TB.angular.SubscriberDirective);
    