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

var Pools = require('../models/poolmodel');
var Instances = require('../models/instancemodel');

function listPoolsView(req, res) {
	res.sendfile('public/html/pools/list.html');
};
exports.findAllView = listPoolsView;

function detailsView(req, res) {
	res.sendfile('public/html/pools/details.html');
};
exports.detailsView = detailsView;

function listAllPools(req, res) {
	Pools.find({}, function(err, docs) {
		if (err) {
			console.log('Error when listing pools: ' + err);
			return res.send(err, 500);
		}
		return res.send(!docs ? '[]' : docs);
	});
}
exports.findAll = listAllPools;

function getPoolById(req, res) {
	Pools.findById(req.params.id, function(err, doc) {
		if (err) {
			console.log('Error when reading pool: ' + err);
			return res.send(err, 500);
		}
		if (doc) {
			return res.json(doc);
		}
		return res.send(404);
	});
}
exports.find = getPoolById;

function createPool(req, res) {
	var pool = req.body;
	Pools.create(pool, function(err, pool) {
		if (err) {
			console.log('Error when creating pool: ' + err);
			return res.send(err, 400);
		}
		res.json(pool);
	});
}
exports.create = createPool;

function updatePool(req, res) {
	var pool = req.body;
	Pools.findByIdAndUpdate(req.params.id, pool, function(err, doc) {
		if (err) {
			console.log('Error when updating pool: ' + err);
			return res.send(err, 400);
		}
		res.json(doc);
	});
}
exports.update = updatePool;

function deletePool(req, res) {
	Pools.findByIdAndRemove(req.params.id, function(err, doc) {
		if (err) {
			console.log('Error when deleting pool: ' + err);
			return res.send(500, err);
		}
		return res.send(doc ? 200 : 404);
	})
}
exports.remove = deletePool;

function listAllInstances(req, res) {
	var poolId = req.params.id;
	Instances.find({ poolRef: poolId }, function(err, docs) {
		if (err) {
			console.log('Error when listing instances: ' + err);
			return res.send(err, 500);
		}
		return res.json(!docs ? '[]' : docs);
	});
}
exports.listAllInstances = listAllInstances;

function getInstanceById(req, res) {
    Instances.findById(req.params.id, function(err, doc) {
		if (err) {
			console.log('Error when reading instance: ' + err);
			return res.send(err, 500);
		}
		if (doc) {
			return res.json(doc);
		}
		return res.send(404);
    });
}
exports.getInstanceById = getInstanceById;
