angular.module('greyback.controllers', [])

.controller('AppController', function ($scope, $sce, $ionicModal, $timeout, $util, $state, UserService, FacebookService, user) {
	console.log('AppController');
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.DOMAIN = DOMAIN;
	$scope.imageDir = DOMAIN + '/img/thumb/';

	$scope.user = user.User;

	$scope.trust = function (snippet) {
		return $sce.trustAsHtml(snippet);
	};

	$scope.alert = function (msg) {
		alert(msg);
	}

	//profile variables
	$scope.curDateObj = new Date();
	$scope.gradYears = $util.range($scope.curDateObj.getFullYear() - 4, $scope.curDateObj.getFullYear() + 10);

	$scope.profile = function (form) {
		console.log('AppController.profile');
		if (form.$valid) {
			$scope.user.profile = 1;
			UserService.profile($scope.user).then(function (data) {
				$util.alert('You have successfully updated your profile!').then(function () {
					$state.go('menu.tabs.home');
				});
			});
		} else {
			$util.alert('There was a problem with the information you entered. Please verify that you have all the needed information and try again.');
		}
	}

	$scope.logout = function () {
		console.log('AppController.logout');
		$util.confirm('Are you sure you want to logout?').then(function (answer) {
			if (answer) {
				FacebookService.logout();
				UserService.logout();
			}
		});
	}

	$scope.debug = function () {
		console.log($scope.user);
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

	$scope.birthdayDatePicker = {
		//		titleLabel: 'Title', //Optional
		//		todayLabel: 'Today', //Optional
		//		closeLabel: 'Close', //Optional
		//		setLabel: 'Set', //Optional
		//		setButtonType: 'button-assertive', //Optional
		//		todayButtonType: 'button-assertive', //Optional
		//		closeButtonType: 'button-assertive', //Optional
		//		inputDate: new Date(), //Optional
		//		mondayFirst: true, //Optional
		//		disabledDates: disabledDates, //Optional
		//		weekDaysList: weekDaysList, //Optional
		//		monthList: monthList, //Optional
		//		templateType: 'popup', //Optional
		//		modalHeaderColor: 'bar-positive', //Optional
		//		modalFooterColor: 'bar-positive', //Optional
		//		from: new Date(2012, 8, 2), //Optional
		//		to: new Date(2018, 8, 25), //Optional
		callback: function (val) { //Mandatory
			if (typeof $scope.user.User == 'undefined') {
				$scope.user.User = {};
			}
			$scope.user.User.birthday = val;
		}
	};
})

.controller('HomeController', function ($scope, $q, $state, $ionicSlideBoxDelegate, ImgCache, ArticleService, user, articles) {
	console.log('HomeController');

	$scope.articles = articles;

	$scope.refresh = function () {
		console.log('HomeController.refresh');
		ImgCache.clearCache(function () {
			console.log('clearCache');
		});

		ArticleService.refresh().then(function (results) {
			$scope.articles = results;
			$ionicSlideBoxDelegate.update();
			$scope.$broadcast('scroll.refreshComplete');
		});

	}

	$scope.$on('$ionicView.enter', function (e) {
		console.log('State: ' + $state.current.name);
		if (!user.User.profile) {
			$state.go('menu.tabs.profile');
		}
	});

	$scope.$on("$ionicView.loaded", function () {
		//		console.error('view loaded');
		$scope.refresh();
	});
})

.controller('JobController', function ($scope, $q, $util, $state, JobService) {
	console.log('JobController');

	$scope.filter = {};

	$scope.jobs = JobService.results;

	$scope.job = JobService.details;

	if (!$scope.jobs.length) {
		$state.go('menu.tabs.explore_search');
	}

	$scope.search = function (form) {
		JobService.search($scope.filter).then(function (results) {
			$scope.jobs = JobService.results;
			$state.go('menu.tabs.explore_results');
		});
	}

	$scope.details = function (index) {
		JobService.set($scope.jobs[index]).then(function () {
			$state.go('menu.tabs.explore_details');
		});
	}
})

.controller('EventController', function ($scope, $state, events, EventService) {
	console.log('EventController');
	$scope.events = events;

	if (!$scope.events.length) {
		$state.go('menu.tabs.dates');
	}

	$scope.event = EventService.details;

	$scope.details = function (month, index) {
		console.log('EventController.details');
		EventService.set($scope.events[month]['events'][index]).then(function () {
			$state.go('menu.tabs.date_details');
		});
	}
})

.controller('CounselorController', function ($scope, $state, listing, CounselorService) {
	console.log('CounselorController');
	$scope.listing = listing;

	$scope.refresh = function () {
		console.log('CounselorController.refresh');

		CounselorService.refresh().then(function (results) {
			$scope.listing = results;
			$scope.$broadcast('scroll.refreshComplete');
		});

	}

	$scope.$on("$ionicView.loaded", function () {
		//		console.error('view loaded');
		$scope.refresh();
	});
})

.controller('PlanController', function ($scope, $state, $util, PlanService, UserService, ListService, path, plan) {
	console.log('PlanController');

	$scope.plan_user = plan;
	$scope.steps = {};

	$scope.collegesteps = ListService.collegesteps;
	$scope.militarysteps = ListService.militarysteps;
	$scope.careersteps = ListService.careersteps;
	$scope.link = '';

	if (!path) {
		if (!$scope.plan_user.path) {
			$state.go('menu.tabs.plan_start');
		} else {
			switch ($scope.plan_user.path) {
				case 'Career School':
					$scope.steps = ListService.careersteps;
					$scope.link = 'career';
					break;
				case 'Military':
					$scope.steps = ListService.militarysteps;
					$scope.link = 'military';
					break;
				case 'Two Year College':
					$scope.steps = ListService.collegesteps;
					$scope.link = 'twoyear';
					break;
				default:
					$scope.steps = ListService.collegesteps;
					$scope.link = 'fouryear';
					break;
			}
		}
	}

	$scope.$on('$ionicView.enter', function (e) {
		console.log('State: ' + $state.current.name);
		if (Object.keys($scope.plan_user).length && !path) {
			$state.go('menu.tabs.plan_results');
		}
	});

	$scope.store = function (form) {
		console.log('PlanController.store');
		if (form.$valid) {
			$scope.plan_user.path = path;
			PlanService.set($scope.plan_user).then(function (result) {
				$state.go('menu.tabs.plan_results');
			});
		} else {
			$util.alert('There was a problem with the information you entered. Please verify that you have all the needed information and try again.');
		}
	}

	$scope.reset = function () {
		$scope.plan_user = {};
		PlanService.set($scope.plan_user).then(function (result) {
			$state.go('menu.tabs.plan_start');
		});
	}

	$scope.counselor = function () {
		UserService.counselor().then(function (data) {
			$util.alert('Your Plan has been sent to the counselors at your high school if you are in AISD.');
		});
	}

	$scope.share = function () {
		$util.prompt('What email would you like to share your plan with?').then(function (email) {
			if (email) {
				UserService.share(email).then(function (data) {
					$util.alert('Your Plan has been shared with the email address you provided.');
				});
			} else {
				$util.alert('Please enter an email address');
			}
		})

	}
})

.controller('QuizController', function ($scope, $util, $state, QuizService) {
	console.log('QuizController');
	var current;

	$scope.quiz = {};

	$scope.results = QuizService.results;


	$scope.calculate = function (form) {
		if (form.$valid) {
			console.log($scope.quiz);
			var results = {};
			angular.forEach($scope.quiz, function (value, key) {
				if (value !== 'NULL') {
					if (results[value]) {
						results[value]++;
					} else {
						results[value] = 1;
					}
				} else {
					console.log('WHAT?');
				}
			});
			angular.forEach(results, function (value, key) {
				if (value > 1) {
					$scope.results.push(key);
				}
			});

			if ($scope.results) {
				QuizService.set($scope.results).then(function () {
					$state.go('menu.tabs.quiz_results');
				})
			}

			console.log($scope.results);
		} else {
			$util.alert('Please answer all the questions.');
		}
	}
});
