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
		},
		counselor: {
			name: 'UserService.counselor',
			url: '/ajax/users/counselor',
			variable: 'user'
		},
		share: {
			name: 'UserService.share',
			url: '/ajax/users/share',
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

	self.local = function () {
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
			self.updateLocal(data)
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
			self.updateLocal(data)
		});
	}

	self.updateLocal = function (user) {
		console.log('UserService.updateLocal');
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
	
	self.share = function (email) {
		console.log('UserService.share');
		return $data.post(config.share, self, {user:self.user, email:email});
	}

	self.counselor = function () {
		console.log('UserService.counselor');
		return $data.post(config.counselor, self, self.user);
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

	//DUMMY CODE FOR DESKTOP DEV
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
	//END DUMMY

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
					UserService.updateLocal(data).then(function () {
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

.service('CounselorService', function ($q, $data) {
	console.warn('CounselorService');
	var self = this;
	var config = {
		listing: {
			name: 'CounselorService.listing',
			url: '/ajax/schools/listing',
			variable: 'counselors'
		}
	};

	self.counselors = [];

	self.listing = function () {
		console.log('CounselorService.listing');
		return $data.populate(config.listing, self);
	}

	self.refresh = function () {
		console.log('CounselorService.refresh');
		return $data.get(config.listing, self);
	}
})

.service('PlanService', function ($q, $data, $state, $localStorage, UserService) {
	console.warn('PlanService');
	var self = this;

	self.plan = null;

	self.get = function () {
		console.log('PlanService.get');
		var deferred = $q.defer();
		if (!self.plan) {
			console.log('PlanService.get: pull plan from User');
			UserService.check().then(function (data) {
				self.plan = $localStorage.toObj(data.User.json);
				deferred.resolve(self.plan);
			});
		} else {
			console.log('PlanService.get: had plan');
			deferred.resolve(self.plan);
		}
		return deferred.promise;
	}

	self.set = function (plan) {
		console.log('PlanService.set');
		var deferred = $q.defer();
		self.plan = plan;
		var user = UserService.user;
		user.User.json = $localStorage.toJSON(self.plan);
		UserService.profile(user.User).then(function (data) {
			deferred.resolve(self.plan);
		});
		return deferred.promise;
	}
})

.service('QuizService', function ($q, $data) {
	console.warn('QuizService');
	var self = this;

	self.results = [];

	self.set = function (results) {
		console.log('QuizService.set');
		var deferred = $q.defer();
		self.results = results;
		deferred.resolve(self.results);
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

	self.latest = function () {
		console.log('ArticleService.latest');
		return $data.populate(config.latest, self);
	}

	self.refresh = function () {
		console.log('ArticleService.refresh');
		return $data.get(config.latest, self);
	}
})

.service('ListService', function () {
	console.warn('ListService');
	var self = this;

	self.teststeps = {
		step1: 'Test Stuff',
		step2: 'Test Stuff 3',
		step3: 'Test Stuff 5'
	}

	self.careersteps = {
		step1: "Choose Career School",
		step2: "Tour Career School",
		step3: "Interview Past Graduate",
		step4: "Fill Out Application",
		step5: "Submit Application Fee (If Required)",
		step6: "Schedule Start Date"
	};

	self.militarysteps = {
		step1: "Decide Enlisted or Officer",
		step2: "Visiting a Recruiter",
		step3: "Military Entrance Processing Station (MEPS)",
		step4: "Pass the Armed Services Vocational Aptitude Battery (ASVAB)",
		step5: "Pass the Physical Examination",
		step6: "Meet With a MEPS Career Counselor and Determine a Career",
		step7: "Take the Oath of Enlistment (swearing in)",
		step8: "Basic Training (Boot Camp)"
	};

	self.collegesteps = {
		step1: "Get the application",
		step2: "Make a note of the regular application deadline",
		step3: "Make a note of the early application deadline",
		step4: "Request high school transcript sent",
		step5: "Request midyear grade report sent",
		step6: "Find out if an admission test is required",
		step7: "Take an admission test, if required",
		step8: "Take required or recommended tests (SAT, ACT, TSI, AP Exams)",
		step9: "Send admission-test scores",
		step10: "Send other test scores",
		step11: "Request recommendation letters",
		step12: "Send thank-you notes to recommendation writers",
		step13: "Draft initial essay",
		step14: "Proofread essay for spelling and grammar",
		step15: "Revise your essay",
		step16: "Interview at college campus",
		step17: "Submit FAFSA",
		step18: "Make a note of the priority financial aid deadline",
		step19: "Make a note of the regular financial aid deadline",
		step20: "Complete college application",
		step21: "Make copies of all application materials",
		step22: "Pay application fee",
		step23: "Sign and send application",
		step24: "Submit college aid form, if needed",
		step25: "Submit state aid form, if needed",
		step26: "Confirm receipt of application materials",
		step27: "Send additional material, if needed",
		step28: "Tell school counselor that you applied",
		step29: "Receive letter from office of admission",
		step30: "Receive financial aid award letter",
		step31: "Meet deadline to accept admission and send deposit",
		step32: "Accept financial aid offer",
		step33: "Notify the colleges you will not attend"
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
