/**
*	Copyright 2014 IBM
*
*	 Licensed under the Apache License, Version 2.0 (the "License");
*	 you may not use this file except in compliance with the License.
*	 You may obtain a copy of the License at
*
*		 http://www.apache.org/licenses/LICENSE-2.0
*
*	 Unless required by applicable law or agreed to in writing, software
*	 distributed under the License is distributed on an "AS IS" BASIS,
*	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*	 See the License for the specific language governing permissions and
*	 limitations under the License.
*/

/* jslint node: true */
'use strict';
var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

mongoose.connect(nconf.get('MONGO_URI'),
	function(err) {
		if (!err) {
			console.log('connected');
		} else {
			throw err;
		}
});

var User = require ('./models/usermodel');
var 
	flash = require('connect-flash')
	, passport = require('passport')
	, util = require('util')
	, LocalStrategy = require('passport-local').Strategy
	, BasicStrategy = require('passport-http').BasicStrategy;

function findById(id, fn) {
	User.find({_id:id}, function(err,docs){
		if(docs.length)
			fn(null,docs[0]);
		else
			fn(null,null);
	});
}


function findByMail(usermail, fn) {
	User.find({mail:usermail}, function(err,docs){
		if(docs.length)
			fn(null,docs[0]);
		else
			fn(null,null);
	});
}

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	findById(id, function (err, user) {
		done(err, user);
	});
});


// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object. In the real world, this would query a database;
// however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log('In LocalStrategy callback:');
		console.log('username:'+username);
		// asynchronous verification, for effect...
		process.nextTick(function () {
			// Find the user by username. If there is no user with the given
			// username, or the password is not correct, set the user to `false` to
			// indicate failure and set a flash message. Otherwise, return the
			// authenticated `user`.
			findByMail(username, function(err, user) {
				if (err) { return done(err); }
				if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
				console.log('User found!');
				if (!user.isRegistered) {console.log('not activiated.'); return done(null, false, { message: 'Not activiated: ' + username }); }
				if (!user.isActive) { console.log('disabled');return done(null, false, { message: 'Disabled: ' + username }); }
				var sha = crypto.createHash('sha1');
				sha.update(password+user._salt);
				if (user.passwordHash!= sha.digest('hex')) {console.log('invalid password'); return done(null, false, { message: 'Invalid password' }); }
				console.log('valid password!');
				return done(null, user);
			})
		});
	}
));

passport.use(new BasicStrategy(
	function(username, password, done) {
		User.findOne({ mail: username }, function (err, user) {
			console.log('user found: '+ user.mail);
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			if (!user.isRegistered) {console.log('not activiated.'); return done(null, false, { message: 'Not activiated: ' + username }); }
			if (!user.isActive) { console.log('disabled');return done(null, false); }
			var sha = crypto.createHash('sha1');
			sha.update(password+user._salt);
			if (user.passwordHash!= sha.digest('hex')) {console.log('invalid password'); return done(null, false); }
			console.log('valid password!');
			return done(null, user); 
		});
	}
));

var routes = require('./routes');
var providerService = require('./routes/provider');
var poolService = require('./routes/pool');
var user = require('./routes/user');
var https = require('https');
https.globalAgent.maxSockets = 100;
var path = require('path');
var app = express();

//var pool = require('./models/poolmodel');
//setup properties file

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer(options);

console.log('STS_SERVER: '+ nconf.get('STS_HOSTNAME') + ':' + nconf.get('PORT'));
console.log('MONGO_URI: '+ nconf.get('MONGO_URI'));
// all environments
app.set('port', nconf.get('PORT'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(nconf.get('UCD_ADAPTER_PATH'),function(req, res){
	proxy.web(req, res, { target: nconf.get('UCD_ADAPTER_TARGET') });
});
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', function(req, res){
	if (req.isAuthenticated()) {
		return res.redirect('/pools');
	}
	req.session.returnTo = '/pools';
	res.redirect('/login');
});

app.get('/login', function(req, res){
	res.render('users/login', { user: req.user, message: req.flash('error') });
});
app.post('/login', 
	passport.authenticate('local', { failureRedirect: '/login' }),
	function(req, res) {
		req.session.userid = req.body.username;
		console.log('login user:'+req.session.userid);
		if(!req.session.returnTo)
			res.redirect('/pools');
		else
			res.redirect(req.session.returnTo);
	}
);
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.get('/api/v1/login', function(req, res){
	res.send(200);
});
app.post('/api/v1/login', 
	passport.authenticate('local', { failureRedirect: '/api/v1/login' }),
	function(req, res) {
		req.session.userid = req.body.username;
		console.log('login user:'+req.session.userid);
		res.send(200);
});
app.get('/signup', user.signup);
app.post('/signup', user.createAccount);
app.get('/activate/:id', user.activate);
app.get('/reset', user.reset);
app.post('/reset', user.resetMail);
app.get('/reset/:id', user.resetStep2);
app.post('/reset/:id', user.resetStep3);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.returnTo = req.path;
	res.redirect('/login');
} 
function ensureAPIAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.send(401);
} 

//var api_password=user.createAPIUser();
//apppooler.send({password:api_password});
// setup routes for topologies web interface
app.get('/users', ensureAuthenticated, user.findAllView);
app.put('/users/:id', ensureAuthenticated, user.update);

app.get('/pools', ensureAuthenticated, poolService.findAllView);
app.get('/pools/:id', ensureAuthenticated, poolService.detailsView);
app.get('/settings/providers', ensureAuthenticated, providerService.findAllView);

app.get('/api/v1/providers', passport.authenticate('basic', { session: false }), providerService.findAll);
app.get('/api4gui/v1/providers', ensureAPIAuthenticated, providerService.findAll);
app.post('/api/v1/providers',passport.authenticate('basic', { session: false }), providerService.create);
app.post('/api4gui/v1/providers', ensureAPIAuthenticated, providerService.create);
app.get('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), providerService.find);
app.get('/api4gui/v1/providers/:id', ensureAPIAuthenticated, providerService.find);
app.put('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), providerService.update);
app.put('/api4gui/v1/providers/:id', ensureAPIAuthenticated, providerService.update);
app.del('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), providerService.remove);
app.del('/api4gui/v1/providers/:id', ensureAPIAuthenticated, providerService.remove);

app.get('/api/v1/topology/pools', passport.authenticate('basic', { session: false }), poolService.findAll);
app.get('/api4gui/v1/topology/pools', ensureAPIAuthenticated, poolService.findAll);
app.post('/api/v1/topology/pools', passport.authenticate('basic', { session: false }), poolService.create);
app.post('/api4gui/v1/topology/pools', ensureAPIAuthenticated, poolService.create);
app.get('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }), poolService.find);
app.get('/api4gui/v1/topology/pools/:id', ensureAPIAuthenticated, poolService.find);
app.put('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }), poolService.update);
app.put('/api4gui/v1/topology/pools/:id', ensureAPIAuthenticated, poolService.update);
app.del('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }), poolService.remove);
app.del('/api4gui/v1/topology/pools/:id', ensureAPIAuthenticated, poolService.remove);

app.get('/api/v1/topology/pools/:id/instances', passport.authenticate('basic', { session: false }), poolService.listAllInstances);
app.get('/api4gui/v1/topology/pools/:id/instances', ensureAPIAuthenticated, poolService.listAllInstances);
app.get('/api/v1/topology/pools/:pid/instances/:id', passport.authenticate('basic', { session: false }), poolService.getInstanceById);
app.get('/api4gui/v1/topology/pools/:pid/instances/:id', ensureAPIAuthenticated, poolService.getInstanceById);

var monitorLib = require('./poolmonitor_lib');

function checkoutInstance(req, res) {
	var user = req.user.mail;
	var poolId = req.params.id;
	var action = req.body;
	if (action.type == 'checkout') {
		var comment = action.comment;
		monitorLib.checkoutInstance(poolId, user, comment, function(err, instance) {
			if (err) {
				console.log('Error when checkout instance: ' + err);
				return res.send(500, err);
			}
			if (!instance) {
				res.send(404);
			}
			return res.json(instance);

		});
//	} else if (action.type == 'release') {
	} else {
		res.send('Unsupported action: ' + action.type, 400);
	}
}
app.post('/api/v1/topology/pools/:id/actions', passport.authenticate('basic', { session: false }), checkoutInstance);
app.post('/api4gui/v1/topology/pools/:id/actions', ensureAPIAuthenticated, checkoutInstance);

function deleteInstance(req, res) {
	var instanceId = req.params.id;
	monitorLib.deleteInstance(instanceId, function(err, instance) {
		if (err) {
			console.log('Error when deleting instance: ' + err);
			return res.send(500, err);
		}
		if (!instance) {
			return res.send(404);
		}
		return res.json(instance);
	});
}
app.del('/api/v1/topology/pools/:pid/instances/:id', passport.authenticate('basic', { session: false }), deleteInstance);
app.del('/api4gui/v1/topology/pools/:pid/instances/:id', ensureAPIAuthenticated, deleteInstance);

var fs = require('fs');
var options = {
	key: fs.readFileSync(nconf.get('SSL_KEY_FILE')),
	cert: fs.readFileSync(nconf.get('SSL_CERT_FILE'))
};
var passphrase = nconf.get('SSL_PASSPHRASE');
if (passphrase) {
	options.passphrase = passphrase;
}

https.createServer(options, app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
	require('child_process').fork('./poolmonitor.js');
});

