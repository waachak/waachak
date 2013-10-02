waachakApp.controller("subscriptionController", function ($scope, $http, $route, $routeParams, $location, waachakFactory) {
    debugger;
    $scope.waachakFactory = waachakFactory;
    $scope.loading = '';
    $scope.newSubscription = waachakFactory.newSubscription();
    $scope.user = waachakFactory.user();
    $scope.subscriptions = [];
    $scope.savedItems = '';
    $scope.feedData = '';
    $scope.explorerMessage = "This feature is available for signed up users only!";
    waachakFactory.getSubscriptions($scope, $http);
    waachakFactory.getSavedItems($scope, $http);
    $scope.showFilter = waachakFactory.showFilter();
    
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

    $scope.addEditSubscription = function (addEdit, subEdit) {
        if ($scope.user.userID == "Explorer" && $scope.user.authToken == "" && subEdit) {
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
    $scope.currentFeedUrl = '';
    $scope.defaultSubscriptions = []
    
    $scope.getFolderList = function () {
        $scope.loading = 'loading';
        waachakFactory.getFolders($scope, $http);
    }

    $scope.addSubscriptionC = function (newSubscription) {
        debugger;
        if (validateUrl(newSubscription.url)) {
            blnAdd = true;
            if (newSubscription.ID && newSubscription.ID != 0 && newSubscription.ID != '') {
               // blnAdd = false;
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
                waachakFactory.addSubscription($scope, $http, $scope.subscriptions, newSubscription);
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
        if ($scope.user.userID == "Explorer" && $scope.user.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        if (deletedSubscription && confirm('Are You sure you want to delete subscription for "' + deletedSubscription.name + '"?')){
            $scope.loading = 'loading';
            waachakFactory.deleteSubscription($scope, deletedSubscription);
        }
    };
    
    $scope.resizeContent = function () {
        resizeContent();
    }


    $scope.removeFromSavedList = function (item) {
        item.savedForReading = -1;
        $scope.markItemAsRead(item);
    }

    $scope.saveItemForReadingLater = function (item, feedName) {
        if ($scope.user.userID == "Explorer" && $scope.user.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        item.savedForReading = 1;
        item.feedName = feedName;
        $scope.markItemAsRead(item);
    }

    $scope.markItemAsRead = function (item) {
        if (item.savedItem == 0 || item.savedForReading == -1 || item.isItemRead == 0 || item.savedForReading == 1)
            waachakFactory.markItemAsRead($scope, item);
    }

    $scope.markAllItemsAsRead = function () {
        if ($scope.user.userID == "Explorer" && $scope.user.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        $scope.loading = 'loading';
        waachakFactory.markAllItemsAsRead($scope);
    }
    
    $scope.openFeed = function (f) {
        $scope.loading = 'loading';
        $scope.currentFeedUrl = f.url;

        waachakFactory.openFeed($scope, $http, f.url);
        $scope.currentFeedUnreadCount = f.unreadCount;
    }

    $scope.getAllItems = function (f) {

        if ($scope.user.userID == "Explorer" && $scope.user.authToken == "") {
            alert($scope.explorerMessage);
            return;
        }

        $scope.loading = 'loading';
        $scope.currentFeedUrl = "*";
        waachakFactory.openFeed($scope, $http, "*");
        $scope.currentFeedUnreadCount = $scope.totalUnreadCount;
    };

    $scope.refresh = function () {
        $scope.loading = 'loading';
        if ($scope.currentFeedUrl) {
            waachakFactory.openFeed($scope, $http, $scope.currentFeedUrl);
        }
    }
    
    $scope.getSavedItems = function () {
        waachakFactory.getSavedItems($scope, $http);
    }

    $scope.updateSubscriptionCounts = function () {
        $scope.loading = 'loading';
        waachakFactory.updateSubscriptionCounts($scope, $http);
    }
    
    $scope.getDefaultSubscriptions = function () {
        waachakFactory.getDefaultSubscriptions($scope, $http);
    }

    $scope.savedItems = [];
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
        
        if ($scope.user.userID == "Explorer" && $scope.user.authToken == "") {
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
        waachakFactory.updateSubscription($scope, $http);
    }

    $scope.feedItemTitleCSS = 'feedItemTitle';
   
    $scope.getSubscriptions = function () {
        waachakFactory.getSubscriptions($scope, $http);
    }
    
    $scope.widthMag = function(){

        return "width:" + (27).toString() + "%;overflow:none;";
    }
  
});
