const express = require('express');
const path = require('path');
const app = express();

app.use(function(req, res, next) {
  if (req.originalUrl === '/') {
      res.status('404').send("<h3>Invalid Asset</h3><p>We can't find the document asset.</p>");
    } else {
      //DO SOMETHING
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    }
});

app.use(express.static('public'))

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status('404').send("<h3>Invalid Asset</h3><p>We can't find the document asset.</p>");
});

app.listen(3010);
