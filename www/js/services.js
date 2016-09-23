angular.module('greyback.services', [])

.service('UserService', function ($q, $http, $location, $ionicSlideBoxDelegate, $localStorage, $state, $data) {
	console.warn('UserService');

	var self = this;
	var config = {
		login: {
			name: 'UserService.login',
			url: '/ajax/users/login',
			variable: 'user'
		},
		create: {
			name: 'UserService.create',
			url: '/ajax/users/register',
			variable: 'user'
		},
		recover: {
			name: 'UserService.recover',
			url: '/ajax/users/recover',
			variable: 'user'
		}
	};

	self.user = null;
	
	self.init = function () {
		console.log('UserService.init');
		var deferred = $q.defer();
		self.local().then(function (storedUser) {
			if (typeof storedUser.User === 'undefined') {
				console.log('UserService.init: need to login');
				//HIDE FOR DEV
				$state.go('login');
				deferred.resolve(self.user);
			} else {
				console.log('UserService.init: use local');
				self.user = storedUser;
				deferred.resolve(self.user);
			}
		});

		//		$location.path('/tab/home');
		//		$location.replace();

		return deferred.promise;
	}
	
	self.local = function ($category) {
		console.log('UserService.local');
		var deferred = $q.defer();
		var localUser = $localStorage.getObject('GoAmaUser');
		deferred.resolve(localUser);
		return deferred.promise;
	}
	
	self.check = function () {
		console.log('UserService.check');
		var deferred = $q.defer();
		if (!self.user) {
			console.log('UserService.checkUser: no user');
			self.init().then(function (initUser) {
				deferred.resolve(self.user);
			});
		} else {
			console.log('UserService.checkUser: had user');
			deferred.resolve(self.user);
		}
		return deferred.promise;
	}
	
	self.login = function(userform) {
		console.log('UserService.login');
		return $data.post(config.login, self, userform).then(function(data) {
			self.updateUser(data)
		});
	}
	
	self.logout = function () {
		console.log('UserService.logout');
		self.user = null;
		$localStorage.remove('GoAmaUser');
		//FacebookService.logout();
		$state.go('login');
	}

	self.create = function (userform) {
		console.log('UserService.create');
		return $data.post(config.create, self, userform);
	}

	self.recover = function (userform) {
		console.log('UserService.recover');
		return $data.post(config.recover, self, userform);
	}

	self.updateUser = function (user) {
		console.log('UserService.updateUser');
		var deferred = $q.defer();
		self.user = user;
		$localStorage.setObject('GoAmaUser', self.user);
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
})

.service('FacebookService', function ($ionicLoading, $localStorage, UserService) {
	console.warn('FacebookService');
	var self = this;
	
	if(typeof facebookConnectPlugin == 'undefined') {
		facebookConnectPlugin = {
			login: function(options, success, error) {
				success({});
			},
			logout: function(success, error) {
				success({});
			}
		}
	}

	self.logout = function () {
		facebookConnectPlugin.logout(function (success) {
			console.log(['logout success', success]);
		}, function (error) {
			console.log(['logout error', error]);
		});
	}

	//User hits the fb login button
	self.login = function () {
		console.log('FacebookService.login');
		
		$ionicLoading.show({
			template: 'Logging in...'
		});

		// Ask the permissions you need. You can learn more about
		// FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
		facebookConnectPlugin.login(['email', 'public_profile'], function (success) {
			console.warn(['FB connect success', success]);
			$ionicLoading.hide();
		}, function (error) {
			console.warn(['FB connect error', error]);
		});
		
		//this fires the os facebook login/permissions
//		facebookConnectPlugin.getLoginStatus(function (success) {
//			if (success.status === 'connected') {
//				// The user is logged in and has authenticated your app, and response.authResponse supplies
//				// the user's ID, a valid access token, a signed request, and the time the access token
//				// and signed request each expire
//				console.log('getLoginStatus', success.status);
//
//				getFacebookProfileInfo(success.authResponse)
//					.then(function (profileInfo) {
//						console.log(['profileInfo', profileInfo]);
//						// For the purpose of this example I will store user data on local storage
//						//							UserService.setUser({
//						//								authResponse: success.authResponse,
//						//								userID: profileInfo.id,
//						//								name: profileInfo.name,
//						//								email: profileInfo.email,
//						//								picture: "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
//						//							});
//
//						$state.go('app.home');
//					}, function (fail) {
//						// Fail get profile info
//						console.log('profile info fail', fail);
//					});
//			} else {
//				// If (success.status === 'not_authorized') the user is logged in to Facebook,
//				// but has not authenticated your app
//				// Else the person is not logged into Facebook,
//				// so we're not sure if they are logged into this app or not.
//
//				
//			}
//		});
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
