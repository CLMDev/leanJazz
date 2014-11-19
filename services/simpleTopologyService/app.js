/**
*  Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

/* jslint node: true */
'use strict';
var express = require('express');
var mongoose = require('mongoose');
var crypto=require('crypto')
var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

mongoose.connect(nconf.get('MONGO_URI'),
  function(err) {
    if (!err) {
      console.log('connected');
    }else {
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
var provider = require('./routes/provider');
var topology = require('./routes/topology');
var topologyPool = require('./routes/pool');
var topologyInstance = require('./routes/instance');
var buildstream = require('./routes/buildstream');
var build = require('./routes/build');

var user = require('./routes/user');
var https = require('https');
var path = require('path');
var app = express();
https.globalAgent.maxSockets = 100;

//var pool = require('./models/poolmodel');
//setup properties file
var fs = require('fs');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer(options);

console.log('PORT:'+ nconf.get('PORT'));
console.log('MONGO_URI:'+ nconf.get('MONGO_URI'));
console.log('STS_HOSTNAME:'+ nconf.get('STS_HOSTNAME'));
console.log('printing out port ' + nconf.get('PORT'));
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
app.use(express.bodyParser());
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

// var pooler = require('child_process').fork('basicpooler.js');//generate requests for adding instances for all noapp pools 
var monitor = require('child_process').fork('poolmonitor.js');//monitor pools and fork instance creators for pools
var apppooler = require('child_process').fork('app_basicpooler.js');//generate requests for adding instances for all app pools 
var appmonitor = require('child_process').fork('app_poolmonitor.js');//monitor pools and fork instance creators for pools
// var housekeeper = require('child_process').fork('housekeeper.js');//for housekeeping, redis queque, etc.

app.get('/', function(req, res){
  res.redirect('/login');
});

app.get('/login', function(req, res){
  res.render('topology/users/login', { user: req.user, message: req.flash('error') });
});

// POST /login
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
//
// curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    req.session.userid = req.body.username;
    console.log('login user:'+req.session.userid);
    if(!req.session.returnTo)
      res.redirect('/topology/topologies/');
    else
      res.redirect(req.session.returnTo);
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
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
  console.log('req.headers.host'+req.headers.host);
  if (req.isAuthenticated()) { return next(); }
  req.session.returnTo = req.path;
  res.redirect('/login');
} 

var api_password=user.createAPIUser();

appmonitor.send({password:api_password});
// setup routes for topologies web interface
app.get('/users', ensureAuthenticated, user.findAllView);
app.put('/users/:id', ensureAuthenticated, user.update);

app.get('/providers', ensureAuthenticated, provider.findAllView);
app.get('/providers/new', ensureAuthenticated, provider.addViewSetup);
app.post('/providers', ensureAuthenticated, provider.addViewExecute);
app.get('/providers/:id',ensureAuthenticated, provider.findAllView);
app.get('/providers/:id/edit', ensureAuthenticated, provider.editViewSetup);
app.put('/providers/:id', ensureAuthenticated, provider.editViewExecute);
app.del('/providers/:id', ensureAuthenticated, provider.deleteView);

app.get('/api/v1/providers', passport.authenticate('basic', { session: false }), provider.findAll);
app.get('/api4gui/v1/providers', ensureAuthenticated, provider.findAll);
app.post('/api/v1/providers',passport.authenticate('basic', { session: false }), provider.create);
app.get('/api4gui/v1/providers/:id', ensureAuthenticated, provider.find);
app.get('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), provider.find);
app.del('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), provider.delete);
app.put('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), provider.update);
app.del('/api/v1/providers/:id', passport.authenticate('basic', { session: false }), provider.delete);

app.get('/topology/topologies', ensureAuthenticated, topology.findAllView);
app.get('/topology/topologies/new', ensureAuthenticated,topology.addViewSetup);
app.post('/topology/topologies', ensureAuthenticated, topology.addViewExecute);
app.get('/topology/topologies/:id/edit',ensureAuthenticated, topology.editViewSetup);
app.put('/topology/topologies/:id', ensureAuthenticated,topology.editViewExecute);
app.del('/topology/topologies/:id', ensureAuthenticated,topology.deleteView);


app.get('/topology/pools', ensureAuthenticated, topologyPool.findAllView);
app.get('/topology/pools/new', ensureAuthenticated, topologyPool.addViewSetup);
app.post('/topology/pools', ensureAuthenticated, topologyPool.addViewExecute);
app.get('/topology/pools/:id/edit', ensureAuthenticated, topologyPool.editViewSetup);
app.put('/topology/pools/:id', ensureAuthenticated, topologyPool.editViewExecute);
app.del('/topology/pools/:id', ensureAuthenticated, topologyPool.deleteView);
app.get('/topology/pools/:id/instances', ensureAuthenticated,topologyInstance.findAllView);
app.del('/topology/pools/:pid/instances/:id', ensureAuthenticated, topologyInstance.deleteView);

//setup routes for the topologies API
app.get('/api/v1/topology/topologies', passport.authenticate('basic', { session: false }),topology.findAll);
app.post('/api/v1/topology/topologies', passport.authenticate('basic', { session: false }),topology.create);
app.get('/api/v1/topology/topologies/:id', passport.authenticate('basic', { session: false }),topology.find);
app.del('/api/v1/topology/topologies/:id', passport.authenticate('basic', { session: false }),topology.delete);
app.put('/api/v1/topology/topologies/:id', passport.authenticate('basic', { session: false }),topology.update);
app.get('/api4gui/v1/topology/topologies/:id', ensureAuthenticated,topology.find);

app.get('/api/v1/topology/pools', passport.authenticate('basic', { session: false }),topologyPool.findAll);
app.post('/api/v1/topology/pools', passport.authenticate('basic', { session: false }),topologyPool.create);
app.get('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }),topologyPool.find);
app.del('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }),topologyPool.delete);
//app.put('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }),topologyPool.update);
app.post('/api/v1/topology/pools/:id', passport.authenticate('basic', { session: false }),topologyPool.checkoutInstance);
app.get('/api4gui/v1/topology/pools/:id', ensureAuthenticated,topologyPool.find);

app.get('/api/v1/topology/pools/:id/instances', passport.authenticate('basic', { session: false }),topologyInstance.findAll);
app.get('/api/v1/topology/pools/:pid/instances/:id', passport.authenticate('basic', { session: false }),topologyInstance.find);
app.del('/api/v1/topology/pools/:pid/instances/:id', passport.authenticate('basic', { session: false }),topologyInstance.delete);
app.put('/api/v1/topology/pools/:pid/instances/:id', passport.authenticate('basic', { session: false }),topologyInstance.update);
app.get('/api4gui/v1/topology/pools/:pid/instances/:id', ensureAuthenticated,topologyInstance.find);
app.del('/api4gui/v1/topology/pools/:pid/instances/:id', ensureAuthenticated,topologyInstance.delete);
app.put('/api4gui/v1/topology/pools/:pid/instances/:id', ensureAuthenticated,topologyInstance.update);

app.get('/buildstreams',ensureAuthenticated, buildstream.findAllView);
app.get('/buildstreams/new',ensureAuthenticated, buildstream.addViewSetup);
app.post('/buildstreams', ensureAuthenticated,buildstream.addViewExecute);
app.get('/buildstreams/:id/edit', ensureAuthenticated,buildstream.editViewSetup);
app.put('/buildstreams/:id', ensureAuthenticated,buildstream.editViewExecute);

app.get('/api/v1/buildstreams', passport.authenticate('basic', { session: false }), buildstream.findAll);
app.post('/api/v1/buildstreams',passport.authenticate('basic', { session: false }), buildstream.create);
app.get('/api/v1/buildstreams/:id', passport.authenticate('basic', { session: false }), buildstream.find);
app.del('/api/v1/buildstreams/:id', passport.authenticate('basic', { session: false }), buildstream.delete);
app.put('/api/v1/buildstreams/:id', passport.authenticate('basic', { session: false }), buildstream.update);
app.get('/api4gui/v1/buildstreams', ensureAuthenticated, buildstream.findAll);
app.del('/api4gui/v1/buildstreams/:id', ensureAuthenticated , buildstream.delete);

app.get('/builds', ensureAuthenticated,build.findAllView);
app.get('/builds/new', ensureAuthenticated,build.addViewSetup);
app.post('/builds', ensureAuthenticated,build.addViewExecute);
app.get('/builds/:id/edit', ensureAuthenticated,build.editViewSetup);
app.put('/builds/:id', ensureAuthenticated,build.editViewExecute);

app.get('/api/v1/builds', passport.authenticate('basic', { session: false }),build.findAll);
app.post('/api/v1/builds', passport.authenticate('basic', { session: false }),build.create);
app.get('/api/v1/builds/:id', passport.authenticate('basic', { session: false }),build.find);
app.del('/api/v1/builds/:id', passport.authenticate('basic', { session: false }),build.delete);
app.put('/api/v1/builds/:id', passport.authenticate('basic', { session: false }),build.update);
app.get('/api4gui/v1/builds/:id', ensureAuthenticated, build.find);
app.del('/api4gui/v1/builds/:id', ensureAuthenticated, build.delete);
app.put('/api4gui/v1/builds/:id', ensureAuthenticated, build.update);

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
});


