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
//define documents for mongo
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var TopologyPoolSchema = new Schema({
	_id: String,
	name: {type: String, unique: true},
	description: String,
	type: {type: String, default: 'latest'},
	topologyRef: String,
	poolingMethod: {
		type: {type: String, default: 'basic'},
		min: {type: Number, default: 0, min: 0},
		max: {type: Number, default: 25, min: 0, max: 100}
	},
	availableInstances: {type: [], default: []},
	checkedOutInstances: {type: [], default: []}
	},{strict: 'throw'}
);

TopologyPoolSchema.path('name').set(function(v) {
	console.log('setting id to name');
	this._id = v;
	if (this.new) {
		console.log('this is a new pool initiatizing');
	}
	return v;
});
var validator = require('validator');
var validateType = function(val) {
	return (val == 'latest') || (val == 'last-good');
};
TopologyPoolSchema.path('topologyRef').validate(validator.isURL, 'validation of `{PATH}` failed with value `{VALUE}` failed and needs to be an URL');
TopologyPoolSchema.path('type').validate(validateType, 'validation of `{PATH}` failed with value `{VALUE}` failed as the value needs to be either latest or last-good');

var TopologyPool = mongoose.model('TopologyPool', TopologyPoolSchema);

//TODO: add in virtuals for the size of the pool
//Tank.findByIdAndUpdate(id, { $set: { size: 'large' }}, function (err, tank) {
//Replace my validator with cutomer validator in mongoose : http://mongoosejs.com/docs/validation.html
//schema.path('name').validate(validator, 'validation of `{PATH}` failed with value `{VALUE}`');
//how to require that topologyRef is set as a part of the constructor

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