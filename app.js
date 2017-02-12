const express = require('express');
const path = require('path');
const app = express();

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
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('*', function(req, res){
    res.status('404').send("<h3>Invalid News</h3><p>We can't find news based on your search.</p>");
    return;
});

app.listen(3000);
