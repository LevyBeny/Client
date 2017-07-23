(function () {
    'use strict';

    var app = angular.module('ShopModule', ['ngRoute']);


    app.config(['$locationProvider', function($locationProvider){
        $locationProvider.hashPrefix('');
    }]);

    app.config(['$routeProvider',function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl : "main.html",
                controller : "mainController"
            })
            .when("/login", {
                templateUrl : "login.html",
                controller: "loginController"
            })
            .when("/register", {
                templateUrl : "register.html"
            })
            .when("/cart", {
                templateUrl : "cart.html"
            });
    }]);
    //insert your key in APPID after registration
    app.controller('mainController', ['$http', 'temperatureFilter', function ($http, temperatureFilter) {
        var vm = this;
        vm.cities = [];
        vm.cities = cities;
        vm.weatherBtnPushed = false;
        vm.selectedCity = cities[0];
        vm.tempUnit = "C";

        //weather func
        vm.getRequest = function () {
            var requestUrl = 'requsetURL';
            $http.get(requestUrl).then(function (response) {
                var returnData = response.data;
                var temprature = returnData.main.temp;
                vm.cityTempOrg = temprature;
                vm.weatherBtnPushed = true;
            }, function (errResponse) {
                console.error('Error while fetching notes');
            });
        };

        vm.clearWeather = function () {
            vm.weatherBtnPushed = false;
            vm.tempUnit = 'C';
        }

    }]);

    app.controller('tabsController', function () {
        this.tab = 1;

        this.setTab = function (newValue) {
            this.tab = newValue;
        };

        this.isSet = function (tabName) {
            return this.tab === tabName;
        };
    });

    app.controller('loginController', ['$http', function($http) {
    var userStatus = {};
    userStatus.isLoggedIn = false;
    userStatus.login = function(user) {
        return $http.post('/login', user)
            .then(function(res) {
                var token = res.data.token;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.UserName
                };
                userStatus.isLoggedIn = true;
                return Promise.resolve(res);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    };
    return userStatus;
    }]);

})();