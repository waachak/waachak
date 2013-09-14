function autoLogin(userIDc, authTokenc, userNamec, userImageUrlc, fbCode) {
    
    if (userNamec) {
        thm = readCookie(userNamec + "Theme");
        if (thm)
            angular.element(document.getElementById('divSubscriptions')).scope().setTheme(thm);
    }

    if (fbCode && !userIDc && !authTokenc) {
        angular.element(document.getElementById('divSubscriptions')).scope().signInFacebookUser(fbCode);
        return;
    }

    resizeContent();
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function loginWithFaceBook(){
    window.location = "https://www.facebook.com/dialog/oauth?client_id=YOUR ID HERE&redirect_uri=http://waachak.apphb.com/Index.html";
    //window.location = "https://www.facebook.com/dialog/oauth?client_id=YOUR ID HERE&redirect_uri=http://localhost:51041/Index.html";
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParameterHashByName(name) {
    results = "";
    var iPos = location.hash.indexOf("=");
    if (iPos > 0) {
        subs = location.hash.substring(iPos+1);
        iPos = subs.indexOf("&");
        results = subs.substring(0, iPos);
    }
    return results;
}

function resizeContent() {

    tdFeedList = document.getElementById("tdFeedList");
    tdSubscriptionList = document.getElementById("tdSubscriptionList");
    if (tdFeedList)
        tdFeedList.style.height = (window.innerHeight - 150) + "px";

    if (tdSubscriptionList)
        tdSubscriptionList.style.height = (window.innerHeight - 150) + "px";

}

window.onresize = function () {
    resizeContent();
}