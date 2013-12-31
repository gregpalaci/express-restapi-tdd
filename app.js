
/**
 * Module dependencies.
 */
var subdomains = require('express-subdomains');
var express = require('express');
var mongoskin = require('mongoskin');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();
var db = mongoskin.db('localhost:27017/test', { safe: true });

// app.use(subdomains.middleware);

// subdomains
//   .use('api')
//   .use('other.vanity.domain');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.param('collectionName', function(req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});

app.get('/', function(req, res, next) {
  res.send('Please select a collection eg /collections/messages');
});

app.get('/collections/:collectionName', function(req, res) {
  req.collection.find({},{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});
 
app.post('/collections/:collectionName', function(req, res) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});
 
 
app.get('/collections/:collectionName/:id', function(req, res) {
  req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
    if (e) return next(e);
    res.send(result);
  });
});
app.put('/collections/:collectionName/:id', function(req, res) {
  req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    if (e) return next(e)
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  });
});
app.del('/collections/:collectionName/:id', function(req, res) {
  req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
    if (e) return next(e);
    res.send((result===1)?{msg:'success'}:{msg:'error'});
  });
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
