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


var Provider = require('../models/providermodel');

exports.findAllView = function(req, res) {
  Provider.find({},function(err, docs) {
    if (!docs) {
      console.log('no provider found');
      docs = [];
    }
    res.render('topology/providers/providerindex', {
      title: 'Available Providers',
      docs: docs
    });
  });
};

exports.addViewSetup = function(req, res) {
    res.render('topology/providers/newprovider.jade', {
                title: 'Create new provider'
    });
};

var validator = require('validator');
var validateProvider = function(doc, next) {
	console.log("validating Provider document");
	console.log(doc);
        console.log('validated json');
	next(null);
};


exports.addViewExecute = function(req, res) {
	validateProvider(req.body.provider, function(err) {
		if (! err) {
			var provider = new Provider(req.body.provider);
                        
			  provider.save(function(err) {
				if (! err) {
					res.redirect('/providers/');
				}else {
					console.log('error saving provider');
					console.log(err);
					res.redirect('/providers/new');
				}
		  	  });                      

		}else {
			console.log('error in addViewExecute validating provider');
			console.log(err);
			res.redirect('/providers');
		}
	});
};

exports.findAll = function(req, res) {
	Provider.find({},function(err, docs) {
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
  Provider.findById(req.params.id, function(err, doc) {
    res.render('topology/providers/editprovider', {
      title: 'Edit Provider',
      provider: doc
    });
  });
};
exports.editViewExecute = function(req, res) {
   Provider.findById(req.params.id, function(err, doc) {
    
    doc.name = req.body.provider.name;
    doc.description = req.body.provider.description;
    doc.UCD_webURL= req.body.provider.UCD_webURL;
    doc.UCD_authtoken= req.body.provider.UCD_authtoken;
    doc.UCD_version= req.body.provider.UCD_version;
    doc.IWD_host= req.body.provider.IWD_host;
    doc.IWD_version= req.body.provider.IWD_version;
    doc.IWD_username= req.body.provider.IWD_username;
    doc.IWD_password= req.body.provider.IWD_password;
    
    console.log('attempting to update document');
    console.log(doc);
    validateProvider(doc, function(err) {
		if (!err) {
			doc.save(function(err) {
				if (!err) {
					res.redirect('/providers');
				}
				else {
					console.log('error saving to database');
					res.redirect('/providers');
				}
			});
		}else {
			console.log('invalid data:' + err);
			res.redirect('/providers');
		}
    });
  });
};


exports.deleteView = function(req, res) {
	Provider.findById(req.params.id, function(err, doc) {
		if (!doc) {
			console.log('could not remove document using ID ' + req.params.id);
			res.redirect('/providers');
		}else {
			doc.remove(function() {
				res.redirect('/providers');
			});
		}
	});
};

exports.find = function(req, res) {
	console.log('provider find: finding ' + req.params.id);
	Provider.find({provider:req.params.id}, function(err, docs) {
		console.log('printing docs');
		console.log(docs);

		if (docs.length==0) {
			res.send(404);
		}else {
		        console.log('print build stream object found:');
		        console.log(docs[0]);
			res.send(docs[0]);
		}
	});
};


exports.delete = function(req, res) {
	Provider.find({buildStream:req.params.id}, function(err, docs) {
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
	Provider.find({_id:req.params.id}, function(err, docs) {
	updateDoc = req.body;
	console.log(updateDoc);
        if (err) {
		console.log('error finding provider');
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
			validateProvider(doc, function(err) {
				if (!err) {
					doc.save();
					res.json(doc);
					console.log('saved doc');
					console.log(doc);
				}else {
					console.log('error caught validating provider ' + err);
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
	validateProvider(req.body, function(err) {
		if (! err) {
			try {
			var newProvider = new Provider(req.body);
			newProvider.save(function(err) {
				if (!err) {
					res.send(newProvider);
				}else {
					res.send(err, 400);
				}
			});
			}catch (myerror) {
				console.log('could not save provider, most likely due to invalid data');
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

