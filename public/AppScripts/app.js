/***************************** Configurations *****************************/

var app = angular.module('ShopModule', ['ngRoute', 'ngMessages', 'LocalStorageModule', 'ngDialog']);

app.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-default',
        plain: true,
        closeByDocument: true,
        closeByEscape: true
    });
}]);

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./views/main.html"
        })
        .when("/login", {
            templateUrl: "./views/login.html"
        })
        .when("/register", {
            templateUrl: "./views/register.html"
        })
        .when("/cart", {
            templateUrl: "./views/cart.html"
        })
        .when("/forgotPassword", {
            templateUrl: "./views/forgotPassword.html"
        })
        .when("/products", {
            templateUrl: "./views/products.html"
        })
        .when("/about", {
            templateUrl: "./views/about.html"
        });

}]);

app.controller('mainController', ['$http', 'UserService', 'CartService',
    function ($http, UserService, CartService) {
        var vm = this;
        vm.topProducts = [];
        vm.newProducts = [];
        vm.productsUri = [];
        vm.cartService = CartService;
        vm.addToCart = vm.cartService.addToCart;
        vm.UserService = UserService;
        $http.get('/product/getTop5Products').then(function (res) {
            vm.topProducts = res.data;
        }),
            function (err) {
                $window.alert("Something went wrong with our Database. Please try again later.");
            }

        $http.get('/product/get5NewestProducts').then(function (res) {
            vm.newProducts = res.data;
        }),
            function (err) {
                $window.alert("Something went wrong with our Database. Please try again later.");
            }
    }]);

/***************************** Services *****************************/

app.factory('UserService', ['$http', 'CartService', 'localStorageService', '$location',
    function ($http, CartService, localStorageService, $location) {
        var service = {};
        service.user = {};
        service.isLoggedIn = false;
        service.lastLogin = {};
        service.recommendedProducts = [];

        service.getRecommendedProducts = function () {
            $http.get('/product/logged/getRecommendedProductsByUsers/' + service.user.userName).then(function (res1) {
                service.recommendedProducts = res1.data;
                if (service.recommendedProducts.length < 5);
                $http.get('/product/logged/getRecommendedProductsByCategories/' + service.user.userName).then(function (res2) {
                    var categoryRecommended = res2.data;
                    for (var i = 0; i < categoryRecommended.length && service.recommendedProducts.length < 5; i++) {
                        service.recommendedProducts.push(categoryRecommended[i]);
                    }

                }
                    , function (err1) {
                        window.alert("Something got wrong. Please refresh the page.");
                    });
            }
                , function (err2) {
                    window.alert("Something got wrong. Please refresh the page.");
                });
        }
        service.initUser = function () {
            if (localStorageService.cookie.isSupported) {
                var user = localStorageService.cookie.get('user');
                if (user) {
                    service.user.userName = user.userName;
                    service.lastLogin = user.lastLogin;
                    $http.defaults.headers.common = {
                        'my-Token': user.token,
                        'user': user.userName
                    };
                    service.isLoggedIn = true;
                    //update the cookie
                    var cookie = { userName: user.userName, lastLogin: new Date(), token: user.token }
                    localStorageService.cookie.set('user', cookie);
                    CartService.getUserCart(service.user.userName);
                    service.getRecommendedProducts();
                }
            }
        };
        service.initUser();
        service.login = function (user) {
            return $http.post('/user/login', user)
                .then(function (response) {
                    if (response.data == "fail")
                        return Promise.resolve(response);
                    var token = response.data.token;
                    service.user = response.data.user;
                    $http.defaults.headers.common = {
                        'my-Token': token,
                        'user': service.user.userName
                    };
                    //update the cookie
                    var cookie = { userName: user.userName, lastLogin: new Date(), token: token }
                    localStorageService.cookie.set('user', cookie);
                    service.initUser();
                    return Promise.resolve(response);
                })
                .catch(function (e) {
                    return Promise.reject(e);
                });
        };

        service.logout = function () {
            localStorageService.cookie.remove('user');
            service.isLoggedIn = false;
            CartService.initCart();
            service.recommendedProducts = [];
            service.user = {};
            service.lastLogin = {};
            $location.path("/");
        };

        return service;
    }]);

app.factory('DataService', ['$http', '$window', function ($http, $window) {
    var service = {};

    service.countries = [];
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var i;
            var xmlDoc = xmlhttp.responseXML;
            var temp = [];
            var x = xmlDoc.getElementsByTagName("Country");
            for (i = 0; i < x.length; i++) {
                service.countries.push(x[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue.toString());
            }
        }
    };
    xmlhttp.open("GET", "./Resources/countries.xml", true);
    xmlhttp.send();

    service.questions = [];
    service.categories = [];
    $http.get('/user/getRestoreQuestions').then(function (res) {
        service.questions = res.data;
        $http.get('/product/getCategories').then(function (res) {
            service.categories = res.data;
        },
            function (err) {
                $window.alert('Something went wrong...Please try again.');
            });

    },
        function (err) {
            $window.alert('Something went wrong...Please try again.');
        });

    return service;
}]);







