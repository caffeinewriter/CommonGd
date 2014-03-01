var mongoose = require('mongoose');
var QRCode = require('qrcode-npm');
var Order = require('../order-model.js');
var config = require('../config.json');
var request = require('request');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var COIN = 100000000;
var murl = 'mongodb://'+config.mongo.user+':'+config.mongo.pass+'@'+config.mongo.host;
if(process.env.MONGOHQ_URL) {
	murl = process.env.MONGOHQ_URL;
}

exports.index = function(req, res){
	res.render('index', { 
		title: 'CommonGood | Common.gd', 
		products: config.products,
		charities: config.charities.all,
		charity: config.charities
	});
};

exports.about = function(req, res){
	res.render('about');
}

exports.charities = function(req,res){
	res.render('charities', {
		charities: config.charities.all,
		charity: config.charities
	});
}

exports.buy = function(req, res){
	var D = new Date();
	var secret = crypto.createHash('sha256').update(Math.random()+D+'').digest('hex');
	var secret = secret.substr(0,16);
	var txid = crypto.createHash('sha256').update(Math.random()+secret+'').digest('hex');
	var txid = txid.substr(0,16);
	var pid = req.params.prod;
	var charity = req.params.charity;
	if (charity === "random") {
		charity = config.charities.all[Math.floor(Math.random()*config.charities.all.length)];
	}
	var btcaddr = config.charities[charity].addr;
	var baseurl = 'https://blockchain.info/api/receive?method=create&address=';
	var baseurl = baseurl + btcaddr + '&callback=';
	var baseurl = baseurl + encodeURIComponent(config.url + '/ipn/' + txid + '/' + secret);
	console.error(baseurl)
	config.pid = pid;
	config.secret = secret;
	config.txid = txid;
	request.get({
		uri: baseurl
	}, function(err,body,resp,secret,txid,pid){
		if (err) { return console.error(err) }
		var obj = JSON.parse(resp);
		var order = new Order();
		order.toaddr = obj.input_address;
		order.prod = config.pid;
		order.secret = config.secret;
		order.txid = config.txid;
		order.price = config.products[config.pid].price;
		order.stat = 0;
		order.save(function(err) {
			if (err){
				return console.error(err);
			}
			res.redirect('/order/'+config.txid);
		});
	});
}

exports.order = function(req, res){
	Order.findOne({ txid: req.params.txid }, function(err, ord) {
		if(err) { 
			return console.error(err); 
		}
		console.error(ord)
		var prod = ord.prod;
		console.error(prod);
		console.error(ord.prod);
		var qr = QRCode.qrcode(6,'H');
		qr.addData('bitcoin:'+ord.toaddr+'?amount='+ord.price);
		qr.make();
		res.render('order', { 
			toaddr: ord.toaddr, 
			name: config.products[prod].name,
			price: ord.price,
			stat: ord.stat,
			txid: ord.txid,
			title: 'Order ' + ord.txid + ' | Common.gd',
			qrcodeurl: qr.createImgTag(4)
		});
	});
}

exports.ipn = function(req, res){
	var order = req.params.txid;
	var secret = req.params.secret;
	var value = req.query.value/COIN;
	var test = req.query.test;
	var incomingtx = req.query.input_transaction_hash;
	var outgoingtx = req.query.transaction_hash;

	if (test) {
		res.send('*ok*');
	}
	else {
		Order.findOne({ txid: order }, function(err,ord){
			if(err){
				console.error(err);
				res.send('*error*');
				return;
			}
			else if(secret !== ord.secret){
				res.send('*error*');
				return;
			}
			else if(ord.price > value) {
				res.send('*error*');
				return;
			}
			else {
				Order.update({
					txid: ord.txid
				}, {
					inputtx: incomingtx,
					txhash: outgoingtx,
					stat: 1
				},function(err) {
					if(err) {
						res.send('*error*');
						return;
					}
					res.send('*ok*');
				});
			}
		});
	}
	}

exports.download = function(req, res) {
	var order = req.params.txid;
	Order.findOne({ txid: order }, function(err, ord){
		if (err) { 
			res.send('Couldn\'t find that order!');
			res.end();
		}
		else if (ord.stat === 2 || ord.stat === 0) {
			res.send('Order has already been downloaded, or hasn\'t been paid!');
			res.end();
		}
		else {
			var num = ord.prod;
			var pname = config.products[num].name;
			var pfile = config.products[num].file;
			var filePath = pfile;
			request.get({
				uri: filePath,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0'
				}
			}).pipe(res);
			Order.update({ txid: order }, {
				stat: 2
			}, function(err) {
					if(err) { 
						res.send('Oops! Something wen\'t wrong!'); 
					}
				});
			}
		}
	);
}