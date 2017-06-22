angular.module("ShopModule")
    .filter('temperature', [function () {
        return function (input, scale) {
            var value = parseInt(input);
            var convertedValue = input;
            if (scale === 'F') {
                convertedValue = Math.round((9 / 5) * (convertedValue - 273.15) + 32) + '°F';
            } else if (scale === 'C') {
                convertedValue = Math.round(convertedValue - 273.15) + '°C';
            } else {
                //throw new Error('Not a valid scale');
            }
            return convertedValue;

        };
    }]);