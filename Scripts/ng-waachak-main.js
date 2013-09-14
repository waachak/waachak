var waachakApp = angular.module("waachakApp", []).
    config(function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(false);

        $routeProvider.
            when('/login', { templateUrl: 'Login.html', controller: 'loginController' }).
            when('/home', { templateUrl: '', controller: 'mainController' }).
            when('/manage', { templateUrl: 'MaintainSubscritions.html', controller: 'subscriptionController' }).
            when('/about', { templateUrl: 'About.html', controller: 'subscriptionController' }).
            when('/404', { templateUrl: 'PageNotFound.html', controller: 'subscriptionController' }).
            when('/waachak', { templateUrl: 'Waachak.html', controller: 'subscriptionController' }).
            otherwise({ redirectTo: '/404' });
    });

waachakApp.factory('waachakFactory', function ($http) {
    var user = { userName: '', userID: '', userImageUrl: '', isAuthenticated: '', authToken: '', resetPassword: '', resetPasswordEmail: '', resetPasswordInfo: '', googleauthToken: '' };

    var showFilter = '';
    var newSubscription = { name: '', url: '', userID: '' };
    var gotOnce = 0;
    var showFeedDiscoveryDialog = '';

    return {

        showFilter: function () { return showFilter; },
        showFeedDiscoveryDialog: function () { return showFeedDiscoveryDialog; },
        setShowFeedDiscoveryDialog: function (s) { showFeedDiscoveryDialog = s; },
        newSubscription: function () { return newSubscription; },
        setNewSubscription: function (n) {
            newSubscription = n;
        },
        user: function () { return user; },
        setUser: function (newUser) {
            user.userName = newUser.userName;
            user.userID = newUser.userID;
            user.userImageUrl = newUser.userImageUrl;
            user.isAuthenticated = newUser.isAuthenticated;
            user.authToken = newUser.authToken;
            user.googleauthToken = newUser.googleauthToken;
        },
        setUserResetInfo: function (newUser) {
            resetPassword = newUser.resetPassword;
            resetPasswordEmail = newUser.resetPasswordEmail;
            resetPasswordInfo = newUser.resetPasswordInfo;
        },


        resetWaachakUser: function ($scope, resetUser) {
            $scope.loading = 'loading';

            u = new Object();
            u.password = resetUser.userPassword;
            u.repeatPassword = resetUser.userPasswordRepeat;
            u.origPassword = $scope.resetPassword;
            u.userEmail = $scope.resetPasswordEmail;

            $http({
                url: 'api/ResetPassword',
                method: "POST",
                headers: { 'Content-Type': 'application/json;charset=UTF8' },
                data: u
            }).success(function (data, status) {

                if (data == "SCS") {
                    // show redirection link
                    $scope.authToken = data;
                }
                else
                    alert("Failed to update password.");

                $scope.loading = '';
            }).error(function (data, status) {
                $scope.loading = '';
            });
        },

        sendResetEmail: function ($scope, resetemail) {
            $scope.loading = 'loading';
            $http({
                url: 'api/ResetPassword/0',
                method: "PUT",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: "=" + resetemail
            }).success(function (data, status) {
                $scope.loading = '';

                if (data == resetemail) {
                    $scope.resetPassword = '';
                    $scope.resetPasswordInfo = "An email with reset password has been sent to you. Please use the link from the email to login to waachak";
                }
                else
                    $scope.resetPasswordInfo = "Could not validate the entered email";

            }).error(function (data, status) {
                $scope.loading = '';
            });
        },

        addWaachakUser: function ($scope, newUser) {
            $scope.loading = 'loading';

            $http({
                url: 'api/Authenticate/0',
                method: "PUT",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: "=" + JSON.stringify(newUser)
            }).success(function (data, status) {

                user.isAuthenticated = data.authToken;
                user.userName = data.User_Name;
                user.userID = data.UserID;
                user.authToken = data.authToken;
                user.userImageUrl = data.userImageUrl;
                feedData = '';
                if (data.authToken)
                    getSubscriptions();
                else
                    alert("Failed to add user. Please try a different user name.");

                $scope.loading = '';
            }).error(function (data, status) {
                $scope.loading = '';
            });
        },

        getFolders: function ($scope, item) {
            $scope.loading = 'loading';
            if (user.userID == "Explorer" && user.authToken == "") {
            }
            else {
                $http.get('api/Folder/' + user.userID).
                          success(function (data, status) {
                              $scope.Folders = data;
                              $scope.loading = '';
                          }).
                          error(function (data, status) {
                              $scope.loading = '';
                          });
            }
        },

        markItemAsRead: function ($scope, item) {

            if (user.userID == "Explorer" && user.authToken == "") {
                // TODO: add features
            }
            else {

                $scope.loading = 'loading';
                var readItem = new Object();
                readItem.userID = user.userID;
                readItem.authToken = user.authToken;
                readItem.savedForReading = item.savedForReading;
                readItem.feedName = item.feedName;
                readItem.items = [];
                readItem.items.push({
                    "guid": item.guid,
                    "link": item.link,
                    "title": (item.savedForReading && item.savedForReading == 1) ? item.title : "",
                    "pubDate": item.pubDate
                });

                return $http({
                    url: 'api/FeedItem',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF8' },
                    data: readItem
                }).success(function (data, status) {

                    if (item.savedForReading && (item.savedForReading == 1 || item.savedForReading == -1))
                        $scope.getSavedItems();

                    $scope.loading = '';

                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        markAllItemsAsRead: function ($scope) {

            var feed = new Object();
            feed.url = $scope.currentFeedUrl;
            feed.userID = user.userID;
            feed.authToken = user.authToken;
            feed.items = [];
            for (i = 0; i < $scope.feedData.items.length; i++) {
                feed.items.push({
                    "guid": $scope.feedData.items[i].guid,
                    "link": $scope.feedData.items[i].link,
                    "title": "", //JSON.stringify(feedData.items[i].title),
                    "pubDate": $scope.feedData.items[i].pubDate
                });
            }

            if (user.userID == "Explorer" && user.authToken == "") {
                // TODO: add features for Explorer
            }
            else {
                return $http({
                    url: 'api/MarkAllFeedsItemsAsRead',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: feed
                }).success(function (data, status) {

                    // refresh
                    $scope.refresh();
                    $scope.loading = '';

                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        getSavedItems: function ($scope, $http) {

            var sub = new Object();
            sub.userID = user.userID;
            sub.authToken = user.authToken;

            if (user.userID == "Explorer" && user.authToken == "") {
                // TODO: add features for Explorer
            } else {
                $scope.loading = 'loading';

                return $http({
                    url: 'api/SavedItems',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: sub
                }).success(function (data, status) {
                    
                    $scope.savedItems = data;
                    if ($scope.currentFeedUrl == "s")
                        $scope.feedData = data;

                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        updateSubscriptionCounts: function ($scope, $http) {

            var sub = new Object();
            sub.userID = user.userID;
            sub.authToken = user.authToken;

            if (user.userID == "Explorer" && user.authToken == "") {
                // TODO: add features for Explorer
            } else {
                $scope.loading = 'loading';

                return $http({
                    url: 'api/SubscriptionCount',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: sub
                }).success(function (data, status) {
                    $scope.totalUnreadCount = 0;
                    $scope.subscriptions = data;
                    $scope.loading = '';
                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        getSubscriptions: function ($scope, $http) {

            if (user.userID == "Explorer" && user.authToken == "") {

                $scope.subscriptions = [
                                    { "name": "Gizmodo", "url": "http://feeds.gawker.com/gizmodo/full", "unreadCount": 0 },
                                    { "name": "Techmeme", "url": "http://techmeme.com/feed.xml", "unreadCount": 0 },
                                    { "name": "Android Community", "url": "http://feeds2.feedburner.com/AndroidCommunity", "unreadCount": 0 },
                                    { "name": "Reuters News", "url": "http://feeds.reuters.com/Reuters/domesticNews?format=xml", "unreadCount": 0 },
                                    { "name": "Betanews", "url": "http://feeds.betanews.com/bn", "unreadCount": 0 }
                                ];

            } else {

                if (gotOnce == 0) {

                    $http({
                        url: 'api/SubscrriptionsWithoutCount',
                        method: "POST",
                        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                        data: user
                    }).success(function (data, status) {
                        $scope.subscriptions = data;
                        gotOnce = 1;
                        $scope.loading = '';
                    }).
                        error(function (data, status) {
                            $scope.loading = '';
                        });
                }

                return $http({
                    url: 'api/SubscriptionCount',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: user
                }).success(function (data, status) {
                    $scope.subscriptions = data;
                    $scope.loading = '';
                }).
                    error(function (data, status) {
                        $scope.loading = '';
                    });

            }
        },

        addSubscription: function ($scope, $http, subscriptions, newSubscription) {

            var sub = new Object();
            sub.name = newSubscription.name;
            sub.url = newSubscription.url;
            sub.IsFolder = (newSubscription.IsFolder == true) ? 1 : 0;
            sub.ParentFolder = (newSubscription.ParentFolder == undefined) ? 0 : newSubscription.ParentFolder;
            sub.userID = user.userID;
            sub.ID = (newSubscription.ID == undefined) ? 0 : newSubscription.ID;
            sub.authToken = user.authToken;

            if (user.userID == "Explorer" && user.authToken == "") {
                subscriptions.push({ name: newSubscription.name, url: newSubscription.url, unreadCount: 0, userID: user.userID });
                $scope.loading = '';
                $scope.currentSubscriptionTab = 1;
                $scope.secondTabTitle = '';
            }
            else {

                return $http({
                    url: 'api/Subscriptions',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: sub //"=" + JSON.stringify({ "name": newSubscription.name, "authToken":$scope.authToken })
                }).success(function (data, status) {
                    $scope.newSubscription.name = '';
                    $scope.newSubscription.url = '';
                    $scope.newSubscription.ID = '';

                    $scope.updateSubscriptionCounts($scope, $http);
                    $scope.loading = '';
                    $scope.currentSubscriptionTab = 1;
                    $scope.secondTabTitle = '';
                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        getDefaultSubscriptions: function ($scope, $http) {
            var sub = new Object();
            sub.userID = user.userID;
            sub.authToken = user.authToken;

            return $http({
                url: 'api/DefaultFeed',
                method: "get",
                headers: { 'Content-Type': 'application/json;charset=UTF8' },
                data: sub
            }).success(function (data, status) {

                $scope.defaultSubscriptions = data;

                for (i = 0; i < $scope.defaultSubscriptions.length; i++) {
                    for (z = 0; z < $scope.subscriptions.length; z++) {
                        if ($scope.subscriptions[z].url == $scope.defaultSubscriptions[i].url) {
                            $scope.defaultSubscriptions[i].alreadySubscribed = 1;
                            break;
                        }
                    }
                }

                $scope.loading = '';
            }).error(function (data, status) {
                $scope.loading = '';
            });

        },

        deleteSubscription: function ($scope, deletedSubscription) {

            var sub = new Object();
            sub.userID = user.userID;
            sub.ID = deletedSubscription.ID;
            sub.authToken = user.authToken;

            if (user.userID == "Explorer" && user.authToken == "") {

            }
            else {
                return $http({
                    url: 'api/Subscriptions',
                    method: "delete",
                    headers: { 'Content-Type': 'application/json;charset=UTF8' },
                    data: sub
                }).success(function (data, status) {

                    $scope.updateSubscriptionCounts($scope, $http);
                    $scope.loading = '';
                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        updateSubscription: function ($scope, $http) {

            var subs = [];
            columnRows = $(".column");
            for (i = 0; i < columnRows.length; i++) {

                var subSorted = new Object();
                subSorted.userID = user.userID;
                subSorted.authToken = user.authToken;
                subSorted.ID = $(columnRows[i]).find("#sortColID")[0].innerText;

                subs.push(subSorted);
            }

            if (user.userID == "Explorer" && user.authToken == "") {
                // TODO: add features for Explorer
            }
            else {
                return $http({
                    url: 'api/Subscriptions',
                    method: "PUT",
                    data: subs,
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' }
                }).success(function (data, status) {
                    $scope.updateSubscriptionCounts($scope, $http);
                    $scope.loading = '';
                }).error(function (data, status) {
                    $scope.loading = '';
                });
            }
        },

        openFeed: function ($scope, $http, feedUrl) {
                        
            var feed = new Object();
            feed.userID = user.userID;
            feed.authToken = user.authToken;
            feed.ShowAll = $scope.showAll;
            if (feedUrl == "*") {
                feed.GetAllFeeds = 1;
                feed.url = "";
            }
            else {
                feed.GetAllFeeds = 0;
                feed.url = $scope.currentFeedUrl;
            }

            return $http({
                url: 'api/FeedData',
                method: "POST",
                data: feed,
                headers: { 'Content-Type': 'application/json;charset=UTF-8' }
            }).success(function (data, status) {
                
                $scope.feedData = data;
                $scope.updateSubscriptionCounts($scope, $http);
                $scope.currentFeedUnreadCount = 0;
                showFilter = 's';

                for (i = 0; i < data.items.length; i++) {
                    $scope.currentFeedUnreadCount += i.unreadCount;
                }

                $scope.loading = '';

            }).error(function (data, status) {
                $scope.feedData = '';
                $scope.loading = '';
            });
        }
    };
});

waachakApp.filter('fromNow', function () {
    return function (dateString) {
        var d = new Date(dateString);
        var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
            "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
        var daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        var amPM = "AM";
        if (d.getHours() > 11)
            amPM = "PM";

        if (d.getDate() == (new Date()).getDate())
            return hours[d.getHours()].toString() + ":" + d.getMinutes() + amPM;
        else
            return daysInWeek[d.getDay()]; // + " " + monthNames[d.getMonth()] + " " + d.getDate() + ", " + " " + hours[d.getHours()].toString() + ":" + d.getMinutes() + amPM;
    };
});

waachakApp.controller("mainController", function ($scope, $http, $route, $routeParams, $location, waachakFactory) {

    var googleauthToken = getParameterHashByName("access_token");

    $scope.waachakFactory = waachakFactory;
    $scope.loading = '';
    $scope.feedData = '';

    $scope.user = waachakFactory.user();
    if ($scope.user.userName == '') {

        var u = $scope.user;
        u.googleauthToken = googleauthToken;
        waachakFactory.setUser(u);
        $location.path('/login');
    }

    $scope.showHideAbout = function (showHide) {
        document.getElementById("about").style.display = showHide;
    }

    $scope.theme = "Styles/common.css";
    $scope.setTheme = function (t) {

        if (t == undefined)
            return;

        if (t == 0) {
            v = document.getElementById("divThemeSelector").style.display;
            document.getElementById("divThemeSelector").style.display = (v == "none" || v == "") ? "inline-block" : "none";
        }
        else if (t == 1) {
            $scope.theme = "Styles/common.css";
            document.getElementById("divThemeSelector").style.display = "none";
        }
        else if (t == 2) {
            $scope.theme = "Styles/office.css";
            document.getElementById("divThemeSelector").style.display = "none";
        }
        else if (t == 3) {
            $scope.theme = "Styles/brown.css";
            document.getElementById("divThemeSelector").style.display = "none";
        }

        if ($scope.user.userID && t != 0) {
            document.cookie = $scope.user.userID + "Theme=" + t;
        }
    }

    $scope.getThemeFontWeight = function (css) {
        if (css && css == $scope.theme)
            return "font-weight:bold";
        else
            return "font-weight:normal";
    }

});
