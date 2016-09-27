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
	console.log('HomeController');

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

.controller('PlanController', function ($scope, $state, PlanService) {
	console.log('PlanController');
	
	$scope.plan_user = {};
});
