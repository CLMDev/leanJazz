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

var mongoose = require('mongoose');
var nconf = require('nconf');

nconf.argv()
        .env()
        .file({ file: './config.json'});

var Topology = require ('../models/topologymodel');


// setup routes for topologies and apis
exports.findAllView = function(req, res) {
  Topology.find({},function(err, docs) {
    if (!docs) {
      console.log('no topologies found');
      docs = [];
    }
    res.render('topology/topologies/topologyindex', {
      title: 'Available Topologies',
      docs: docs
    });
  });
};
exports.findAll = function(req, res) {
	Topology.find({},function(err, docs) {
		if (!docs) {
			res.send(404);
		}else {
			res.json(docs);
		}
	});
};
exports.addViewSetup = function(req, res) {
        res.render('topology/topologies/newtopology.jade', {
                title: 'Create new topology'
        });
};
var validator = require('validator');

var validateTopology = function(doc, next) {
	console.log("validating Topology document");
	console.log(doc);
    if (validator.isNull(doc.name)) {
		next(new Error('Name of the topology can not be null'));
    }else if (!validator.isURL(doc.referenceURL)) {
		next(new Error('referenceURL must be a URL'));
    }else {
		console.log('validated json');
		next(null);
	}
};

exports.addViewExecute = function(req, res) {
	validateTopology(req.body.topology, function(err) {
		if (! err) {
			var topology = new Topology(req.body.topology);
			topology.save(function(err) {
				if (! err) {
					res.redirect('/topology/topologies');
				}else {
					console.log('error saving topology');
					console.log(err);
					res.redirect('/topology/topologies/new');
				}
			});
		}else {
			console.log('error in addViewExecute validating topology');
			console.log(err);
			res.redirect('/topology/topologies');
		}
	});
};
exports.add = function(req, res) {
	validateTopology(req.body, function(err) {
		if (! err) {
			try {
			var newTopology = new Topology(req.body);
			newTopology.save(function(err) {
				if (!err) {
					res.send(newTopology);
				}else {
					res.send(err, 400);
				}
			});
			}catch (myerror) {
				console.log('could not save topology, most likely due to invalid data');
				console.log(myerror);
				res.send(myerror, 400);
			}
		}else {
			console.log('invalid input: ' + err);
			console.log(req.body);
			res.send(err, 400);
		}
	});
};
exports.editViewSetup = function(req, res) {
  Topology.findById(req.params.id, function(err, doc) {
    res.render('topology/topologies/edittopology', {
      title: 'Edit Topology',
      topology: doc
    });
  }).populate('providerRef');;
};
exports.editViewExecute = function(req, res) {
  Topology.findById(req.params.id, function(err, doc) {
    
    doc.updated_at = new Date();
    doc.name = req.body.topology.name;
    doc.referenceURL = req.body.topology.referenceURL;
    doc.description = req.body.topology.description;
    doc.topologyDocument=req.body.topology.topologyDocument;
    doc.appProcessTemplate=req.body.topology.appProcessTemplate;
    console.log('attempting to update document');
    console.log(doc);
    validateTopology(doc, function(err) {
		if (!err) {
			doc.save(function(err) {
				if (!err) {
					res.redirect('/topology/topologies');
				}
				else {
					console.log('error saving to database');
					res.redirect('/topology/topologies');
				}
			});
		}else {
			console.log('invalid data:' + err);
			res.redirect('/topology/topologies');
		}
    });
  });
};
exports.update = function(req, res) {
  Topology.findById(req.params.id, function(err, doc) {
	console.log('Updating document ' + req.params.id);
	updateDoc = req.body;
	console.log(updateDoc);
        if (err) {
		console.log('error finding topology');
		res.send(err, 400);
	}else if (! doc) {
		console.log('could not find document');
		res.send(400);
	}else {
		try {
			console.log('found document, attempting to update');
			for (var param in updateDoc) {
				console.log('updating ' + param + ' with ' + updateDoc[param]);
				doc[param] = updateDoc[param];
			}
			validateTopology(doc, function(err) {
				if (!err) {
					doc.save();
					res.json(doc);
					console.log('saved doc');
					console.log(doc);
				}else {
					console.log('error caught validating topology ' + err);
					res.send(err, 400);
				}
			});
		}catch (myerror) {
			console.log('error caught ' + myerror);
			res.send(myerror, 400);
		}
	}
    });
};


exports.find = function(req, res) {
	console.log('topology.find: finding ' + req.params.id);
	Topology.findById(req.params.id, function(err, doc) {
		console.log('printing doc');
		console.log(doc);
		console.log('printing error');
		console.log(err);
		if (! doc) {
			res.send(404);
		}else {
			res.send(doc);
		}
	});
};
exports.deleteView = function(req, res) {
	Topology.findById(req.params.id, function(err, doc) {
		if (!doc) {
			console.log('could not remove document using ID ' + req.params.id);
			res.redirect('/topology/topologies');
		}else {
			doc.remove(function() {
				res.redirect('/topology/topologies/');
			});
		}
	});
};
exports.delete = function(req, res) {
	Topology.findById(req.params.id, function(err, doc) {
		if (!doc) {
			res.send(404);
		}else {
			doc.remove(function() {
			res.send(200);
			});
		}
	});
};
