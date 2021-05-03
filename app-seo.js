//var system = require('system');
// if (system.args.length < 3) {
//     console.log("Missing arguments.");
//     phantom.exit();
// }

var server = require('webserver').create();
var fs = require('fs');
var port = "3030"; //parseInt(system.args[1]);
var urlPrefix = "http://localhost:3003";//system.args[2];

var parse_qs = function(s) {
    var queryString = {};
    var a = document.createElement("a");
    a.href = s;
    a.search.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { queryString[$1] = $3; }
    );
    return queryString;
};

var getDocType = function(url){
  var urlPath = url.split('/');
  var doc = urlPath[urlPath.length-1];
  var docType = doc.split('.').pop();
  return docType;
}

var renderHtml = function(url, reqPage, cb) {
    var page = require('webpage').create();
    page.settings.resourceTimeout = 5000;
    page.onCallback = function() {
      cb(page.content);
      page.close();
    };
    page.onInitialized = function() {
      page.evaluate(function() {
           setTimeout(function() {
               window.callPhantom();
           }, 1000);
       });
    };
    page.onLoadFinished = function(){
       //console.log("working directory:" + fs.workingDirectory);
       var path = 'public/' + (encodeURIComponent(reqPage)+".html");
       var pageContent = page.content;
       //var pageContent = page.content.replace('<script type="text/javascript" src="http://asset.tagfeeds.com/scripts/utils.min.js"></script>',"");
       //pageContent = pageContent.replace('<script type="text/javascript" src="http://asset.tagfeeds.com/scripts/main.babel.min.js"></script>',"");
       if (fs.exists(fs.workingDirectory + "/" + path)){
           //console.log("file remove: "+ path);
           fs.remove(path);
       }
       var file = fs.open(path, {
          mode: 'w'
       });
       fs.write(path, pageContent, 'w');
       //console.log("file written: "+ path);
       file.close();

    };
    var docType = getDocType(url);
    if(docType!="js" && docType!='ico' && docType!='png' && docType!='xml' && docType!='css'){
      page.open(url);
    }

};

server.listen(port, function (request, response) {
    var searchPath = "public" + request.url;
    if (fs.exists(searchPath) && !fs.isDirectory(searchPath)){
        //console.log("renderHTMLFound");
        var content = fs.read(searchPath);
        response.statusCode = 200;
        response.write(content);
        response.close();

    }else{
        //console.log("renderHTMLNotFound");
        //http://localhost:3000/clinton?_escaped_fragment_=
        //var route = parse_qs(request.url)._escaped_fragment_;
        var url = urlPrefix + request.url; // + "?_escaped_fragment_=";
        var reqPage = request.url.replace("/","");
        // console.log(route);
        // console.log(urlPrefix);
        renderHtml(url, reqPage, function(html) {
            response.statusCode = 200;
            response.write(html);
            response.close();
        });
    }

});
//
// console.log('Listening on ' + port + '...');
// console.log('Press Ctrl+C to stop.');
// phantomjs app-seo.js 3030 http://127.0.0.1:3003
// pm2 start app-seo.js --interpreter=phantomjs
