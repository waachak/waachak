var subscriptionApp = angular.module("subscriptionApp", []);

subscriptionApp.factory('subscriptionsFactory', function ($http) {
    return {

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

                if (data == "SCS")
                {
                    // show redirection link
                    $scope.authToken = data;
                }
                else
                    alert("Failed to update password.");

                $scope.loading = '';
            }).error(function (data, status) {
                $scope.status = status;
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
                $scope.status = status;
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

                    $scope.isAuthenticated = data.authToken;
                    $scope.userName = data.User_Name;
                    $scope.userID = data.UserID;
                    $scope.authToken = data.authToken;
                    $scope.newSubscription.userID = data.UserID;
                    $scope.userImageUrl = data.userImageUrl;
                    $scope.feedData = '';
                    if (data.authToken)
                        $scope.getSubscriptions();
                    else
                        alert("Failed to add user. Please try a different user name.");

                    $scope.loading = '';
            }).error(function (data, status) {
                $scope.status = status;
                $scope.loading = '';
            });
        },

       getFolders: function($scope, item) {
           $scope.loading = 'loading';
           if ($scope.userID == "Explorer" && $scope.authToken == "") {
           }
           else {
               $http.get('api/Folder/' + $scope.userID).
                         success(function (data, status) {
                             $scope.Folders = data;
                             $scope.status = status;
                             $scope.loading = '';
                         }).
                         error(function (data, status) {
                             $scope.status = status;
                             $scope.loading = '';
                         });
           }
        },

        markItemAsRead: function ($scope, item) {
           
            if ($scope.userID == "Explorer" && $scope.authToken == "") {
                // TODO: add features
            }
            else {
                
                $scope.loading = 'loading';
                var readItem = new Object();
                readItem.userID = $scope.userID;
                readItem.authToken = $scope.authToken;
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
            feed.userID = $scope.userID;
            feed.authToken = $scope.authToken;
            feed.items = [];
            for (i = 0; i < $scope.feedData.items.length; i++) {
                feed.items.push({
                    "guid": $scope.feedData.items[i].guid,
                    "link": $scope.feedData.items[i].link,
                     "title": "", //JSON.stringify($scope.feedData.items[i].title),
                    "pubDate": $scope.feedData.items[i].pubDate
                });
            }
            
            if ($scope.userID == "Explorer" && $scope.authToken == "") {
            } else {
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

            $scope.loading = 'loading';
            var sub = new Object();
            sub.userID = $scope.userID;
            sub.authToken = $scope.authToken;

            if ($scope.userID == "Explorer" && $scope.authToken == "") {
                // TODO: add features for Explorer
            } else {
                return $http({
                    url: 'api/SavedItems',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: sub
                }).success(function (data, status) {
                    $scope.savedItems = data;
                    if ($scope.currentFeedUrl == "s")
                        $scope.feedData = data;

                    $scope.status = status;
                }).error(function (data, status) {
                    $scope.status = status;
                    $scope.loading = '';
                });
            }
        },

        updateSubscriptionCounts: function ($scope, $http) {

            $scope.loading = 'loading';
            var sub = new Object();
            sub.userID = $scope.userID;
            sub.authToken = $scope.authToken;

            if ($scope.userID == "Explorer" && $scope.authToken == "") {
                // TODO: add features for Explorer
            } else {
                return $http({
                    url: 'api/SubscriptionCount',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: sub
                }).success(function (data, status) {
                    $scope.totalUnreadCount = 0;
                    $scope.subscriptions = data;
                    $scope.status = status;
                    $scope.loading = '';
                }).error(function (data, status) {
                    $scope.status = status;
                    $scope.loading = '';
                });
            }
        },

        getSubscriptions: function ($scope, $http) {

            var sub = new Object();
            sub.userID = $scope.userID;
            sub.authToken = $scope.authToken;

            if ($scope.userID == "Explorer" && $scope.authToken == "") {

            } else {

                if ($scope.gotOnce == 0) {

                    $http({
                        url: 'api/SubscrriptionsWithoutCount',
                        method: "POST",
                        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                        data: sub
                    }).success(function (data, status) {
                        $scope.subscriptions = data;
                        $scope.status = status;
                        $scope.gotOnce = 1;
                    }).
                        error(function (data, status) {
                            $scope.status = status;
                        });
                }

                return $http({
                    url: 'api/SubscriptionCount',
                    method: "POST",
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    data: sub
                }).success(function (data, status) {
                    $scope.subscriptions = data;
                    $scope.status = status;
                    $scope.loading = '';
                }).
                    error(function (data, status) {
                        $scope.status = status;
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
            sub.userID = $scope.userID;
            sub.ID = (newSubscription.ID == undefined) ? 0 : newSubscription.ID;
            sub.authToken = $scope.authToken;
            
            if ($scope.userID == "Explorer" && $scope.authToken == "") {
                $scope.subscriptions.push({ name: newSubscription.name, url: newSubscription.url, unreadCount:0, userID: $scope.userID });
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
            sub.userID = $scope.userID;
            sub.authToken = $scope.authToken;

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
            sub.userID = $scope.userID;
            sub.ID = deletedSubscription.ID;
            sub.authToken = $scope.authToken;

            if ($scope.userID == "Explorer" && $scope.authToken == "") {

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
            for (i = 0; i < columnRows.length;i++){

                var subSorted = new Object();
                subSorted.userID = $scope.userID;
                subSorted.authToken = $scope.authToken;
                subSorted.ID = $(columnRows[i]).find("#sortColID")[0].innerText;
                               
                subs.push(subSorted);
            }

            if ($scope.userID == "Explorer" && $scope.authToken == "") {
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
                    $scope.status = status;
                    $scope.loading = '';
                });
            }
        },

        openFeed: function ($scope, $http, feedUrl) {

            var feed = new Object();
            feed.userID = $scope.userID;
            feed.authToken = $scope.authToken;
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
                    $scope.status = status;
                    $scope.updateSubscriptionCounts($scope, $http);
                    $scope.loading = '';
                    $scope.currentFeedUnreadCount = 0;
                    for (i = 0; i < data.items.length; i++) {
                        $scope.currentFeedUnreadCount += i.unreadCount;
                    }
               }).error(function (data, status) {
                           $scope.status = status;
                           $scope.feedData = '';
                           $scope.loading = '';
               });
        }
    };
});

subscriptionApp.controller("subscriptionController", function ($scope, $http, subscriptionsFactory) {

    $scope.signup = '';
    $scope.newUserSignUp = function () {
        $scope.signup = "New User!";
        $scope.loading = '';
    }

    $scope.showHideAbout = function (showHide) {
        document.getElementById("about").style.display = showHide;
    }

    $scope.currentTabStyle = function (tab) {
        if (tab == $scope.currentSubscriptionTab)
            return "tabEnabled";
        else
            return "tabDisabled";

    }

    $scope.isSubscribed = function (isSubscribed) {
        if (isSubscribed && isSubscribed == 1)
            return "lightGrayButton";
        else
            return "lightBlueButton";
    }

    $scope.explorerMessage = "This feature is available for signed up users only!";

    $scope.addEditSubscription = function (addEdit, subEdit) {
        if ($scope.userID == "Explorer" && $scope.authToken == "" && subEdit) {
            alert($scope.explorerMessage);
            return;
        }

        $scope.secondTabTitle = addEdit;
        $scope.currentSubscriptionTab = 2;
        $scope.currentTabStyle(1);
        $scope.currentTabStyle(2);
        if (subEdit) {
            $scope.newSubscription.name = subEdit.name;
            $scope.newSubscription.url = subEdit.url;
            $scope.newSubscription.IsFolder = subEdit.IsFolder;
            $scope.newSubscription.ParentFolder = subEdit.ParentFolder;
            $scope.newSubscription.ID = subEdit.ID;
        }
        else {
            $scope.newSubscription.name = "";
            $scope.newSubscription.url = "";
            $scope.newSubscription.IsFolder = "";
            $scope.newSubscription.ParentFolder = "";
            $scope.newSubscription.ID = '';
        }
    }

    $scope.secondTabTitle = "";
    $scope.currentSubscriptionTab = 1;
    $scope.Folders = [];
    $scope.newSubscription = { name: '', url: '', userID: '' };
    $scope.currentFeedUrl = '';
    $scope.feedData = '';
    $scope.status = 'Loaded';
    $scope.loading = '';
    $scope.subscriptions = []; //subscriptionsFactory.getSubscriptions($scope, $http);
    $scope.defaultSubscriptions = []
    $scope.gotOnce = 0;
    
    $scope.getFolderList = function () {
        $scope.loading = 'loading';
        subscriptionsFactory.getFolders($scope, $http);
    }

    $scope.addSubscriptionC = function (newSubscription) {
        if (validateUrl(newSubscription.url)) {
            blnAdd = true;
            if (newSubscription.ID && newSubscription.ID != 0 && newSubscription.ID != '') {
                blnAdd = false;
            }
            else {
                for (i = 0; i < $scope.subscriptions.length; i++) {
                    if (newSubscription.url == $scope.subscriptions[i].url) {
                        blnAdd = false;
                        alert("You have already subscribed to feed URL: " + newSubscription.url);
                        break;
                    }
                }
            }

            if (blnAdd == true) {
                $scope.loading = 'loading';
                subscriptionsFactory.addSubscription($scope, $http, $scope.subscriptions, newSubscription);
            }
        }
        else {
            alert("Please enter a valid URL: " + newSubscription.url + " test");
        }
    };
   
    function validateUrl(value) {
        return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }

    $scope.deleteSubscription = function (deletedSubscription) {
        if ($scope.userID == "Explorer" && $scope.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        if (deletedSubscription && confirm('Are You sure you want to delete subscription for "' + deletedSubscription.name + '"?')){
            $scope.loading = 'loading';
            subscriptionsFactory.deleteSubscription($scope, deletedSubscription);
        }
    };
    
    $scope.removeFromSavedList = function (item) {
        item.savedForReading = -1;
        $scope.markItemAsRead(item);
    }

    $scope.saveItemForReadingLater = function (item, feedName) {
        if ($scope.userID == "Explorer" && $scope.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        item.savedForReading = 1;
        item.feedName = feedName;
        $scope.markItemAsRead(item);
    }

    $scope.markItemAsRead = function (item) {
        if (item.savedItem == 0 || item.savedForReading == -1)
            subscriptionsFactory.markItemAsRead($scope, item);
    }

    $scope.markAllItemsAsRead = function () {
        if ($scope.userID == "Explorer" && $scope.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        $scope.loading = 'loading';
        subscriptionsFactory.markAllItemsAsRead($scope);
    }
    
    $scope.openFeed = function (f) {
        $scope.loading = 'loading';
        $scope.currentFeedUrl = f.url;
        subscriptionsFactory.openFeed($scope, $http, f.url);
        $scope.currentFeedUnreadCount = f.unreadCount;

    };

    $scope.getAllItems = function (f) {

        if ($scope.userID == "Explorer" && $scope.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        $scope.loading = 'loading';
        $scope.currentFeedUrl = "*";
        subscriptionsFactory.openFeed($scope, $http, "*");
        $scope.currentFeedUnreadCount = $scope.totalUnreadCount;
    };

    $scope.refresh = function () {
        $scope.loading = 'loading';
        if ($scope.currentFeedUrl) {
            subscriptionsFactory.openFeed($scope, $http, $scope.currentFeedUrl);
        }
    }
    
    $scope.getSavedItems = function () {
        $scope.loading = 'loading';
        subscriptionsFactory.getSavedItems($scope, $http);
    }

    $scope.updateSubscriptionCounts = function () {
        subscriptionsFactory.updateSubscriptionCounts($scope, $http);
    }
    
    $scope.getDefaultSubscriptions = function () {
        subscriptionsFactory.getDefaultSubscriptions($scope, $http);
    }

    $scope.savedItems = '';
    $scope.userID = '';
    $scope.userImageUrl = 'Images/reader.jpg';
    $scope.authToken = '';
    $scope.totalUnreadCount = 0;
    $scope.currentFeedUnreadCount = 0;
    $scope.showDescription = '';

    $scope.getDefaultFeedCSS = function(folder){
        if (folder && folder == 1)
            return "folder";        
        else
            return "nonFolder"; 
    }

    $scope.updateCount = function (n) {
        if (!isNaN(n))
            $scope.totalUnreadCount = $scope.totalUnreadCount + n;
    }

    $scope.adjustFeedItemsSize = function () {

        return "width:" + (window.innerWidth() - 200) + "px;height:" + (window.innerHeight() - 200) + "px;";
    }

    $scope.setShowHideDesc = function (obj) {
        if (obj && obj.srcElement.innerText && obj.srcElement.innerText == "Expand All") {
            $scope.showDescription = "show";
            $scope.feedItemTitleCSS = "feedItemTitleRead";
            obj.srcElement.innerText = "Collapse All";

            $(".feedItemDetails a").attr("target", "_blank");
        }
        else {
            $scope.showDescription = "";
            $scope.feedItemTitleCSS = "feedItemTitle";
            obj.srcElement.innerText = "Expand All";
        }
    }

    $scope.showMagazine = '';
    $scope.setListMagazine = function (obj) {
        if (obj && obj.srcElement.innerText && obj.srcElement.innerText == "Show Cards") {
            $scope.showMagazine = "show";
            obj.srcElement.innerText = "Show List";
            $(".feedItemMagazine a").attr("target", "_blank");

            window.setTimeout($scope.setCardsPosition, 1000)
        }
        else {
            $scope.showMagazine = "";
            obj.srcElement.innerText = "Show Cards";
        }
    }
    

    $scope.setCardsPosition = function () {
        return;
        
        divMagazine = document.getElementById("divMagazine");
        wMagazine = divMagazine.getBoundingClientRect().width;

        card = document.getElementById("divCard0");
        r = card.getBoundingClientRect();
        wCard = r.width;

        numOfHCards = 3;
        if (wCard * 3 > wMagazine)
            numOfHCards = 2;
        else if (wCard * 2 > wMagazine)
            numOfHCards = 1;

        if (numOfHCards == 1)
            return;

        c1 = 0;
        c2 = 0;
        c3 = 0;
        ctop = 0;
        for(i=0;i<$scope.feedData.items.length;i++){

            card = document.getElementById("divCard" + i);
            r = card.getBoundingClientRect();

            if ((i+1) > numOfHCards) {
                
                if (numOfHCards == 3 && ((i + 1) % 3) == 2) {
                    ctop = (c3);
                }
                else if (numOfHCards == 2 &&  ((i + 1) % 3) == 1) {
                    ctop = (c2);
                }
                else {
                    ctop = (c1);
                }

                card.style.top = ctop + "px";
                card.style.position = "relative";
            }

            card = document.getElementById("divCard" + i)
            cbottom = card.offsetHeight + card.clientTop;

            if (numOfHCards == 3 && ((i + 1) % 3) == 0)
                c3 = cbottom;
            else if (numOfHCards == 2 &&  ((i + 1) % 2) == 0)
                c2 = cbottom;
            else
                c1 = cbottom;
        }
    }

    $scope.showAll = "0";
    $scope.showAllf = function (obj) {
        
        if ($scope.userID == "Explorer" && $scope.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        if (obj && obj.srcElement.innerText && obj.srcElement.innerText == "Show all items") {
            $scope.showAll = "All";
            obj.srcElement.innerText = "New items only";
        }
        else {
            $scope.showAll = "0";
            obj.srcElement.innerText = "Show all items";
        }

        $scope.refresh();
    }


    $scope.getThemeFontWeight = function (css) {
        if (css && css == $scope.theme)
            return "font-weight:bold";
        else
            return "font-weight:normal";
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

        if ($scope.userID && t != 0) {
            document.cookie = $scope.userID + "Theme=" + t;
        }
    }

    $scope.getFontWeight = function (obj) {
        if (obj && obj > 0)
            return "font-weight:normal;";
        else
            return "font-weight:normal;";
    }

    function getBC() {
        bc = "background-color:rgba(243,243,243,1.0);"
        if ($scope.theme == "Styles/common.css")
            bc = "background-color:#e9e9e9;"

        return bc;
    }

    $scope.getBackColor = function (obj) {
        if (obj == 1) {
            return "font-weight:normal;" + getBC();
        }
    }

    $scope.showItemDetails = function (obj, itemTitle) {
        if (obj) {

            dstyle = document.getElementById(obj).style.display;
            showNoShow = "none";
            if (dstyle == "" && ($scope.showDescription == "show"))
                showNoShow = "none";

            if (dstyle == "none" && ($scope.showDescription == "show"))
                showNoShow = "block";

            if ((dstyle == "" || dstyle == "none") && ($scope.showDescription == ""))
                showNoShow = "block";

            document.getElementById(obj).style.display = showNoShow;
            itemTitle.srcElement.style.fontWeight = "normal";

            bc = "rgba(243,243,243,.85)";
            if ($scope.theme == "Styles/common.css")
                bc = "#e9e9e9";

            if (itemTitle.srcElement.className != "ng-binding") {
                itemTitle.srcElement.style.backgroundColor = bc;
            } else {
                itemTitle.srcElement.parentNode.style.backgroundColor = bc;
            }

            $(".feedItemDetails a").attr("target", "_blank");
        }
    }


    $scope.sortSubscriptions = function () {
        subscriptionsFactory.updateSubscription($scope, $http);
    }

    $scope.feedItemTitleCSS = 'feedItemTitle';
    $scope.showFeedDiscoveryDialog = "";
   

    $scope.resetPassword = '';
    $scope.resetPasswordEmail = '';
    $scope.resetPasswordInfo = '';

    $scope.sendResetPasswordEmail = function (resetemail) {
        if (!resetemail) {
            $scope.resetPasswordInfo = "Please enter a valid email address";
        }
        else {
            subscriptionsFactory.sendResetEmail($scope, resetemail);
        }
    }


    $scope.resetWaachakUserPassword = function (resetUser) {
        if (resetUser.userPasswordRepeat != resetUser.userPassword) {
            alert("Entered passwords don't match")
        }
        else {
            subscriptionsFactory.resetWaachakUser($scope, resetUser);
        }
    }

    $scope.addWaachakUser = function (newUser) {
        if (newUser.userPasswordRepeat != newUser.userPassword) {
            alert("Entered passwords don't match")
        }
        else {
            subscriptionsFactory.addWaachakUser($scope, newUser);
        }
    }

    $scope.getSubscriptions = function () {
        subscriptionsFactory.getSubscriptions($scope, $http);
    }
    
    var vPreRand = 0;

    $scope.widthMag = function(){

        return "width:" + (27).toString() + "%;overflow:none;";
    }

    $scope.signInAsExplorer = function () {

        $scope.userID = "Explorer";
        $scope.userName = "Welcome Explorer!";
        $scope.userImageUrl = "images/reader.jpg";
        $scope.subscriptions = [
                { "name": "Gizmodo", "url": "http://feeds.gawker.com/gizmodo/full", "unreadCount": 0 },
                { "name": "Techmeme", "url": "http://techmeme.com/feed.xml", "unreadCount": 0 },
                { "name": "Android Community", "url": "http://feeds2.feedburner.com/AndroidCommunity", "unreadCount": 0 },
                { "name": "Reuters News", "url": "http://feeds.reuters.com/Reuters/domesticNews?format=xml", "unreadCount": 0 },
                { "name": "Betanews", "url": "http://feeds.betanews.com/bn", "unreadCount": 0 }
        ];
        $scope.loading = '';
    }
    
    $scope.signInWaachakUser = function (nonGoogleUser) {

        if (!nonGoogleUser || !nonGoogleUser.userID || (!nonGoogleUser.userPassword && !nonGoogleUser.authToken)) {
            alert("Please enter User Name and Password");
            return;
        }

        $scope.loading = 'loading';
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
                $scope.isAuthenticated = data.authToken;
                $scope.userName = data.User_Name;
                $scope.userID = data.UserID;
                $scope.authToken = data.authToken;
                $scope.newSubscription.userID = data.UserID;
                $scope.userImageUrl = data.userImageUrl;
                $scope.feedData = '';
                if (data.authToken) {

                    $scope.getSavedItems();
                    $scope.loading = 'loading';
                    $scope.subscriptions = subscriptionsFactory.getSubscriptions($scope, $http);
                    document.cookie = "userIDcookie=" + nonGoogleUser.userID;
                    document.cookie = "authTokencookie=" + data.authToken;
                    document.cookie = "UserNamecookie=" + data.User_Name;
                    document.cookie = "userImageUrlcookie=" + data.userImageUrl;
                }
                else if (data.UserID && !data.authToken)
                    alert("Incorrect login or session expiration. Could not validate the user, please re-enter the user name and password.");
            }).
            error(function (data, status) {
                $scope.loading = '';
                alert("Error validating waachak user.");
            });

        return $scope.userName;
    }


    $scope.userName = '';
    
    $scope.signInFacebookUser = function (fbCode) {
        $scope.loading = 'loading';
        $http({
            url: 'api/AuthenticateFacebookUser/',
            method: "POST",
            data: "=" + fbCode,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data, status) {

                $scope.isAuthenticated = data.authToken;
                $scope.userName = data.User_Name;
                $scope.userID = data.UserID;
                $scope.authToken = data.authToken;
                $scope.newSubscription.userID = data.UserID;
                $scope.userImageUrl = data.userImageUrl;
                $scope.feedData = '';
                if (data.authToken) {

                    $scope.getSavedItems();
                    $scope.subscriptions = subscriptionsFactory.getSubscriptions($scope, $http);
                }
            }).
            error(function (data, status) {
                alert("Error validating with Facebook sign in.");
            });

        return $scope.userName;
    };

    $scope.isAuthenticated = '';

    $scope.signinAsGoogleUser = function (authToken) {
        $scope.loading = 'loading';
        $http({
            url: 'api/Authenticate/',
            method: "POST",
            data: "=" + authToken,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data, status) {
                $scope.isAuthenticated = data.authToken;
                $scope.userName = data.User_Name;
                $scope.userID = data.UserID;
                $scope.authToken = data.authToken;
                $scope.newSubscription.userID = data.UserID;
                $scope.userImageUrl = data.userImageUrl;
                $scope.feedData = '';
                if (data.authToken) {
                    $scope.getSavedItems();
                    $scope.subscriptions = subscriptionsFactory.getSubscriptions($scope, $http);
                }
            }).
            error(function (data, status) {
                alert("Error validating with Google sign in.");
            });

        return $scope.userName;
    };    
});

subscriptionApp.config(function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(false);
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
});

subscriptionApp.filter('fromNow', function () {
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