
waachakApp.controller("loginController", function ($scope, $http, $route, $routeParams, $location, waachakFactory) {
    
    $scope.signup = '';
    $scope.user = waachakFactory.user();

    $scope.signInKeyDown = function (e, u) {

        if (e.which == 13)
          $scope.signInWaachakUser(u);        
    }

    $("#nonGUserID").focus();

    var fbCode = getParameterByName("code");
    var googleauthToken = $scope.user.googleauthToken;

    var userIDCookie = readCookie("userIDcookie");
    var authTokencookie = readCookie("authTokencookie");
    var UserNamecookie = readCookie("UserNamecookie");
    var userImageUrlcookie = readCookie("userImageUrlcookie");
  
    $scope.checkingUser = '';

    $scope.signInAsExplorer = function () {

        user = new Object();
        user.userName = "Welcome Explorer!";
        user.userID = "Explorer";
        user.userImageUrl = "images/reader.jpg";
        user.authToken = '';

        waachakFactory.setUser(user);
        $location.path('/waachak');
    }


    $scope.allowNewUserEntry = function (user) {
        waachakFactory.setUser(user);
        $location.path('/waachak');
    }

    $scope.addWaachakUser = function (newUser) {
        if (newUser.userPasswordRepeat != newUser.userPassword) {
            alert("Entered passwords don't match")
        }
        else {
            waachakFactory.addWaachakUser($scope, newUser);
        }
    }

    $scope.resetWaachakUserPassword = function (resetUser) {
        if (resetUser.userPasswordRepeat != resetUser.userPassword) {
            alert("Entered passwords don't match")
        }
        else {
            waachakFactory.resetWaachakUser($scope, resetUser);
        }
    }

    $scope.newUserSignUp = function () {
        $scope.signup = "New User!";
        
    }

    $scope.sendResetPasswordEmail = function (resetemail) {
        if (!resetemail) {
            $scope.user.resetPasswordInfo = "Please enter a valid email address";
        }
        else {
            waachakFactory.sendResetEmail($scope, resetemail);
        }
    }
    
    $scope.signInWaachakUser = function (nonGoogleUser) {

        if (!nonGoogleUser || !nonGoogleUser.userID || (!nonGoogleUser.userPassword && !nonGoogleUser.authToken)) {
            alert("Please enter User Name and Password");
            return;
        }

        var user = new Object();
        user.userID = nonGoogleUser.userID;
        user.password = nonGoogleUser.userPassword;
        user.authToken = nonGoogleUser.authToken;
        $http({
            url: 'api/AuthenticateWaachakUser/',
            method: "POST",
            data: user,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        }).
            success(function (data, status) {
                
                user.isAuthenticated = data.authToken;
                user.userName = data.User_Name;
                user.userID = data.UserID;
                user.authToken = data.authToken;
                user.userImageUrl = data.userImageUrl;
                $scope.feedData = '';
                if (data.authToken) {
                    waachakFactory.setUser(user);
                    document.cookie = "userIDcookie=" + nonGoogleUser.userID;
                    document.cookie = "authTokencookie=" + data.authToken;
                    document.cookie = "UserNamecookie=" + data.User_Name;
                    document.cookie = "userImageUrlcookie=" + data.userImageUrl;

                    $location.path('/waachak');
                }
                else if (data.UserID && !data.authToken)
                    alert("Incorrect login or session expiration. Could not validate the user, please re-enter the user name and password.");
            }).
            error(function (data, status) {
                
                alert("Error validating waachak user.");
            });

        return $scope.user.userName;
    }

    $scope.signInFacebookUser = function (fbCode) {
        
        $http({
            url: 'api/AuthenticateFacebookUser/',
            method: "POST",
            data: "=" + fbCode,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data, status) {

            var user = new Object();
            user.isAuthenticated = data.authToken;
            user.userName = data.User_Name;
            user.userID = data.UserID;
            user.authToken = data.authToken;
            user.userImageUrl = data.userImageUrl;
            $scope.feedData = '';
            if (data.authToken) {
                waachakFactory.setUser(user);
                $location.path('/waachak');
            }
        }).
            error(function (data, status) {
                alert("Error validating with Facebook sign in.");
            });

        return $scope.user.userName;
    };

    $scope.signInWithGoogleClicked = function () {

     
        var gu = "https://accounts.google.com/o/oauth2/auth?response_type=token&client_id=&redirect_uri=http://localhost:51041/Index.html&scope=https://www.googleapis.com/auth/plus.login";

        window.location = gu;

    }

    $scope.signinAsGoogleUser = function (authToken) {
        
        $http({
            url: 'api/Authenticate/',
            method: "POST",
            data: "=" + authToken,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data, status) {

            var user = new Object();
            user.isAuthenticated = data.authToken;
            user.userName = data.User_Name;
            user.userID = data.UserID;
            user.authToken = data.authToken;
            user.userImageUrl = data.userImageUrl;
            waachakFactory.setUser(user);
            $scope.feedData = '';

            if (data.authToken) {
                waachakFactory.setUser(user);
                $location.path('/waachak');
            }
        }).
            error(function (data, status) {
                alert("Error validating with Google sign in.");
            });

        return $scope.user.userName;
    };

    if (googleauthToken) {
        $scope.checkingUser = 'validating';
        $scope.signinAsGoogleUser(googleauthToken);
    }
    else if (fbCode && !userIDCookie && !authTokencookie) {
        $scope.checkingUser = 'validating';
        $scope.signInFacebookUser(fbCode);

    }
    else if (userIDCookie && authTokencookie) {
        $scope.checkingUser = 'validating';
        u = new Object
        u.userID = userIDCookie;
        u.authToken = authTokencookie;
        u.userName = UserNamecookie;
        u.userImageUrl = userImageUrlcookie;
        $scope.signInWaachakUser(u);
    }
});