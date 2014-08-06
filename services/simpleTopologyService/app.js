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
mongoose.connect('mongodb://localhost/leanJazz',
  function(err) {
    if (!err) {
      console.log('connected');
    }else {
      throw err;
    }
});

var 
    flash = require('connect-flash')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy;
  

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
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
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username. If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message. Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));




var routes = require('./routes');
var topology = require('./routes/topology');
var topologyPool = require('./routes/pool');
var topologyInstance = require('./routes/instance');
var buildstream = require('./routes/buildstream');
var build = require('./routes/build');

var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();
http.globalAgent.maxSockets = 100;

//var pool = require('./models/poolmodel');
//setup properties file
var fs = require('fs');
var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

console.log('printing out port ' + nconf.get('PORT'));
// all environments
app.set('port', nconf.get('PORT'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
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

var pooler = require('child_process').fork('basicpooler.js');//generate requests for adding instances for all noapp pools 
var monitor = require('child_process').fork('poolmonitor.js');//monitor pools and fork instance creators for pools
var apppooler = require('child_process').fork('app_basicpooler.js');//generate requests for adding instances for all app pools 
var appmonitor = require('child_process').fork('app_poolmonitor.js');//monitor pools and fork instance creators for pools
var housekeeper = require('child_process').fork('housekeeper.js');//for housekeeping, redis queque, etc.




app.get('/', routes.index);

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

// POST /login
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
//
// curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
  
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
} 

// setup routes for topologies web interface

app.get('/topology/topologies', topology.findAllView);
app.get('/topology/topologies/new', topology.addViewSetup);
app.post('/topology/topologies', topology.addViewExecute);
app.get('/topology/topologies/:id/edit', topology.editViewSetup);
app.put('/topology/topologies/:id', topology.editViewExecute);
app.del('/topology/topologies/:id', topology.deleteView);


app.get('/topology/pools', topologyPool.findAllView);
app.get('/topology/pools/new', topologyPool.addViewSetup);
app.post('/topology/pools', topologyPool.addViewExecute);
app.get('/topology/pools/:id/edit', topologyPool.editViewSetup);
app.put('/topology/pools/:id', topologyPool.editViewExecute);
app.del('/topology/pools/:id', topologyPool.deleteView);
app.get('/topology/pools/:id/instances', topologyInstance.findAllView);
app.del('/topology/pools/:pid/instances/:id', topologyInstance.deleteView);

//setup routes for the topologies API
app.get('/api/v1/topology/topologies', topology.findAll);
app.post('/api/v1/topology/topologies', topology.add);
app.get('/api/v1/topology/topologies/:id', topology.find);
app.del('/api/v1/topology/topologies/:id', topology.delete);
app.put('/api/v1/topology/topologies/:id', topology.update);

app.get('/api/v1/topology/pools', topologyPool.findAll);
app.post('/api/v1/topology/pools', topologyPool.create);
app.get('/api/v1/topology/pools/:id', topologyPool.find);
app.del('/api/v1/topology/pools/:id', topologyPool.delete);
//app.put('/api/v1/topology/pools/:id', topologyPool.update);

app.get('/api/v1/topology/pools/:id/instances', topologyInstance.findAll);
app.get('/api/v1/topology/pools/:pid/instances/:id', topologyInstance.find);
app.del('/api/v1/topology/pools/:pid/instances/:id', topologyInstance.delete);
app.put('/api/v1/topology/pools/:pid/instances/:id', topologyInstance.update);

app.get('/buildstreams', buildstream.findAllView);
app.get('/buildstreams/new', buildstream.addViewSetup);
app.post('/buildstreams', buildstream.addViewExecute);
app.get('/buildstreams/:id/edit', buildstream.editViewSetup);
app.put('/buildstreams/:id', buildstream.editViewExecute);

app.get('/api/v1/buildstreams', buildstream.findAll);
app.post('/api/v1/buildstreams', buildstream.create);
app.get('/api/v1/buildstreams/:id', buildstream.find);
app.del('/api/v1/buildstreams/:id', buildstream.delete);
app.put('/api/v1/buildstreams/:id', buildstream.update);

app.get('/builds', build.findAllView);
app.get('/builds/new', build.addViewSetup);
app.post('/builds', build.addViewExecute);
app.get('/builds/:id/edit', build.editViewSetup);
app.put('/builds/:id', build.editViewExecute);

app.get('/api/v1/builds', build.findAll);
app.post('/api/v1/builds', build.create);
app.get('/api/v1/builds/:id', build.find);
app.del('/api/v1/builds/:id', build.delete);
app.put('/api/v1/builds/:id', build.update);



http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});


