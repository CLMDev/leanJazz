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

var topologyPoolModel = require('../models/pool');
var TopologyPool = topologyPoolModel.mTopology();

exports.findAll = function(req, res) {
	TopologyPool.find({},function(err, docs) {
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

exports.create = function(req, res) {
	try {
		console.log('creating new topology pool');
		console.log(req.body);
		var newTopologyPool = new TopologyPool(req.body);
		newTopologyPool.save(function(err) {
			if (!err) {
				res.json(newTopologyPool);
				console.log('created topology pool');
				console.log(newTopologyPool);
			}else {
				console.log('failed to created pool');
				console.log(newTopologyPool);
				console.log(err);
				res.send(err, 400);
			}
		});
	}catch (err) {
		console.log('could not create new topology pool, most likely due to invalid data');
		console.log(err);
		res.send(err, 400);
	}
};

exports.find = function(req, res) {
	console.log('finding ' + req.params.id);
	TopologyPool.findById(req.params.id, function(err, doc) {
		if (! doc) {
			res.send(404);
		}else {
			res.send(doc);
		}
	});
};
exports.delete = function(req, res) {
	TopologyPool.findById(req.params.id, function(err, doc) {
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