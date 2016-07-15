var infoMsg_LocalStorage = function(){
  try{
    window.localStorage.setItem("hasLocalStorage",true);
  }catch(err){
    $("div#information").addClass("small transparent information-padding");
    $("div#information").append("<span class='glyphicon glyphicon-info-sign' aria-hidden='true'/>Tagfeeds.com uses cookies to remember your usage preferences (such as last-saved search text, etc). Please turn on the browser cookies to have a better experience.");
    $('div#information').animate({opacity: 0.9}, 500);
  }
}

setTimeout(infoMsg_LocalStorage,1000);
