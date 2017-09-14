const express = require('express');
const path = require('path');
const fs = require('fs');
const request = require('request');
const app = express();

const phantomHost = "http://localhost:3030";

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'))

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('/:searchText', function(req, res){
    var searchPath = path.join(__dirname, './public', req.url);
    var searchFile = searchPath+".html";
    if(fs.existsSync(searchFile)){
        res.sendFile(searchFile);
    }else{
        res.sendFile(path.join(__dirname, './public', 'index.html'));
//        console.log(phantomHost+req.url+"\n");
//        request(phantomHost+req.url, function (error, response, body) {
//            if (!error && response.statusCode == 200) {
//                res.send(body);
//            }
//        });
    }
});

app.get('*', function(req, res){
    res.status('404').send("<h3>Invalid News</h3><p>We can't find news based on your search.</p>");
    return;
});


app.listen(3000);
