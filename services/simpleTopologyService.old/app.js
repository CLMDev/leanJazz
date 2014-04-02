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

var routes = require('./routes');
var topology = require('./routes/topology');
var topologyPool = require('./routes/pool');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var app = express();

var pool = require('./models/pool');
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
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);


// setup routes for topologies web interface
app.get('/', routes.index);
app.get('/topology/topologies', topology.findAllView);
app.get('/topology/topologies/new', topology.addViewSetup);
app.post('/topology/topologies', topology.addViewExecute);
app.get('/topology/topologies/:id/edit', topology.editViewSetup);
app.put('/topology/topologies/:id', topology.editViewExecute);
app.del('/topology/topologies/:id', topology.deleteView);

//setup routes for the topologies API
app.get('/api/v1/topology/topologies', topology.findAll);
app.post('/api/v1/topology/topologies', topology.add);
app.get('/api/v1/topology/topologies/:id', topology.find);
app.del('/api/v1/topology/topologies/:id', topology.delete);
app.put('/api/v1/topology/topologies/:id', topology.update);

app.get('/api/v1/topology/pools', topologyPool.findAll);
app.get('/api/v1/topology/pools/:id', topologyPool.find);
app.post('/api/v1/topology/pools', topologyPool.create);
app.del('/api/v1/topology/pools/:id', topologyPool.delete);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
