var DOMAIN = 'http://www.gracepointcoppell.org'
	//DEVELOPMENT
var devtest = /localhost/.test(window.location.hostname);
if (devtest) {
	DOMAIN = 'http://localhost/greyback_shiny';
	isMobile = false;
}
devtest = /threeleaf/.test(window.location.hostname);
if (devtest) {
	DOMAIN = 'http://office.threeleaf.net:8080/greyback_shiny';
	isMobile = false;
}

angular.module('greyback', ['ionic', 'greyback.controllers', 'greyback.services', 'greyback.utils', 'ImgCache'])

.run(function ($ionicPlatform, ImgCache) {
	$ionicPlatform.ready(function () {
		console.log('$ionicPlatform.ready');
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		ImgCache.$init();
	});
})

.config(function ($stateProvider, $urlRouterProvider, ImgCacheProvider) {
	ImgCacheProvider.setOptions({
		debug: true,
		usePersistentCache: true
	});

	ImgCacheProvider.manualInit = true;

	// ImgCache library is initialized automatically,
	// but set this option if you are using platform like Ionic -
	// in this case we need init imgcache.js manually after device is ready

	$stateProvider
		.state('menu', {
			url: '/menu',
			abstract: true,
			templateUrl: 'templates/system/menu.html',
			controller: 'AppController'
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

	.state('menu.tabs.explore', {
		url: '/explore',
		views: {
			'tab-explore': {
				templateUrl: "templates/explore/explore_home.html"
			}
		}
	})

	.state('menu.tabs.dates', {
		url: '/dates',
		views: {
			'tab-dates': {
				templateUrl: "templates/dates/dates_home.html"
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
		views: {
			'tab-static': {
				templateUrl: "templates/users/profile.html"
			}
		}
	})

	.state('login', {
		url: '/login',
		templateUrl: "templates/users/login.html"
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/menu/tabs/home');
});
