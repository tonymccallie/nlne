angular.module('greyback.controllers', [])

.controller('AppController', function ($scope, $sce, $ionicModal, $timeout, UserService) {
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

})

.controller('UserController', function ($scope, $state, $q, $ionicLoading, $ionicPopup, $util, UserService, FacebookService) {
	console.log('UserController');

	$scope.signupUser = {};

	$scope.loginUser = {};

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
				$scope.loginUser = {};
				$state.go('login');
			});
		} else {
			$util.alert('There was a problem with the information you entered. Please verify that you have all the needed information and try again.');
		}
	}
	
	$scope.fblogout = function() {
		FacebookService.logout();
		$util.alert('Facebook.logout').then(function() {
			$state.go('login');
		});
	}
	
	$scope.fblogin = function () {
		console.log('UserController.fblogin');
		
		FacebookService.login();
	}

	$scope.fbloginOLD = function () {
		console.log('UserController.fblogin');
		ngFB.login({
			scope: 'email,public_profile'
		}).then(function (response) {
			if (response.status === 'connected') {
				console.log(['Facebook login succeeded', response]);
				ngFB.api({
					path: '/me',
					params: {
						fields: 'id,email,first_name,last_name'
					}
				}).then(function (user) {
					UserService.saveFacebook(user).then(function (user) {
						$scope.user = user;
					});
					//MAKE AN APP USER
					//$scope.user = user;
				}, function (error) {
					alert('Facebook error: ' + error.error_description);
				});
			} else {
				alert('Facebook login failed');
			}
		});
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
