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


app.factory('UserService', ['$http', 'CartService', 'localStorageService', '$location',
    function ($http, CartService, localStorageService, $location) {
        var service = {};
        service.user = {};
        service.isLoggedIn = false;
        service.lastLogin = {};
        service.recommendedProducts = [];

        service.getRecommendedProducts = function () {
            $http.get('/product/getRecommendedProductsByUsers/' + service.user.userName).then(function (res1) {
                service.recommendedProducts = res1.data;
                if (service.recommendedProducts.length < 5);
                $http.get('/product/getRecommendedProductsByCategories/' + service.user.userName).then(function (res2) {
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
            service.getRecommendedProducts();

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
            localStorageService.cookie.remove('user');
            service.isLoggedIn = false;
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

app.controller('cartController', ["$http", "$window", "CartService", "ngDialog",
    function ($http, $window, CartService, ngDialog) {
        var self = this;
        self.cartService = CartService;
        self.htmlDialog = '<div class="DialogDiv"><img ng-src="Resources/productsImg/{{ngDialogData.productName}}.jpg" class="DialogImg"/> '
            + '<div class="DialogInfo"> <label class="DialogHeader">Model:</label> <label class="DialoglText">{{ngDialogData.productName}}</label>  <br/>  '
            + ' <label class="DialogHeader">Brand:</label> <label class="DialogText">{{ngDialogData.brand}}</label>  <br/>  '
            + ' <label class="DialogHeader">Color: </label> <label class="DialogText">{{ngDialogData.color}}</label> <br/>'
            + ' <label class="DialogHeader">Price: </label> <label class="DialogText"> {{ngDialogData.price}} NIS </label>  <br/>'
            + ' <label class="DialogHeader">Current Stock: </label> <label class="DialogText"> {{ngDialogData.quantity}} </label>  <br/></div></div>'
        self.moreDetails = function (product) {
            ngDialog.open({
                template: self.htmlDialog,
                className: 'ngdialog-theme-default',
                data: product,
                showClose: true,
                width: 480
            });
        };
    }]);

app.factory('CartService', ['$http', '$window', function ($http, $window) {
    var service = {};
    service.quantity = [];
    service.cart = [];
    service.userName = "";

    service.initCart = function () {
        service.cart = [];
        service.userName = "";
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
                service.quantity = [];
                for (var i = 0; i < service.cart.length; i++) {
                    service.quantity[i] = service.cart[i].buyQuantity;
                }
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
            service.quantity = [];
            for (var i = 0; i < service.cart.length; i++) {
                service.quantity[i] = service.cart[i].buyQuantity;
            }
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
        if (service.quantity[index] == "") {
            service.quantity[index] = product.buyQuantity;
            return;
        }
        if (service.quantity[index] == product.buyQuantity) {
            return;
        }
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
    }
    return service;
}]);


//Products.html
app.controller('productController', ['$http', 'ProductService', function ($http, ProductService) {
    var self = this;
    self.sortBy = 'price';
    self.isReversed = false;
    self.searchFilter = "";
    self.sortOptions =
        [
            { label: "price" }, { label: "brand" }
        ]
    self.productService = ProductService;
    self.productService.checkedCategories = [];


}]);

app.factory('ProductService', ['$http', 'CartService', 'UserService',
    function ($http, CartService, UserService) {
        var service = this;
        service.products = [];
        service.userService = UserService;
        service.cartService = CartService;
        var productsCategories = [];
        service.checkedCategories = [];
        var allCategories = [];
        service.allCategories = [];
        service.isCheckedCategories = {};

        service.addToCart = function (product) {
            cartService.addToCart(product);
        }

        $http.get('/product/getAllProducts').then(function (res1) {
            service.products = res1.data;
            $http.get('/product/getProductsCategories').then(function (res2) {
                productsCategories = res2.data;
                var j = 0;
                for (var i = 0; i < service.products.length; i++) {
                    service.products[i].categories = [];
                    while (j < productsCategories.length && productsCategories[j].productID == service.products[i].productID) {
                        service.products[i].categories.push(productsCategories[j].categoryID);
                        j++;
                    }
                }

            }
                , function (err1) {
                    window.alert("Something got wrong. Please refresh the page.");
                });
        }
            , function (err2) {
                window.alert("Something got wrong. Please refresh the page.");
            })


        $http.get('/product/getCategories').then(function (res) {
            allCategories = res.data;
            for (var i = 0; i < allCategories.length; i++) {
                service.allCategories[allCategories[i].categoryName] = allCategories[i].categoryID;
            }

            for (var i = 0; i < allCategories.length; i++) {
                service.isCheckedCategories[allCategories[i].categoryName] = false;

            }
        }
            , function (err) {
                window.alert("Something got wrong. Please refresh the page.");
            });

        service.updateCategories = function (categoryName) {
            if (service.isCheckedCategories[categoryName] == false) {
                service.removeCategory(categoryName);
            }
            else {
                service.addCategory(categoryName);
            }
        }

        service.addCategory = function (categoryName) {
            service.checkedCategories.push(service.allCategories[categoryName]);
        }

        service.removeCategory = function (categoryName) {
            var index = service.checkedCategories.indexOf(service.allCategories[categoryName]);
            service.checkedCategories.splice(index, 1);
        }

        return service;
    }]);

app.filter('productFilter', function () {
    return function (products, filterCriterias) {
        if (filterCriterias.length == 0)
            return products;
        var output = [];
        var flag = false;
        var containsCriteria = false;
        for (var i = 0; i < products.length; i++) {
            var currentProduct = products[i];
            flag = false;
            for (var l = 0; l < filterCriterias.length && !flag; l++) {
                containsCriteria = false;
                for (var j = 0; j < currentProduct.categories.length && !containsCriteria; j++) {
                    if (currentProduct.categories[j] == filterCriterias[l]) {
                        containsCriteria = true;
                    }
                }
                if (containsCriteria == false) {
                    break;
                }
                else if (l == filterCriterias.length - 1)
                { output.push(currentProduct); }
            }
        }
        return output;
    }
});