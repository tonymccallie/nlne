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
		},
		profile: {
			name: 'UserService.profile',
			url: '/ajax/users/update',
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

	self.login = function (userform) {
		console.log('UserService.login');
		return $data.post(config.login, self, userform).then(function (data) {
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

	self.profile = function (userform) {
		console.log('UserService.profile');
		return $data.post(config.profile, self, userform).then(function (data) {
			self.updateUser(data)
		});;
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

.service('FacebookService', function ($q, $ionicLoading, $localStorage, $data, $state, UserService) {
	console.warn('FacebookService');
	var self = this;
	var config = {
		facebook: {
			name: 'FacebookService.facebook',
			url: '/ajax/users/facebook',
			variable: 'user'
		}
	};

	self.user = {};

	if (typeof facebookConnectPlugin == 'undefined') {
		facebookConnectPlugin = {
			login: function (options, success, error) {
				success({
					authResponse: {
						accessToken: '123456'
					}
				});
			},
			logout: function (success, error) {
				success({});
			},
			api: function (auth, rando, success, error) {
				success({
					first_name: 'Tony',
					last_name: 'McCallie',
					email: 'tonymccallie@gmail.com',
					id: '1234567'
				});
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
			getFacebookProfileInfo(success.authResponse).then(function (profileInfo) {
				console.log(['profileInfo', profileInfo]);

				//TODO create user here
				$data.post(config.facebook, self, profileInfo).then(function (data) {
					UserService.updateUser(data).then(function () {
						$state.go('menu.tabs.home');
					});
				});
			}, function (fail) {
				// Fail get profile info
				console.log('profile info fail', fail);
			});
			$ionicLoading.hide();
		}, function (error) {
			console.warn(['FB connect error', error]);
		})
	}

	// This method is to get the user profile info from the facebook api
	var getFacebookProfileInfo = function (authResponse) {
		console.log('FacebookService.getFacebookProfileInfo');
		var deferred = $q.defer();

		facebookConnectPlugin.api('/me?fields=email,first_name,last_name&access_token=' + authResponse.accessToken, null,
			function (response) {
				console.log(response);
				deferred.resolve(response);
			},
			function (response) {
				console.log(response);
				deferred.reject(response);
			}
		);
		return deferred.promise;
	};
})

.service('JobService', function ($q, $data) {
	console.warn('JobService');
	var self = this;
	var config = {
		search: {
			name: 'JobService.search',
			url: '/ajax/jobs/search',
			variable: 'results'
		}
	};

	self.results = [];

	self.details = {};

	self.search = function (filter) {
		console.log('JobService.search');
		return $data.post(config.search, self, filter);
	}

	self.set = function (job) {
		console.log('JobService.set');
		var deferred = $q.defer();
		self.details = job;
		deferred.resolve(self.details);
		return deferred.promise;
	}
})

.service('EventService', function ($q, $data) {
	console.warn('EventService');
	var self = this;
	var config = {
		upcoming: {
			name: 'EventService.upcoming',
			url: '/ajax/events/upcoming',
			variable: 'events'
		}
	};

	self.events = [];

	self.details = {};

	self.upcoming = function () {
		console.log('EventService.upcoming');
		return $data.get(config.upcoming, self);
	}

	self.set = function (event) {
		console.log('EventService.set');
		var deferred = $q.defer();
		self.details = event;
		deferred.resolve(self.details);
		return deferred.promise;
	}
})

.service('PlanService', function ($q) {
	console.warn('PlanService');
	var self = this;

	self.plan = {};

	self.set = function (plan) {
		console.log('EventService.set');
		var deferred = $q.defer();
		self.plan = plan;
		deferred.resolve(self.plan);
		return deferred.promise;
	}
})

.service('ArticleService', function ($data) {
	console.warn('ArticleService');
	var self = this;
	var config = {
		latest: {
			name: 'ArticleService.latest',
			url: '/ajax/articles/latest',
			variable: 'articles'
		}
	};
	
	self.articles = [];
	
	self.latest = function() {
		console.log('ArticleService.latest');
		return $data.populate(config.latest, self);
	}
	
	self.refresh = function() {
		console.log('ArticleService.refresh');
		return $data.get(config.latest, self);
	}
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
