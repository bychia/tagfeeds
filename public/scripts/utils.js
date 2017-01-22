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

setTimeout(infoMsg_LocalStorage,1000);
