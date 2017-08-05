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