var app = angular.module('ShopModule', ['ngRoute', 'ngMessages', 'LocalStorageModule']);




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
        self.data = DataService;

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
        self.question1 = "";
        self.ans1 = "";
        self.question2 = "";
        self.ans2 = "";

        // user's categories
        self.cat1 = "";
        self.cat2 = "";
        self.cat3 = "";

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

            var userQuestions = {};
            userQuestions.q1 = self.question1.questionID;
            userQuestions.ans1 = self.ans1;
            userQuestions.q2 = self.question2.questionID;
            userQuestions.ans2 = self.ans2;
            tosend.content[1] = userQuestions;

            var categories = {};
            categories.cat1 = self.cat1.categoryID;
            categories.cat2 = self.cat2.categoryID;
            categories.cat3 = self.cat3.categoryID;
            tosend.content[2] = categories;

            $http.post('/user/register', tosend)
                .then(function (response) {
                    if (response.data === "success") {
                        $window.alert('Registration Completed Successfully.');
                        $location.path("/login");
                    }
                    else if (response.data === "exists") {
                        $window.alert('The user name you entered already exist! \n Please enter another.');
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

app.filter('noQuestionRepeat', function () {
    return function (questions, q2ID) {
        var questionToReturn = [];
        for (question in questions) {
            if (!(question.id === q2ID))
                questionToReturn.push(question)
        }
        return questionToReturn;
    }
})

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
            $http.get('/user/getRestorePasswordQuestions/' + self.userName).then(function (res) {
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
            $http.post('/user/restorePassword/', toSend).then(function (res) {
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

/***************************** Services *****************************/


app.factory('UserService', ['$http', 'CartService', 'localStorageService','$location',
    function ($http, CartService, localStorageService,$location) {
        var service = {};
        service.user = {};
        service.isLoggedIn = false;
        service.lastLogin = {};
        service.initUser = function () {
            if (localStorageService.cookie.isSupported) {
                var user = localStorageService.cookie.get('user');
                if (user) {
                    service.user.userName = user.userName;
                    service.lastLogin = user.lastLogin;

                    $http.defaults.headers.common = {
                        'my-Token': user.token,
                        'userName': user.userName
                    };
                    service.isLoggedIn = true;
                    //update the cookie
                    var cookie = { userName: user.userName, lastLogin: new Date(), token: user.token }
                    localStorageService.cookie.set('user', cookie);
                    CartService.getUserCart(service.user.userName);
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
                    //update the cookie
                    var cookie = { userName: user.userName, lastLogin: new Date(), token: user.token }
                    localStorageService.cookie.set('user', cookie);
                    service.initUser();
                    return Promise.resolve(response);
                })
                .catch(function (e) {
                    return Promise.reject(e);
                });
        };

        service.logout = function () {
<<<<<<< HEAD
            localStorageService.cookie.remove('user');
            service.isLoggedIn=false;
=======
            localStorageService.cookie.delete('user');
            isLoggedIn = false;
>>>>>>> 5734f7e06221ed29d4fb010db00a5d4640c814f7
            CartService.initCart();
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

/***************************** Filters *****************************/

app.filter('diffQuestion', function () {
    return function (input, q) {
        if (q == "") {
            return input;
        }
        var result = [];
        for (var i = 0; i < input.length; i++) {
            if (input[i].questionID != q.questionID) {
                result.push(input[i]);
            }
        }
        return result;
    };
});

app.filter('diffCategory', function () {
    return function (input, categories) {
        if (categories[0] == '' && categories[1] == '') {
            return input;
        }
        var result = [];
        for (var i = 0; i < input.length; i++) {
            if (input[i].categoryID != categories[0].categoryID && input[i].categoryID != categories[1].categoryID) {
                result.push(input[i]);
            }
        }
        return result;
    };
});

/***************************** Directives *****************************/

app.directive('alphaNumeric', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            var validator = function (value) {
                if (/^[a-zA-Z0-9\s]*$/.test(value)) {
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

app.directive('password', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            var validator = function (value) {
                if (/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/.test(value)) {
                    ngModel.$setValidity('password', true);
                    return value;
                } else {
                    ngModel.$setValidity('password', false);
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

app.directive('letterspaceOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            var validator = function (value) {
                if (/^[a-zA-Z\s]*$/.test(value)) {
                    ngModel.$setValidity('letterspaceOnly', true);
                    return value;
                } else {
                    ngModel.$setValidity('letterspaceOnly', false);
                    return undefined;
                }
            };
            ngModel.$parsers.unshift(validator);
            ngModel.$formatters.unshift(validator);
        }
    };
});

app.controller('cartController', ["$http", "$window", "CartService",
    function ($http, $window, CartService) {
        var self = this;
        self.cartService = CartService;
    }]);

app.factory('CartService', ['$http', '$window', function ($http, $window) {
    var service = {};
    service.quantity = [];
    service.cart = [];
    service.userName = "";

    service.initCart = function () {
        service.cart = [];
    }

    service.removeFromCart = function (index) {
        service.cart.splice(index, 1);
        service.updateCart();
    }

    service.calculateTotalSum = function () {
        service.cart.totalSum = 0;
        for (var i = 0; i < service.cart.length; i++) {
            service.cart.totalSum += service.cart[i].totalPrice;
        }
    }

    service.updateCart = function () {
        service.calculateTotalSum();
        var updatedCart = {};
        updatedCart.content = [];
        updatedCart.content[0] = {}
        updatedCart.content[1] = [];
        updatedCart.content[0].userName = service.userName;

        for (var i = 0; i < service.cart.length; i++) {
            var tmpProduct = service.cart[i];
            updatedCart.content[1][i] = {};
            updatedCart.content[1][i].productID = tmpProduct.productID;
            updatedCart.content[1][i].quantity = tmpProduct.buyQuantity;
        }

        $http.post('/user/updateCart', updatedCart).then(function (result) {
            if (result.data === "success") {
               window.alert("Cart was udpdated!");
            }
        }).catch(function (err) {
            window.alert("Something went wrong... please try again!")
        });
    }

    service.getUserCart = function (userName) {
        service.userName = userName;

        $http.get('/user/getUserCart/' + userName).then(function (userCartResult) {
            service.cart = userCartResult.data;
            service.calculateTotalPrices();
            service.calculateTotalSum();
        },
            function (error) {
                window.alert("Something went wrong with your cart, please try again.");
            });
    }

    service.getProductIndex = function (product) {

        for (var i = 0; i < service.cart.length; i++) {
            var tmpProduct = service.cart[i];
            if (tmpProduct.productID == product.productID)
                return i;
        }
        return -1;
    }

    service.setProductQuantity = function (product) {
        var index = service.getProductIndex(product);
        var tmpProduct = {};
        if (product.quantity == 0) {
            window.alert("Product currently out of stock!")
            return;
        }
        if (service.quantity[index] > product.quantity) {
            window.alert("Not enough units of this product in stock.\n Contact our customer service for making special reservation.");
            return;
        }

        if (index == -1) {
            tmpProduct = product;
            tmpProduct.buyQuantity = quantity[index];
            tmpProduct.totalPrice = tmpProduct.buyQuantity * tmpProduct.price;
            service.cart.push(tmpProduct);
        }
        else {
            service.cart[index].buyQuantity = service.quantity[index];
            service.cart[index].totalPrice = service.cart[index].buyQuantity * service.cart[index].price;
        }


        service.updateCart();
        
    }

    service.calculateTotalPrices = function () {
        for (var index = 0; index < service.cart.length; index++) {
            service.cart[index].totalPrice = service.cart[index].price * service.cart[index].buyQuantity;
        }

    }

    service.addToCart = function (product) {
        var index = service.getProductIndex(product);
        var tmpProduct = {};
        if (index == -1) {
            tmpProduct = product;
            if (product.quantity == 0) {
                window.alert("Product currently out of stock!")
            }
            else {
                tmpProduct.buyQuantity = 1;
                tmpProduct.totalPrice = tmpProduct.buyQuantity * tmpProduct.price;
                service.cart.push(tmpProduct);
            }
        }
        else {
            if (service.cart[index].buyQuantity + 1 > product.quantity) {
                window.alert("No more units of this product in stock.\n Contact our customer service for making special reservation.")
            }
            else {
                service.cart[index].buyQuantity++;

                service.cart[index].totalPrice = service.cart[index].price * service.cart[index].buyQuantity;
            }
        }
        var prom = service.updateCart();
        window.alert("Added to cart succesfully!");
    }
    return service;
}]);


//Products.html
app.controller('productController', ['$http', 'ProductService', function ($http, ProductService) {
    var self = this;
    self.productService = ProductService;
}]);

app.factory('ProductService', ['$http', 'CartService', 'UserService',
    function ($http, CartService,UserService) {
        var service = this;
        service.products = [];
        service.userService=UserService;
        service.cartService = CartService;
        service.addToCart = function (product) {
            cartService.addToCart(product);
        }
        $http.get('/product/getAllProducts').then(function (res) {
            service.products = res.data;
        }
            , function (err) {
                window.alert("Something got wrong. Please refresh the page.");
            })
        return service;
    }]);