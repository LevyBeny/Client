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

        $http.post('/user/logged/updateCart', updatedCart).then(function (result) {
            if (result.data === "success") {
                service.quantity = [];
                for (var i = 0; i < service.cart.length; i++) {
                    service.quantity[i] = service.cart[i].buyQuantity;
                }
                window.alert("Cart was updated!");
            }
        }).catch(function (err) {
            window.alert("Something went wrong... please try again!")
        });
    }

    service.getUserCart = function (userName) {
        service.userName = userName;

        $http.get('/user/logged/getUserCart/' + userName).then(function (userCartResult) {
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
            service.cart[service.cart.length]=tmpProduct;
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
                service.cart[service.length]=tmpProduct;
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
        service.updateCart();
    }
    return service;
}]);