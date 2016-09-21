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
	console.log('.run');
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
		templateUrl: "templates/users/forgot.html"
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');
});
