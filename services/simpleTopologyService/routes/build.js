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

var mbuild = require('../models/buildmodel');
var mbuildStream = require('../models/buildstreammodel');

var validator = require('validator');
var validateBuild = function(doc, next) {
	console.log("validating Build");
	console.log(doc);
	if (validator.isNull(doc.BUILDID)) {
	    next(new Error('BUILDID can not be null'));
	}
    else if (validator.isNull(doc.buildStream)) {
		next(new Error('buildStream can not be null'));
    }else if (!validator.isURL(doc.refURL)) {
		next(new Error('refURL must be a URL'));
    }else {
		console.log('validated json');
		next(null);
	}
};

exports.findAllView = function(req, res) {
   mbuild.find({}, function(err, builds) {
   if (err) {
     console.log ( 'error get builds');
     console.err(err);
     return;
   }   
   res.render('topology/builds/buildindex', {
      title: 'Available builds',
      docs: builds
    });
  });
};

exports.findAll = function(req, res) {
   
   mbuild.find({},function(err, docs) {
		if (!docs) {
			res.send(404);
		}else {
			res.json(docs);
		}
	});

};

exports.addViewSetup = function(req, res) {
        mbuildStream.find({}, function(err, docs) {
         
        res.render('topology/builds/newbuild.jade', {
                title: 'Create new build',
                buildstreams: docs
        });
        });
};

exports.addViewExecute = function(req, res) {
	validateBuild(req.body.build, function(err) {
		if (! err) {
			var build = new mbuild(req.body.build);
			build.save(function(err) {
				if (! err) {
					res.redirect('/builds');
				}else {
					console.log('error saving build');
					console.log(err);
					res.redirect('/builds/new');
				}
			});
		}else {
			console.log('error in addViewExecute validating build');
			console.log(err);
			res.redirect('/builds');
		}
	});
};

exports.editViewSetup = function(req, res) {
  mbuild.find({buildStream:req.params.id}, function(err, doc) {
    res.render('topology/builds/editbuild', {
      title: 'Edit Build',
      build: doc
    });
  });
};
exports.editViewExecute = function(req, res) {
  mbuild.find({BUILDID:req.params.id}, function(err, docs) {
    if(docs.length!=1){
      console.log(' error: can not find the build') 
      res.redirect('/builds');
      return;
    }
    doc =docs[0];
    
    doc.BUILDID = req.body.build.BUILDID;
    doc.buildStream = req.body.build.buildStream;
    doc.refURL = req.body.build.refURL;
    doc.description = req.body.build.description;
    
    console.log('attempting to update document');
    console.log(doc);
    validateBuild(doc, function(err) {
		if (!err) {
			doc.save(function(err) {
				if (!err) {
					res.redirect('/builds');
				}
				else {
					console.log('error saving to database');
					res.redirect('/builds');
				}
			});
		}else {
			console.log('invalid data:' + err);
			res.redirect('/builds');
		}
    });
  });
};

exports.find = function(req, res) {
	console.log('build find: finding ' + req.params.id);
	mbuild.find({BUILDID:req.params.id}, function(err, docs) {
		console.log('printing docs');
		console.log(docs);

		if (docs.length==0) {
			res.send(404);
		}else {
		        console.log('print build object found:');
		        console.log(docs[0]);
			res.send(docs[0]);
		}
	});
};


exports.delete = function(req, res) {
	mbuild.find({BUILDID:req.params.id}, function(err, docs) {
		if (docs.length==0) {
			res.send(404);
		}else {
			docs[0].remove(function() {
			res.send(200);
			});
		}
	});
};

exports.update = function(req, res) {
	console.log('Updating document ' + req.params.id);
	mbuild.find({BUILDID:req.params.id}, function(err, docs) {
	updateDoc = req.body;
	console.log(updateDoc);
        if (err) {
		console.log('error finding build stream');
		res.send(err, 400);
	}else if ( docs.length==0) {
		console.log('could not find document');
		res.send(400);
	}else {
		try {
			console.log('found document, attempting to update');
                        doc=docs[0];
			for (var param in updateDoc) {
				console.log('updating ' + param + ' with ' + updateDoc[param]);
				doc[param] = updateDoc[param];
			}
			validateBuild(doc, function(err) {
				if (!err) {
					doc.save();
					res.json(doc);
					console.log('saved doc');
					console.log(doc);
				}else {
					console.log('error caught validating build ' + err);
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
	validateBuild(req.body, function(err) {
		if (! err) {
			try {
			var newBuild = new mbuild(req.body);
			newBuild.save(function(err) {
				if (!err) {
					res.send(newBuild);
				}else {
					res.send(err, 400);
				}
			});
			}catch (myerror) {
				console.log('could not save build, most likely due to invalid data');
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


