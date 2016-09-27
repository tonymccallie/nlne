var DOMAIN = 'http://goamaapp.server1.greyback.net/'
	//DEVELOPMENT
var devtest = /localhost/.test(window.location.hostname);
if (devtest) {
	DOMAIN = 'http://localhost/nlne_server/';
	isMobile = false;
}
devtest = /threeleaf/.test(window.location.hostname);
if (devtest) {
	DOMAIN = 'http://office.threeleaf.net:8080/nlne_server/';
	isMobile = false;
}

angular.module('greyback', ['ionic', 'greyback.controllers', 'greyback.services', 'greyback.utils', 'ImgCache', 'ngOpenFB', 'ngMessages'])

.run(function ($ionicPlatform, ImgCache, ngFB) {
	console.warn('.run');
	ngFB.init({
		appId: '512626388922766',
		oauthRedirectURL: DOMAIN + '/users/oauthlogin',
		logoutRedirectURL: DOMAIN + '/users/oauthlogout',
	});
	$ionicPlatform.ready(function () {
		console.log('$ionicPlatform.ready');
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		ImgCache.$init();
	});
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, ImgCacheProvider) {
	console.warn('.config')
	ImgCacheProvider.setOptions({
		debug: true,
		usePersistentCache: true
	});

	ImgCacheProvider.manualInit = true;

	// ImgCache library is initialized automatically,
	// but set this option if you are using platform like Ionic -
	// in this case we need init imgcache.js manually after device is ready

	$ionicConfigProvider.backButton.previousTitleText(false).text('');

	$stateProvider
		.state('menu', {
			url: '/menu',
			abstract: true,
			templateUrl: 'templates/system/menu.html',
			controller: 'AppController',
			resolve: {
				user: function (UserService) {
					console.log('Config.state.menu.resolve.user');
					return UserService.check();
				}
			}
		})

	.state('menu.tabs', {
		url: '/tabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: "templates/system/tabs.html",
			}
		}
	})

	.state('menu.tabs.home', {
		url: '/home',
		views: {
			'tab-home': {
				templateUrl: "templates/home.html",
				controller: 'HomeController'
			}
		}
	})

	.state('menu.tabs.plan', {
		url: '/plan',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/plan_home.html"
			}
		}
	})
	
	.state('menu.tabs.plan_college', {
		url: '/plan_college',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/college.html"
			}
		}
	})
	
	.state('menu.tabs.plan_start', {
		url: '/plan_start',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/start.html"
			}
		}
	})
	
	.state('menu.tabs.plan_career', {
		url: '/plan_career',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/plan_career.html",
				controller: "PlanController"
			}
		}
	})
	
	.state('menu.tabs.plan_military', {
		url: '/plan_military',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/plan_military.html"
			}
		}
	})
	
	.state('menu.tabs.plan_twoyear', {
		url: '/plan_twoyear',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/plan_twoyear.html"
			}
		}
	})
	
	.state('menu.tabs.plan_fouryear', {
		url: '/plan_fouryear',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/plan_fouryear.html"
			}
		}
	})
	
	.state('menu.tabs.plan_results', {
		url: '/plan_results',
		views: {
			'tab-plan': {
				templateUrl: "templates/plan/plan_results.html"
			}
		}
	})

	.state('menu.tabs.explore', {
		url: '/explore',
		views: {
			'tab-explore': {
				templateUrl: "templates/explore/explore_home.html"
			}
		}
	})

	.state('menu.tabs.explore_search', {
		url: '/explore_search',
		views: {
			'tab-explore': {
				templateUrl: "templates/explore/search.html",
				controller: "JobController"
			}
		}
	})

	.state('menu.tabs.explore_results', {
		url: '/explore_results',
		cache: false,
		views: {
			'tab-explore': {
				templateUrl: "templates/explore/results.html",
				controller: "JobController"
			}
		}
	})

	.state('menu.tabs.explore_details', {
		url: '/explore_details',
		cache: false,
		views: {
			'tab-explore': {
				templateUrl: "templates/explore/details.html",
				controller: "JobController"
			}
		}
	})

	.state('menu.tabs.dates', {
		url: '/dates',
		views: {
			'tab-dates': {
				templateUrl: "templates/dates/dates_home.html",
				controller: "EventController"
			}
		},
		resolve: {
			events: function (EventService) {
				console.log('menu.tabs.dates.resolve.events');
				return EventService.upcoming();
			}
		}
	})

	.state('menu.tabs.date_details', {
		url: '/date_details',
		cache: false,
		views: {
			'tab-dates': {
				templateUrl: "templates/dates/details.html",
				controller: "EventController"
			}
		},
		resolve: {
			events: function (EventService) {
				return EventService.events;
			}
		}
	})

	.state('menu.tabs.quizzes', {
		url: '/quizzes',
		views: {
			'tab-quizzes': {
				templateUrl: "templates/quizzes/quizzes_home.html"
			}
		}
	})

	.state('menu.tabs.profile', {
		url: '/profile',
		controller: "UserController",
		views: {
			'tab-static': {
				templateUrl: "templates/users/profile.html"
			}
		}
	})

	.state('login', {
		url: '/login',
		templateUrl: "templates/users/login.html",
		controller: "UserController"
	})

	.state('signup', {
		url: '/signup',
		templateUrl: "templates/users/signup.html",
		controller: "UserController"
	})

	.state('forgot', {
		url: '/forgot',
		templateUrl: "templates/users/forgot.html",
		controller: "UserController"
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');
});
