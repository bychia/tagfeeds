function detectSwipe(el,func,cxt) {
   console.log("detectSwipe");
  swipe_det = new Object();
  swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  var min_x = 30;  //min x swipe for horizontal swipe
  var max_x = 30;  //max x difference for vertical swipe
  var min_y = 50;  //min y swipe for vertical swipe
  var max_y = 60;  //max y difference for horizontal swipe
  var direc = "";
  ele = document.getElementById(el);
  ele.addEventListener('touchstart',function(e){
    var t = e.touches[0];
    swipe_det.sX = t.screenX;
    swipe_det.sY = t.screenY;
  },false);
  ele.addEventListener('touchmove',function(e){
    e.preventDefault();
    var t = e.touches[0];
    swipe_det.eX = t.screenX;
    swipe_det.eY = t.screenY;
  },false);
  ele.addEventListener('touchend',function(e){
    //horizontal detection
    if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
      if(swipe_det.eX > swipe_det.sX) direc = "r";
      else direc = "l";
    }
    //vertical detection
    else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
      if(swipe_det.eY > swipe_det.sY) direc = "d";
      else direc = "u";
    }

    if (direc != "") {
      if(typeof func == 'function') func(el,direc,cxt);
    }
    direc = "";
    swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  },false);
}

function swipeAction(el,d,cxt) {
  console.log("you swiped on element with id '"+el+"' to "+d+" direction");
  if(d === 'r'){
    $("#carousel-left").click();
  }else if(d === 'l'){
    $("#carousel-right").click();
  }
  cxt.getData();
}

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

var assetURL = "https://tagfeeds.com";
var frontendURL = "https://www.tagfeeds.com";
var backendURL = "https://api.tagfeeds.com/newsBing";
var keyId = 0;
var localStorage = window.localStorage;
updateSearchStorage();
setTimeout(infoMsg_LocalStorage,1000);

const eventListenerOptionsSupported = () => {
  let supported = false;

  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supported = true;
      }
    });

    window.addEventListener('test', null, opts);
    window.removeEventListener('test', null, opts);
  } catch (e) {}

  return supported;
}

const defaultOptions = {
  passive: false,
  capture: false
};
const supportedPassiveTypes = [
  'scroll', 'wheel',
  'touchstart', 'touchmove', 'touchenter', 'touchend', 'touchleave',
  'mouseout', 'mouseleave', 'mouseup', 'mousedown', 'mousemove', 'mouseenter', 'mousewheel', 'mouseover'
];
const getDefaultPassiveOption = (passive, eventName) => {
  if (passive !== undefined) return passive;

  return supportedPassiveTypes.indexOf(eventName) === -1 ? false : defaultOptions.passive;
};

const getWritableOptions = (options) => {
  const passiveDescriptor = Object.getOwnPropertyDescriptor(options, 'passive');

  return passiveDescriptor && passiveDescriptor.writable !== true && passiveDescriptor.set === undefined
    ? Object.assign({}, options)
    : options;
};

const overwriteAddEvent = (superMethod) => {
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    const usesListenerOptions = typeof options === 'object' && options !== null;
    const useCapture          = usesListenerOptions ? options.capture : options;

    options         = usesListenerOptions ? getWritableOptions(options) : {};
    options.passive = getDefaultPassiveOption(options.passive, type);
    options.capture = useCapture === undefined ? defaultOptions.capture : useCapture;

    superMethod.call(this, type, listener, options);
  };

  EventTarget.prototype.addEventListener._original = superMethod;
};

const supportsPassive = eventListenerOptionsSupported();

if (supportsPassive) {
  const addEvent = EventTarget.prototype.addEventListener;
  overwriteAddEvent(addEvent);
}