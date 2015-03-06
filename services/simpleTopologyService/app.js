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

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

var logger = require("./utils/logger");
var log = logger.getLogger("app");

mongoose.connect(nconf.get('MONGO_URI'),
	function(err) {
		if (err) {
			log.error("Failed to connect to database " + nconf.get('MONGO_URI'));
			throw err;
		}
	}
);

var routes = require('./routes');
var providerService = require('./routes/provider');
var poolService = require('./routes/pool');
var user = require('./routes/user');
var path = require('path');
var app = express();
app.use(require('morgan')("combined", { "stream": logger.stream }));

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer(options);
app.use(nconf.get('UCD_ADAPTER_PATH'), function(req, res) {
	proxy.web(req, res, { target: nconf.get('UCD_ADAPTER_TARGET') });
});

app.set('port', nconf.get('PORT'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var User = require ('./models/usermodel');
var 
	flash = require('connect-flash'),
	passport = require('passport'),
	crypto = require('crypto'),
	util = require('util'),
	LocalStrategy = require('passport-local').Strategy,
	BasicStrategy = require('passport-http').BasicStrategy;

passport.serializeUser(function(user, done) {
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	User.findOne({ _id: id }, function (err, user) {
		done(err, user);
	});
});

function login(username, password, callback) {
	User.findOne({ mail: username }, function(err, user) {
		if (err) {
			return callback(err);
		}
		if (!user) {
			var message = 'Unknown user: ' + username;
			log.warn(message);
			return callback(null, false, {
				message : message
			});
		}
		if (!user.isRegistered) {
			var message = 'User not activiated: ' + username;
			log.warn(message);
			return callback(null, false, {
				message : message
			});
		}
		if (!user.isActive) {
			var message = 'User disabled: ' + username;
			log.warn(message);
			return callback(null, false, {
				message : message
			});
		}
		var sha = crypto.createHash('sha1');
		sha.update(password + user._salt);
		if (user.passwordHash != sha.digest('hex')) {
			var message = 'User ' + username + "";
			log.warn(message);
			return callback(null, false, {
				message : message
			});
		}
		return callback(null, user);
	})
}

passport.use(new LocalStrategy(
	function(username, password, done) {
		// asynchronous verification, for effect...
		process.nextTick(function () {
			login(username, password, done);
		});
	}
));
passport.use(new BasicStrategy(login));

app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

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
		log.info('login user:'+req.session.userid);
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
				return res.send(500, err);
			}
			if (!instance) {
				return res.send(404);
			}
			return res.json(instance);

		});
//	} else if (action.type == 'release') {
	} else {
		return res.send('Unsupported action: ' + action.type, 400);
	}
}
app.post('/api/v1/topology/pools/:id/actions', passport.authenticate('basic', { session: false }), checkoutInstance);
app.post('/api4gui/v1/topology/pools/:id/actions', ensureAPIAuthenticated, checkoutInstance);

function checkoutInstanceV1(req, res) {
	var user = req.user.mail;
	var poolId = req.params.id;
	var comment = req.body.checkoutComment;
	monitorLib.checkoutInstance(poolId, user, comment, function(err, instance) {
			if (err) {
				return res.send(500, err);
			}
			if (!instance) {
				return res.send(404);
			}
			return res.json(instance);

	});
}

app.post('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }), checkoutInstanceV1);

function deleteInstance(req, res) {
	var instanceId = req.params.id;
	monitorLib.deleteInstance(instanceId, function(err, instance) {
		if (err) {
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

var https = require('https');
https.globalAgent.maxSockets = 100;
https.createServer(options, app).listen(app.get('port'), function() {
	log.info('STS_SERVER: '+ nconf.get('STS_HOSTNAME') + ':' + nconf.get('PORT'));
	require('child_process').fork('./poolmonitor.js');
});

