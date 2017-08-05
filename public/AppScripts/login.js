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