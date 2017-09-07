//var system = require('system');
// if (system.args.length < 3) {
//     console.log("Missing arguments.");
//     phantom.exit();
// }

var server = require('webserver').create();
var fs = require('fs');
var port = "3030"; //parseInt(system.args[1]);
var urlPrefix = "http://localhost:3000";//system.args[2];

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

var renderHtml = function(url, cb) {
    var page = require('webpage').create();
    page.settings.resourceTimeout = 5000;
    page.onCallback = function() {
//      console.log("callback!!!");
      cb(page.content);
      page.close();
    };
    page.onInitialized = function() {
//      console.log("page initialised");
      page.evaluate(function() {
           setTimeout(function() {
               window.callPhantom();
           }, 1000);
       });
    };
    page.onLoadFinished = function(){
       var path = 'public/'+encodeURIComponent(page.title);
       fs.write(path, page.content, 'w');
    };
    if(getDocType(url)!="js"){
      page.open(url);
    }

};

server.listen(port, function (request, response) {
    var searchPath = "public" + request.url;
    console.log(searchPath);
    if (!fs.exists(searchPath)){
        console.log("renderHTMLNotFound");
        //http://localhost:3000/clinton?_escaped_fragment_=
        //var route = parse_qs(request.url)._escaped_fragment_;
        var url = urlPrefix + request.url + "?_escaped_fragment_=";
        // console.log(route);
        // console.log(urlPrefix);
        // console.log(request.url);
        renderHtml(url, function(html) {
            response.statusCode = 200;
            response.write(html);
            response.close();
        });
    }else{
        //console.log("renderHTMLFound");
        var content = fs.read(searchPath);
        response.statusCode = 200;
        response.write(content);
    }

});
//
// console.log('Listening on ' + port + '...');
// console.log('Press Ctrl+C to stop.');
// phantomjs app-seo.js 3030 http://127.0.0.1:3000
// pm2 start app-seo.js --interpreter=phantomjs
