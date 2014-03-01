
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var config = require('./config.json');
var mongoose = require('mongoose');
var murl = 'mongodb://'+config.mongo.user+':'+config.mongo.pass+'@'+config.mongo.host;
if(process.env.MONGOHQ_URL) {
	murl = process.env.MONGOHQ_URL;
}


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon('./public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var connection = function() {
	options = { server: { socketOptions: { keepAlive: 1 } } }
	mongoose.connect(murl, options);
}

connection();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/buy/:prod/:charity', routes.buy);
app.get('/download/:txid', routes.download);
app.get('/order/:txid', routes.order);
app.get('/return/:txid/:secret', routes.ipn);
app.get('/ipn/:txid/:secret', routes.ipn)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
