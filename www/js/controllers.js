angular.module('greyback.controllers', [])

.controller('AppController', function ($scope, $sce, $ionicModal, $timeout) {
	console.warn('AppController');
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.DOMAIN = DOMAIN;
	$scope.imageDir = DOMAIN + '/img/thumb/';

	$scope.trust = function (snippet) {
		return $sce.trustAsHtml(snippet);
	};

})

.controller('HomeController', function ($scope, $q, $ionicSlideBoxDelegate, ImgCache) {
	console.warn('HomeController');

	$scope.refresh = function () {
		console.log('HomeController.refresh');
		ImgCache.clearCache(function () {
			console.log('clearCache');
		});
//		$q.all([NewsService.latest(), CommunityService.latest()]).then(function (data) {
//			console.log('HomeController.refresh.all');
//			$scope.banners = data[0];
//			$scope.posts = data[1];
//			$ionicSlideBoxDelegate.update();
//			$scope.$broadcast('scroll.refreshComplete');
//		});;

	}

	$scope.$on("$ionicView.loaded", function () {
		//		console.error('view loaded');
		//		$scope.refresh();
	});
});
