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
		$localStorage.setObject('NewMarriageUser', self.user);
		deferred.resolve(self.user);
		return deferred.promise;
	}

	self.setUser = function (user_data) {
		window.localStorage.starter_facebook_user = JSON.stringify(user_data);
	}

	self.getUser = function (user_data) {
		return JSON.parse(window.localStorage.starter_facebook_user || '{}');
	}

	self.populate = function () {
		console.log('NewsService.populate');
		return $data.populate(config.latest, self);
	}

	self.latest = function () {
		console.log('NewsService.latest');
		return $data.get(config.latest, self);
	}

	self.recoverUser = function (user) {
		console.log(['UserService.recoverUser'], user);
		var promise = $http.post(DOMAIN + '/ajax/users/recover', user)
			.success(function (response, status, headers, config) {
				switch (response.status) {
					case 'SUCCESS':
						alert('An email has been sent to this address with password reset instructions.');
						$state.go('login');
						break;
					case 'MESSAGE':
						alert(response.data);
						$state.go('login');
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
