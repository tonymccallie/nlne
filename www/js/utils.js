angular.module('greyback.utils', [])

.service('$data', function ($q, $http, $location, $ionicSlideBoxDelegate, $localStorage, $state) {
	console.warn('$data');
	var self = this;

	self.values = {};

	self.populate = function ($config, obj) {
		console.log(['$data.populate:' + $config.name, $config]);
		var deferred = $q.defer();
		if (typeof self.values[$config.name] == 'undefined') {
			self.values[$config.name] = [];
		}
		if (self.values[$config.name].length === 0) {
			console.log($config.name + ': no records');
			self.local($config.name).then(function (localRecords) {
				if (localRecords.length > 0) {
					console.log($config.name + ': use local');
					self.values[$config.name] = localRecords;
					deferred.resolve(self.values[$config.name]);
				} else {
					console.log($config.name + ': use remote');
					self.remote($config.name, $config.url).then(function (remoteRecords) {
						console.log($config.name + ': got remote');
						self.values[$config.name] = remoteRecords;
						deferred.resolve(remoteRecords);
					});
				}
				obj[$config.variable] = self.values[$config.name];
			});
		} else {
			console.log($config.name + ': had values');
			deferred.resolve(self.values);
		}

		return deferred.promise;
	}

	self.get = function ($config, obj) {
		console.log(['$data.get:' + $config.name, $config]);
		var deferred = $q.defer();
		self.remote($config.name, $config.url).then(function (remoteRecords) {
			console.log($config.name + ': got remote');
			self.values[$config.name] = remoteRecords;
			obj[$config.variable] = self.values[$config.name];
			deferred.resolve(remoteRecords);
		});

		return deferred.promise;
	}

	self.local = function ($name) {
		console.log('$data.local(' + $name + ')');
		var deferred = $q.defer();
		var localRecords = $localStorage.getArray($name);
		deferred.resolve(localRecords);
		return deferred.promise;
	}

	self.remote = function ($name, $url) {
		console.log('$data.remote(' + $name + ')');

		var data = [];
		var deferred = $q.defer();

		var promise = $http.get(DOMAIN + $url)
			.success(function (result) {
				console.log('$data.remote(' + $name + ').success');

				switch (result.status) {
					case "SUCCESS":
						$localStorage.setArray($name, result.data);
						deferred.resolve(result.data);
						break;
					default:
						alert('Error on ' + $name + ': see log')
						break;
				}
			})
			.error(function (result) {
				console.log(['error', result]);
			});


		return deferred.promise;
	}
})

.filter('trusted', function ($sce) {
	return function (url) {
		return $sce.trustAsResourceUrl(url);
	};
})

.factory('$localStorage', function ($window) {
	return {
		set: function (key, value) {
			$window.localStorage[key] = value;
		},
		get: function (key, defaultValue) {
			return $window.localStorage[key] || defaultValue;
		},
		setObject: function (key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		getObject: function (key) {
			return JSON.parse($window.localStorage[key] || '{}');
		},
		setArray: function (key, value) {
			$window.localStorage[key] = JSON.stringify(value);
		},
		getArray: function (key) {
			return JSON.parse($window.localStorage[key] || '[]');
		}
	}
});
