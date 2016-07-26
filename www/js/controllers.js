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

})

.controller('UserController', function ($scope, UserService) {
	console.log('UserController');

	$scope.signupUser = {};

	$scope.signup = function (form) {
		console.log('SignupController.signup');
		if (form.$valid) {
			UserService.createUser($scope.signupUser).then(function (data) {
				$scope.signupUser = {};
			});
		} else {
			console.log('TEST');
		}
	}

	$scope.fblogin = function () {
		facebookConnectPlugin.getLoginStatus(function (success) {
			if (success.status === 'connected') {
				// The user is logged in and has authenticated your app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed request, and the time the access token
				// and signed request each expire
				console.log('getLoginStatus', success.status);

				// Check if we have our user saved
				var user = UserService.getUser('facebook');

				if (!user.userID) {
					getFacebookProfileInfo(success.authResponse)
						.then(function (profileInfo) {
							// For the purpose of this example I will store user data on local storage
							UserService.setUser({
								authResponse: success.authResponse,
								userID: profileInfo.id,
								name: profileInfo.name,
								email: profileInfo.email,
								picture: "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
							});

							$state.go('app.home');
						}, function (fail) {
							// Fail get profile info
							console.log('profile info fail', fail);
						});
				} else {
					$state.go('app.home');
				}
			} else {
				// If (success.status === 'not_authorized') the user is logged in to Facebook,
				// but has not authenticated your app
				// Else the person is not logged into Facebook,
				// so we're not sure if they are logged into this app or not.

				console.log('getLoginStatus', success.status);

				$ionicLoading.show({
					template: 'Logging in...'
				});

				// Ask the permissions you need. You can learn more about
				// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
				facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
			}
		});
	};

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
