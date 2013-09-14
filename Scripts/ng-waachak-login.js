
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
  
    $scope.signInAsExplorer = function () {

        user = new Object();
        user.userName = "Welcome Explorer!";
        user.userID = "Explorer";
        user.userImageUrl = "images/reader.jpg";
        user.authToken = '';

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

        var gu = "https://accounts.google.com/o/oauth2/auth?response_type=token&client_id=YOUR ID HERE&redirect_uri=http://localhost:51041/Index.html&scope=https://www.googleapis.com/auth/plus.login";

        window.location = gu; //"https://accounts.google.com/ServiceLogin?service=lso&passive=1209600&continue=https://accounts.google.com/o/oauth2/auth?scope%3Dhttps://www.googleapis.com/auth/plus.login%26response_type%3Dcode%2Btoken%2Bid_token%2Bgsession%26redirect_uri%3Dhttp://localhost:51041/Index.html%26cookie_policy%3Dsingle_host_origin%26proxy%3Doauth2relay237631003%26client_id%YOUR ID HERE%26authuser%3D0%26request_visible_actions%3Dhttp://schemas.google.com/AddActivity%26hl%3Den-US%26from_login%3D1%26as%3D-74ddc8097624a835&ltmpl=popup&shdf=CqgCCxIRdGhpcmRQYXJ0eUxvZ29VcmwauQEvL2ltYWdlcy1sc28tb3BlbnNvY2lhbC5nb29nbGV1c2VyY29udGVudC5jb20vZ2FkZ2V0cy9wcm94eT91cmw9aHR0cDovL3dhYWNoYWsuYXBwaGIuY29tL2ltYWdlcy9pY29uLmpwZyZjb250YWluZXI9bHNvJmdhZGdldD1hJnJld3JpdGVNaW1lPWltYWdlLyomcmVzaXplX2g9MTIwJnJlc2l6ZV93PTEyMCZub19leHBhbmQ9MQwLEhV0aGlyZFBhcnR5RGlzcGxheU5hbWUaB1dhYWNoYWsMCxIGZG9tYWluGgdXYWFjaGFrDAsSFXRoaXJkUGFydHlEaXNwbGF5VHlwZRoHREVGQVVMVAwSA2xzbyIUMG1g0rezOqIv8Fp9ObKc7cYNaUooATIUh2G152njSZdPhLQMEyIIBQoIvnk&sarp=1&scc=1";

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
        $scope.signinAsGoogleUser(googleauthToken);
    }
    else if (fbCode && !userIDCookie && !authTokencookie) {
        $scope.signInFacebookUser(fbCode);

    }
    else if (userIDCookie && authTokencookie) {
        u = new Object
        u.userID = userIDCookie;
        u.authToken = authTokencookie;
        u.userName = UserNamecookie;
        u.userImageUrl = userImageUrlcookie;
        $scope.signInWaachakUser(u);
    }
});


//function signinCallback(authResult) {

//    if (authResult['access_token']) {
//        // Successfully authorized
//        // Hide the sign-in button now that the user is authorized, for example:
//        //angular.element(document.getElementById('divSubscriptions')).scope().loading = 'loading';

//        angular.element(document.getElementById('customBtn')).scope().signinAsGoogleUser(authResult['access_token']);
//        //refresh(authResult['access_token']);

//    } else if (authResult['error']) {
//        // There was an error.
//        // Possible error codes:
//        //   "access_denied" - User denied access to your app
//        //   "immediate_failed" - Could not automatically log in the user
//        //console.log('There was an error: ' + authResult['error']);
//    }
//}