/**
*  Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*	 http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

var Provider = require('../models/providermodel');

exports.findAllView = function(req, res) {
	Provider.find({}, function(err, docs) {
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

var validator = require('validator');
var validateProvider = function(doc, next) {
	console.log("validating Provider document");
	console.log(doc);
	console.log('validated json');
	next(null);
};

exports.addViewSetup = function(req, res) {
	res.render('topology/providers/newprovider.jade', {
		title: 'Create new provider'
	});
};
exports.addViewExecute = function(req, res) {
	validateProvider(req.body.provider, function(err) {
		if (!err) {
			var provider = new Provider(req.body.provider);
			provider.save(function(err) {
				if (!err) {
					res.redirect('/providers/');
				} else {
					console.log('error saving provider');
					console.log(err);
					res.redirect('/providers/new');
				}
			});					  
		} else {
			console.log('error in addViewExecute validating provider');
			console.log(err);
			res.redirect('/providers');
		}
	});
};
exports.create = function(req, res) {
	validateProvider(req.body, function(err) {
		if (!err) {
			try {
				var newProvider = new Provider(req.body);
				newProvider.save(function(err) {
					if (!err) {
						res.send(newProvider);
					} else {
						res.send(err, 400);
					}
				});
			} catch(myerror) {
				console.log('could not save provider, most likely due to invalid data');
				console.log(myerror);
				res.send(myerror, 400);
			}
		} else {
			console.log('invalid input: ' + err);
			console.log(req.body);
			res.send(err, 400);
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
		} else {
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
		doc.UCD_SERVER= req.body.provider.UCD_SERVER;
		doc.UCD_USERNAME= req.body.provider.UCD_USERNAME;
		doc.UCD_PASSWORD= req.body.provider.UCD_PASSWORD;
		
		console.log('attempting to update document');
		console.log(doc);
		
		validateProvider(doc, function(err) {
			if (!err) {
				doc.save(function(err) {
					if (!err) {
						res.redirect('/providers');
					} else {
						console.log('error saving to database');
						res.redirect('/providers');
					}
				});
			} else {
				console.log('invalid data:' + err);
				res.redirect('/providers');
			}
		});
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
	} else if ( docs.length==0) {
		console.log('could not find document');
		res.send(400);
	} else {
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
				} else {
					console.log('error caught validating provider ' + err);
					res.send(err, 400);
				}
			});
		} catch(myerror) {
			console.log('error caught ' + myerror);
			res.send(myerror, 400);
		}
	}
	});
};

exports.deleteView = function(req, res) {
	Provider.findById(req.params.id, function(err, doc) {
		if (!doc) {
			console.log('could not remove document using ID ' + req.params.id);
			res.redirect('/providers');
		} else {
			doc.remove(function() {
				res.redirect('/providers');
			});
		}
	});
};

exports.find = function(req, res) {
	console.log('provider find: finding ' + req.params.id);
	Provider.findById(req.params.id, function(err, doc) {
		if (err) {
			console.error(err);
			res.send(500);
			return;
		}
		if (!doc) {
			res.send(404);
		} else {
			res.send(doc);
		}
	});
};


exports.delete = function(req, res) {
	Provider.find({buildStream:req.params.id}, function(err, docs) {
		if (docs.length==0) {
			res.send(404);
		} else {
			docs[0].remove(function() {
				res.send(200);
			});
		}
	});
};
