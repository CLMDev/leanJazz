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

var mbuildStream = require('../models/builstreammodel');

var validator = require('validator');
var validateBuildStream = function(doc, next) {
	console.log("validating Build Stream");
	console.log(doc);
    if (validator.isNull(doc.buildStream)) {
		next(new Error('Name of the topology can not be null'));
    }else if (!validator.isURL(doc.refURL)) {
		next(new Error('refURL must be a URL'));
    }else {
		console.log('validated json');
		next(null);
	}
};

exports.findAllView = function(req, res) {
   mbuildStream.find({}, function(err, buildstreams) {
   if (err) {
     console.log ( 'error get buildstreams');
     console.err(err);
     return;
   }   
   res.render('buildstreams/buildstreamindex', {
      title: 'Available build streams',
      docs: buildstreams
    });
  });
};

exports.findAll = function(req, res) {
   
   mbuildStream.find({},function(err, docs) {
		if (!docs) {
			res.send(404);
		}else {
			res.json(docs);
		}
	});

};

exports.addViewSetup = function(req, res) {
        res.render('topology/buildstreams/newbuildstream.jade', {
                title: 'Create new build stream'
        });
};

exports.addViewExecute = function(req, res) {
	validateBuildStream(req.body.topology, function(err) {
		if (! err) {
			var buildStream = new mbuildStream(req.body.topology);
			buildStream.save(function(err) {
				if (! err) {
					res.redirect('/buildstreams');
				}else {
					console.log('error saving build stream');
					console.log(err);
					res.redirect('/buildstreams/new');
				}
			});
		}else {
			console.log('error in addViewExecute validating build stream');
			console.log(err);
			res.redirect('/buildstreams');
		}
	});
};

exports.editViewSetup = function(req, res) {
  mbuildStream.findById(req.params.id, function(err, doc) {
    res.render('topology/buildstreams/editbuildstream', {
      title: 'Edit Build Stream',
      buildstream: doc
    });
  });
};
exports.editViewExecute = function(req, res) {
  mbuildStream.findById(req.params.id, function(err, doc) {
    
    
    doc.buildStream = req.body.buildstream.buildStream;
    doc.referenceURL = req.body.topology.referenceURL;
    doc.description = req.body.topology.description;
    
    console.log('attempting to update document');
    console.log(doc);
    validateBuildStream(doc, function(err) {
		if (!err) {
			doc.save(function(err) {
				if (!err) {
					res.redirect('/buildstreams');
				}
				else {
					console.log('error saving to database');
					res.redirect('/buildstreams');
				}
			});
		}else {
			console.log('invalid data:' + err);
			res.redirect('/buildstreams');
		}
    });
  });
};

exports.find = function(req, res) {
	console.log('build stream find: finding ' + req.params.id);
	mbuildStream.findById(req.params.id, function(err, doc) {
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


exports.delete = function(req, res) {
	mbuildStream.findById(req.params.id, function(err, doc) {
		if (!doc) {
			res.send(404);
		}else {
			doc.remove(function() {
			res.send(200);
			});
		}
	});
};

exports.update = function(req, res) {
  mbuildStream.findById(req.params.id, function(err, doc) {
	console.log('Updating document ' + req.params.id);
	updateDoc = req.body;
	console.log(updateDoc);
        if (err) {
		console.log('error finding build stream');
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
			validateBuildStream(doc, function(err) {
				if (!err) {
					doc.save();
					res.json(doc);
					console.log('saved doc');
					console.log(doc);
				}else {
					console.log('error caught validating build stream ' + err);
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

exports.create = function(req, res) {
	validateTopology(req.body, function(err) {
		if (! err) {
			try {
			var newBuildStream = new mbuildStream(req.body);
			newBuildStream.save(function(err) {
				if (!err) {
					res.send(newBuildStream);
				}else {
					res.send(err, 400);
				}
			});
			}catch (myerror) {
				console.log('could not save build stream, most likely due to invalid data');
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


