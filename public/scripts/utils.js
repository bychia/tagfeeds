var dateCooked = function(pubDateStr){
  var pubDate = new Date(pubDateStr);
  var currentDate = new Date();
  var differenceDateMS = currentDate-pubDate;
  if(differenceDateMS < 3600000 ){   //less than an hour
    return Math.round(differenceDateMS/60000) + " minutes ago";
  }else if(differenceDateMS < 86400000 ){   //less than a day
    return Math.round(differenceDateMS/3600000) + " hours ago";
  }else if(differenceDateMS < 604800000){   //less than a week
    return Math.round(differenceDateMS/86400000) + " days ago";
  }else{
    return pubDate.toLocaleDateString();
  }
}

var isEmpty = function(text){
  if(text == null || text == "")
    return true;
  return false;
}

var isUndefined = function(obj){
  if(obj === undefined || obj===null){
    return true;
  }
  return false;
}

var isOutdated = function(currentTimestamp){
  // console.log("getSessionSearchText::"+getSessionSearchText());
  // console.log("getSessionRefreshSearch::"+getSessionRefreshSearch());
  if(!isUndefined(typeof(localStorage)) && getSessionRefreshSearch()=="true"){
    // console.log(">"+!isUndefined(typeof(localStorage)));
    return true;
  }else if(getSessionSearchText() != getURLRequestSearchText()){
    return true;
  }else{
    var tfLastSaved = localStorage.getItem("tfLastSaved");
    if(tfLastSaved!=null){
      // console.log(">>"+tfLastSaved);
      return (((currentTimestamp-tfLastSaved)/3600000)>1); // is outdated after an hour
    }
  }
  return true;
}

var getURLRequestSearchText = function(){
  var urlRequestSearchText = "";
  var winLocation = window.location;
  var urlRequestPath = winLocation.pathname.substr(1);
  if(urlRequestPath.length > 0){
    urlRequestSearchText = urlRequestPath;
  }
  return urlRequestSearchText;
}

var getSessionSearchText = function(){
  var sessionSearchText = "";
  if(!isUndefined(typeof(localStorage)) && localStorage.getItem("tfSearchText")!==null){
    sessionSearchText = localStorage.getItem("tfSearchText");
  }
  return sessionSearchText;
}

var setSessionSearchText = function(searchText){
  if(!isUndefined(typeof(localStorage))){
    localStorage.setItem("tfSearchText", searchText);
  }
}

var getSessionRefreshSearch = function(){
  var sessionSearchStatus = undefined;
  if(!isUndefined(typeof(localStorage)) && localStorage.getItem("tfRefreshSearch")!==null){
    sessionSearchStatus = localStorage.getItem("tfRefreshSearch");
  }
  return sessionSearchStatus;
}

var isJSON = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var showErrorMsg = function(str){
  if(str.length>0)
    alert("Your search: "+str+" did not return any result.");
  else
    alert("Your search did not return any result.");
}

var isSearchInputFocused = function(){
  return ($("#searchInput").is(":focus"));
}

var updateSearchStorage = function(){
  if(getSessionSearchText() != getURLRequestSearchText())
    localStorage.setItem("tfRefreshSearch", true);
  else
    localStorage.setItem("tfRefreshSearch", false);
  setSessionSearchText(getURLRequestSearchText());
}

var infoMsg_LocalStorage = function(){
  try{
    window.localStorage.setItem("hasLocalStorage",true);
  }catch(err){
    var infoDiv = $("div#information");
    infoDiv.addClass("small transparent information-padding");
    infoDiv.append("<span class='glyphicon glyphicon-info-sign' aria-hidden='true'/>Tagfeeds.com uses cookies to remember your usage preferences (such as last-saved search text, etc). Please turn on the browser cookies to have a better experience.");
    infoDiv.animate({opacity: 0.9}, 500);
  }
}


var localStorage = window.localStorage;
var backendURL = "http://api.tagfeeds.com/newsBing";
var keyId = 0;
updateSearchStorage();
setTimeout(infoMsg_LocalStorage,1000);
