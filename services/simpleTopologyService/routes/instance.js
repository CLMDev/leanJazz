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

var topologyPoolModel = require('../models/poolmodel');
var Topology = require('../models/topologymodel');
var minstance= require('../models/instancemodel');



exports.findAllView = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   minstance.find({poolRef:req.params.id}, function(err, instances) {
   if (err) {
     console.log ( 'error get instances associated with pool');
     console.err(err);
     return;
   }   
   res.render('topology/instances/instanceindex', {
      title: 'Associated Instances',
      docs: instances
    });
  });
};

exports.findAll = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   minstance.find({poolRef:req.params.id}, function(err, instances) {
   if (err) {
     console.log ( 'error get instances associated with pool');
     console.err(err);
     res.send(404);
     return;
   }   
   res.send(instances);
  });
};

exports.find = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   minstance.findById(req.params.id, function(err, instance) {
   if (err) {
     console.log ( 'error get instance');
     console.err(err);
     res.send(404);
     return;
   }   
   res.send(instance);
  });
};



exports.deleteView = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   minstance.findById(req.params.id, function(err, instance) {
   if (err) {
     console.log ( 'error get instance to remove');
     console.err(err);
     return;
   }   
   res.render('topology/instances/instanceindex', {
      title: 'Associated Instances',
      docs: instances
    });
  });
};

