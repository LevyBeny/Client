(function () {
    'use strict';

    var app = angular.module('ShopModule', []);
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




    var register_textBoxes = [
        {
            name: 'First Name',
        },
        {
            name: 'Last Name',
        },
        {
            name: 'Madrid',
            country: 'Spain',
            population: '3,141,992',
            description: 'Madrid , is a south-western European city, the capital of Spain, and the largest municipality of the Community of Madrid. The population of the city is almost 3.2 million with ametropolitan area population of around 6.5 million. It is the third-largest city in the European Union, after Londonand Berlin, and its metropolitan area is the third-largest in the European Union after London and Paris. The city spans a total of 604.3 km2 (233.3 sq mi).',
            images: [
              "images/madrid.jpg",
            ],
            reviews: [{
                stars: 5,
                body: "I think i'll visit there again",
                author: "hasidi@post.bgu.ac.il",
                createdOn: "13.6.15"

            }, {
                stars: 3,
                body: "bla bla",
                author: "bla@bla.com",
                createdOn: "13.6.15"
            }]
        }

    ];

})();