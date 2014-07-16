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
  topologyPoolModel.find({},function(err, docs) {
    if (!docs) {
      console.log('no pools found');
      docs = [];
    }
    res.render('topology/pools/poolindex', {
      title: 'Available Pools',
      docs: docs
    });
  }).populate('topologyRef', 'name');
};

exports.addViewSetup = function(req, res) {
  Topology.find({},function(err, topdocs) {
    if (!topdocs) {
      console.log('no topology found');
      topdocs = [];
    }
    
    res.render('topology/pools/newpool.jade', {
                title: 'Create new pool', 
                topdocs: topdocs
    });
  });
};

var validator = require('validator');
var validatePool = function(doc, next) {
	console.log("validating Pool document");
	console.log(doc);
    if (validator.isNull(doc.name)) {
		next(new Error('Name of the pool can not be null'));
    } else {
		console.log('validated json');
		next(null);
	}
};


exports.addViewExecute = function(req, res) {
	validatePool(req.body.pool, function(err) {
		if (! err) {
			var pool = new topologyPoolModel(req.body.pool);
			pool.save(function(err) {
				if (! err) {
					res.redirect('/topology/pools');
				}else {
					console.log('error saving pool');
					console.log(err);
					res.redirect('/topology/pools/new');
				}
			});
		}else {
			console.log('error in addViewExecute validating pool');
			console.log(err);
			res.redirect('/topology/pools');
		}
	});
};

exports.findAll = function(req, res) {
	topologyPoolModel.find({},function(err, docs) {
		if (!docs) {
			console.log('findAll could not find any documents');
			console.log('printing our err');
			console.log(err);
			res.send(404);
		}else {
			res.send(docs);
		}
	});
};

exports.editViewSetup = function(req, res) {
  topologyPoolModel.findById(req.params.id, function(err, doc) {
    res.render('topology/pools/editpool', {
      title: 'Edit Pool',
      pool: doc
    });
  }).populate('topologyRef', 'name');;
};
exports.editViewExecute = function(req, res) {
   topologyPoolModel.findById(req.params.id, function(err, doc) {
    
    doc.name = req.body.pool.name;
    doc.description = req.body.pool.description;
    doc.poolMethod = req.body.pool.poolMethod;
    doc.poolMinAvailable = req.body.pool.poolMinAvailable;
    doc.poolMaxTotal = req.body.pool.poolMaxTotal;
    console.log('attempting to update document');
    console.log(doc);
    validatePool(doc, function(err) {
		if (!err) {
			doc.save(function(err) {
				if (!err) {
					res.redirect('/topology/pools');
				}
				else {
					console.log('error saving to database');
					res.redirect('/topology/pools');
				}
			});
		}else {
			console.log('invalid data:' + err);
			res.redirect('/topology/pools');
		}
    });
  });
};



exports.create = function(req, res) {
	try {
		console.log('::::creating new topology pool');
		console.log(req.body);
		//var inputOBJ=JSON.parse(req.body);
		console.log('::::input reference id:'+req.body.topologyRef);
		Topology.count({_id:req.body.topologyRef}, function(err, count) {
		console.log('::::count of topology document:'+count);
		if (count==1) {

		  topologyPoolModel.create(req.body, function(err, pool){ 
			if (! err){
				//return the created topology pool information
				console.log('created new topology pool');
				console.log(pool);
				res.json(pool);
			}else{
				//return an error 
				console.log('failed to create pool using:' + res.json);
				console.log(pool);
				console.log(err);
				res.send(err, 400);
			}
		  }); //topologyPoolModel
		}//if()
		else{
				//return an error 
				console.log('failed to create pool using:' + res.json);
				console.log('topologyRef can not be found!');
				
				res.send(err, 400);
		}
		});//Topology.find
	}catch (err) {
		console.log('could not create new topology pool, most likely due to invalid data');
		console.log(err);
		res.send(err, 400);
	}
};
exports.find = function(req, res) {
	console.log('finding ' + req.params.id);
	topologyPoolModel.findById(req.params.id, function(err, doc) {
		if (! doc) {
			res.send(404);
		}else {
			res.send(doc);
		}
	});
};
exports.deleteView = function(req, res) {
	topologyPoolModel.findById(req.params.id, function(err, doc) {
		if (!doc) {
			console.log('could not remove document using ID ' + req.params.id);
			res.redirect('/topology/pools');
		}else {
			doc.remove(function() {
				res.redirect('/topology/pools/');
			});
		}
	});
};

exports.find = function(req, res) {
	console.log('finding ' + req.params.id);
	topologyPoolModel.findById(req.params.id, function(err, doc) {
		if (! doc) {
			res.send(404);
		}else {
			res.send(doc);
		}
	});
};
exports.delete = function(req, res) {
	topologyPoolModel.findById(req.params.id, function(err, doc) {
		if (!doc) {
			res.send(404);
		}else {
			console.log('delete removing');
			doc.remove(function() {
			res.send(200);
		});
		console.log('removed');
		}
	});
};
