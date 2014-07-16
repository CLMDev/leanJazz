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
var topologyInstance = require('./routes/instance');
var buildstream = require('./routes/buildstream');
//var build = require('./routes/build');

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
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var pooler = require('child_process').fork('basicpooler.js');//generate requests for adding instances for all noapp pools 
var monitor = require('child_process').fork('poolmonitor.js');//monitor pools and fork instance creators for pools




app.get('/', routes.index);


// setup routes for topologies web interface
app.get('/', routes.index);
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
/*
app.get('/builds', build.findAllView);
app.get('/builds/new', build.addViewSetup);
app.post('/builds', build.addViewExecute);
app.get('/builds/:id/edit', build.editViewSetup);
app.put('/builds/:id', build.editViewExecute);

*/
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});


