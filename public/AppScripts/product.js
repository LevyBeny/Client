
//Products.html
app.controller('productController', ['$http', 'ProductService', function ($http, ProductService) {
    var self = this;
    self.sortBy = { label: 'price' };
    self.isReversed = { value: false };
    self.searchFilter = "";
    self.sortOptions =
        [
            { label: "price" }, { label: "brand" }
        ]
    self.sortFunctions =
        [
            { label: "Low To High", value: false }, { label: "High To Low", value: true }
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