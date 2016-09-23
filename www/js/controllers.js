angular.module('greyback.controllers', [])

.controller('AppController', function ($scope, $sce, $ionicModal, $timeout, $util, UserService, FacebookService, user) {
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

	$scope.alert = function (msg) {
		alert(msg);
	}

	$scope.logout = function () {
		$util.confirm('Are you sure you want to logout?').then(function (answer) {
			if (answer) {
				FacebookService.logout();
				UserService.logout();
			}
		});
	}
})

.controller('UserController', function ($scope, $state, $q, $ionicLoading, $ionicPopup, $util, UserService, FacebookService) {
	console.log('UserController');

	$scope.signupUser = {};
	$scope.loginUser = {};
	$scope.recoverUser = {};

	$scope.signup = function (form) {
		console.log('UserController.signup');
		if (form.$valid) {
			UserService.create($scope.signupUser).then(function (data) {
				$util.alert('You have successfully created an account! Please click Continue to login.').then(function () {
					$scope.signupUser = {};
					$state.go('login');
				});
			});
		} else {
			$util.alert('There was a problem with the information you entered. Please verify that you have all the needed information and try again.');
		}
	}

	$scope.login = function (form) {
		console.log('UserController.login');
		if (form.$valid) {
			UserService.login($scope.loginUser).then(function (data) {
				console.log(['step2', data]);
				$scope.loginUser = {};
				$state.go('menu.tabs.home');
			});
		} else {
			$util.alert('There was a problem with the information you entered. Please verify that you have all the needed information and try again.');
		}
	}

	$scope.recover = function (form) {
		console.log('UserController.recover');
		if (form.$valid) {
			UserService.recover($scope.recoverUser).then(function (data) {
				$util.alert('An email has been sent to this address with password reset instructions.').then(function () {
					$scope.recoverUser = {};
					$state.go('login');
				});
			});
		} else {
			$util.alert('There was a problem with the information you entered. Please verify that you have all the needed information and try again.');
		}
	}

	$scope.fblogout = function () {
		FacebookService.logout();
	}

	$scope.fblogin = function () {
		console.log('UserController.fblogin');
		FacebookService.login();
	}
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
