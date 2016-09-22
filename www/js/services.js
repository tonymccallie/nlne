angular.module('greyback.services', [])

.service('UserService', function ($q, $http, $location, $ionicSlideBoxDelegate, $localStorage, $state, $data) {
	console.warn('UserService');

	var self = this;
	var config = {
		latest: {
			name: 'UserService.user',
			url: '/ajax/plugin/news/news_articles/json/limit:4/category:3',
			variable: 'banners'
		},
		create: {
			name: 'UserService.create',
			url: '/ajax/users/register',
			variable: 'user'
		}
	};

	self.user = null;

	self.create = function (userform) {
		console.log('UserService.create');
		return $data.post(config.create, self, userform);
	}

	self.createUser = function (user) {
		console.log('UserService.createUser');
		var promise = $http.post(DOMAIN + '/ajax/users/register', user)
			.success(function (response, status, headers, config) {
				switch (response.status) {
					case 'SUCCESS':
						self.updateUser(response.data).then(function () {
							$state.go('menu.tabs.home');
						});
						break;
					case 'MESSAGE':
						alert(response.data);
						$state.go('login');
						break;
					default:
						alert('there was a server error for creating the user');
						console.log(response);
						break;
				}
			})
			.error(function (response, status, headers, config) {
				console.log(['error', status, headers, config]);
			});
		return promise;
	}

	self.updateUser = function (user) {
		console.log('UserService.updateUser');
		var deferred = $q.defer();
		self.user = user;
		$localStorage.setObject('GoAmarilloUser', self.user);
		deferred.resolve(self.user);
		return deferred.promise;
	}

	self.populate = function () {
		console.log('UserService.populate');
		return $data.populate(config.latest, self);
	}

	self.latest = function () {
		console.log('UserService.latest');
		return $data.get(config.latest, self);
	}

	self.recoverUser = function (user) {
		console.log(['UserService.recoverUser'], user);
		var promise = $http.post(DOMAIN + '/ajax/users/recover', user)
			.success(function (response, status, headers, config) {
				switch (response.status) {
					case 'SUCCESS':
						$util.alert('An email has been sent to this address with password reset instructions.').then(function () {
							$state.go('login');
						});
						break;
					case 'MESSAGE':
						$util.alert(response.data).then(function () {
							$state.go('login');
						});
						break;
					case 'ERROR':
						alert(response.data);
						break;
					default:
						alert('there was a server error for Messages');
						console.log(response);
						break;
				}
			})
			.error(function (response, status, headers, config) {
				console.log(['error', status, headers, config]);
			});
		return promise;
	}

	self.article = function (articleIndex) {
		console.log(['NewsService.get', articleIndex]);
		if (self.banners.length) {
			return self.banners[articleIndex];
		} else {
			$location.path('#/menu/tabs/home');
			$location.replace();
			return null;
		}
	}
})

.service('FacebookService', function ($ionicLoading, UserService) {
	console.warn('FacebookService');
	var self = this;

	self.logout = function() {
		facebookConnectPlugin.logout(function(success) {
			console.log(['logout success',success]);
		}, function(error) {
			console.log(['logout error',error]);
		});
	}
	
	self.login = function () {
		console.log('FacebookService.login');
		facebookConnectPlugin.getLoginStatus(function (success) {
			console.log(['success', success]);
			if (success.status === 'connected') {
				// The user is logged in and has authenticated your app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed request, and the time the access token
				// and signed request each expire
				console.log('getLoginStatus', success.status);

				// Check if we have our user saved
				//USE LOCALSTORAGE or the like
				var user = {}; //UserService.getUser('facebook');

				if (!user.userID) {
					getFacebookProfileInfo(success.authResponse)
						.then(function (profileInfo) {
							console.log(['profileInfo', profileInfo]);
							// For the purpose of this example I will store user data on local storage
							//							UserService.setUser({
							//								authResponse: success.authResponse,
							//								userID: profileInfo.id,
							//								name: profileInfo.name,
							//								email: profileInfo.email,
							//								picture: "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
							//							});

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

				console.log('getLoginStatus.fail', success.status);

				$ionicLoading.show({
					template: 'Logging in...'
				});

				// Ask the permissions you need. You can learn more about
				// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
				facebookConnectPlugin.login(['email', 'public_profile'], function (success) {
					console.warn(['connect success', success]);
				}, function (error) {
					console.warn(['connect error', error]);
				});
			}
		});
	}

	var fbLoginSuccess = function (response) {
		console.log('FacebookService.fbLoginSuccess');
		if (!response.authResponse) {
			fbLoginError("Cannot find the authResponse");
			return;
		}

		var authResponse = response.authResponse;

		getFacebookProfileInfo(authResponse)
			.then(function (profileInfo) {
				// For the purpose of this example I will store user data on local storage
				UserService.setUser({
					authResponse: authResponse,
					userID: profileInfo.id,
					name: profileInfo.name,
					email: profileInfo.email,
					picture: "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
				});
				$ionicLoading.hide();
				$state.go('app.home');
			}, function (fail) {
				// Fail get profile info
				console.log('profile info fail', fail);
			});
	};

	// This is the fail callback from the login method
	var fbLoginError = function (error) {
		console.log('FacebookService.fbLoginError', error);
		$ionicLoading.hide();
	};

	// This method is to get the user profile info from the facebook api
	var getFacebookProfileInfo = function (authResponse) {
		console.log('FacebookService.getFacebookProfileInfo');
		var info = $q.defer();

		facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
			function (response) {
				console.log(response);
				info.resolve(response);
			},
			function (response) {
				console.log(response);
				info.reject(response);
			}
		);
		return info.promise;
	};
})

.service('PtrService', function ($timeout, $ionicScrollDelegate) {
	console.warn('PtrService');
	/**
	 * Trigger the pull-to-refresh on a specific scroll view delegate handle.
	 * @param {string} delegateHandle - The `delegate-handle` assigned to the `ion-content` in the view.
	 */
	this.triggerPtr = function (delegateHandle) {

		$timeout(function () {

			var scrollView = $ionicScrollDelegate.$getByHandle(delegateHandle).getScrollView();

			if (!scrollView) return;

			scrollView.__publish(
				scrollView.__scrollLeft, -scrollView.__refreshHeight,
				scrollView.__zoomLevel, true);

			var d = new Date();

			scrollView.refreshStartTime = d.getTime();

			scrollView.__refreshActive = true;
			scrollView.__refreshHidden = false;
			if (scrollView.__refreshShow) {
				scrollView.__refreshShow();
			}
			if (scrollView.__refreshActivate) {
				scrollView.__refreshActivate();
			}
			if (scrollView.__refreshStart) {
				scrollView.__refreshStart();
			}

		});

	}
});
