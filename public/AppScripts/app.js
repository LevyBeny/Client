
var app = angular.module('ShopModule', ['ngRoute', 'ngMessages']);

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
        });
}]);


app.factory('DataService', ['$http', '$window', function ($http, $window) {
    var service = {};
    service.countries = [];
    service.questions = [];
    service.categories = [];
    $http.get('/getRestoreQuestions').then(function (res) {
        service.questions = res.data;
        $http.get('/getCategories').then(function (res) {
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


app.controller('mainController', ['$http', 'UserService',
    function ($http, UserService) {
        var vm = this;
        vm.UserService = UserService;
    }]);

app.controller('loginController', ['UserService', "$window", "$location",
    function (UserService, $window, $location) {
        var self = this;
        var userStatus = {};
        self.user = {};
        self.user.password = "";
        self.user.userName = "";
        self.errorMessage = "";
        userStatus.isLoggedIn = false;
        self.login = function () {
            UserService.login(self.user).then(function (res) {
                if (res.data == "fail") {
                    self.errorMessage = "Invalid user name or password.";
                    return;
                }
                self.errorMessage = "";
                window.alert('You are logged in! Enjoy you shopping.');
                $location.path("/");
            }, function (error) {
                $window.alert('Something went wrong...Please try again.');
            });
        };
    }]);

app.controller('registerController', ['DataService', "$window", "$location", "$http",
    function (DataService, $window, $location, $http) {
        var self = this;
        self.data=DataService;

        // user's details
        self.user = {};
        self.user.userName = "";
        self.user.password = "";
        self.user.firstName = "";
        self.user.lastName = "";
        self.user.birthDate = "";
        self.user._address = "";
        self.user.city = "";
        self.user.country = "";
        self.user.phone = "";
        self.user.mail = "";
        self.user.country = "";
        self.user.isAdmin = 0;

        // user's restore Q&A
        self.userQuestions = {};
        self.userQuestions.q1_id = "Please select a question";
        self.userQuestions.ans1 = "";
        self.userQuestions.q2_id = "Please select a question";
        self.userQuestions.ans2 = "";

        // user's categories
        self.userCategories = {};
        self.userCategories.cat1 = "";
        self.userCategories.cat2 = "";
        self.userCategories.cat3 = "";

        // data
        // self.data.categories = DataService.categories;
        // self.questions = DataService.questions;
        // self.countries = DataService.countries;

        //  errors
        self.errors = {};
        self.errors.userName = "";
        self.errors.password = "";
        self.errors.firstName = "";
        self.errors.lastName = "";
        self.errors.birthDate = "";
        self.errors._address = "";
        self.errors.city = "";
        self.errors.phone = "";
        self.errors.mail = "";

        self.register = function () {
            tosend = {};
            tosend.content = [];
            tosend.content[0] = self.user;
            tosend.content[1] = self.userQuestions;
            tosend.content[2] = self.userCategories;
            $http.post('/register', tosend)
                .then(function (response) {
                    if (response.data === "success") {
                        $window.alert('Registration Completed Successfully.');
                        $location.path("/login");
                    }
                    else {
                        $window.alert('Something went wrong...Please try again.');
                    }
                })
                .catch(function (e) {
                    $window.alert('Something went wrong...Please try again.');
                });
        };
    }]);

app.controller('forgotController', ["$http", "$window", "$location",
    function ($http, $window, $location) {
        var self = this;
        self.userName = "";
        self.errorMessage = "";
        self.isUserExist = false;
        self.questions = {};
        self.questions.q1 = "";
        self.questions.q2 = "";
        self.answers = {};
        self.answers.a1 = "";
        self.answers.a2 = "";
        self.getQuestions = function () {
            $http.get('getRestorePasswordQuestions/' + self.userName).then(function (res) {
                if (res.data == "fail") {
                    self.isUserExist = false;
                    self.errorMessage = "Invalid User Name!";
                    return;
                }
                self.isUserExist = true;
                self.errorMessage = "";
                self.questions.q1 = res.data[0].question;
                self.questions.q2 = res.data[1].question;
            },
                function (err) {
                    self.isUserExist = false;
                    $window.alert('Something went wrong...Please try again.');
                });
        };

        self.restorePassword = function () {
            toSend = {};
            toSend.userName = self.userName;
            toSend.ans1 = self.answers.a1;
            toSend.ans2 = self.answers.a2;
            $http.post('restorePassword/', toSend).then(function (res) {
                if (res.data == "fail") {
                    self.isUserExist = true;
                    self.errorMessage = "At least One Answer Is Invalid!";
                    return;
                }
                $window.alert("Your Password Is: " + res.data[0].password);
                $location.path("/login");
            },
                function (err) {
                    self.isUserExist = true;
                    $window.alert('Something went wrong...Please try again.');
                });
        };
    }]);

app.factory('UserService', ['$http',
    function ($http) {
        var service = {};
        service.user = {};
        service.isLoggedIn = false;
        service.login = function (user) {
            return $http.post('/login', user)
                .then(function (response) {
                    if (response.data == "fail")
                        return Promise.resolve(response);
                    var token = response.data.token;
                    $http.defaults.headers.common = {
                        'my-Token': token,
                        'user': user.username
                    };
                    service.isLoggedIn = true;
                    service.user = response.user;
                    return Promise.resolve(response);
                })
                .catch(function (e) {
                    return Promise.reject(e);
                });
        };
        return service;
    }]);

app.directive('alphaNumeric', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            var validator = function (value) {
                if (/^[a-zA-Z0-9]*$/.test(value)) {
                    ngModel.$setValidity('alphaNumeric', true);
                    return value;
                } else {
                    ngModel.$setValidity('alphaNumeric', false);
                    return undefined;
                }
            };
            ngModel.$parsers.unshift(validator);
            ngModel.$formatters.unshift(validator);
        }
    };
});

app.directive('numeric', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            var validator = function (value) {
                if (/^[0-9]*$/.test(value)) {
                    ngModel.$setValidity('numeric', true);
                    return value;
                } else {
                    ngModel.$setValidity('numeric', false);
                    return undefined;
                }
            };
            ngModel.$parsers.unshift(validator);
            ngModel.$formatters.unshift(validator);
        }
    };
});

app.directive('lettersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            var validator = function (value) {
                if (/^[a-zA-Z]*$/.test(value)) {
                    ngModel.$setValidity('lettersOnly', true);
                    return value;
                } else {
                    ngModel.$setValidity('lettersOnly', false);
                    return undefined;
                }
            };
            ngModel.$parsers.unshift(validator);
            ngModel.$formatters.unshift(validator);
        }
    };
});