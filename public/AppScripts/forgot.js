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