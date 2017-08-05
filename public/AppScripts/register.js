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

