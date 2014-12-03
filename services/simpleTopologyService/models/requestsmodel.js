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

var TopologyPool = require('../models/poolmodel');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var RequestsSchema = new Schema({
    _id: {type: ObjectId, auto: true},
    poolRef: {type: String, ref: 'TopologyPool'},
	uuid: {type: String},
	content: {type: String},
	status: String,
	submitDate: String,
	},{strict: 'throw'}
);

var Requests = mongoose.model('Requests', RequestsSchema);
module.exports = Requests;

var pname='Pool Requests';

function create(pool, content, callback) {
	var req = new Requests();
	req.poolRef = pool._id;
	req.content = JSON.stringify(content);
	req.submitDate = new Date();
	req.status = 'CREATED';
	
	var jsonStr = JSON.stringify(req);
	console.log('[' + pname + '] ' + 'Creating request for pool '+ pool.name + '(id: ' + pool._id + '): ' + jsonStr);
	
	req.save(function(err, doc) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when saving request: ' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		console.log('[' + pname + '] ' + 'Request saved: ' + JSON.stringify(doc));
		if (callback) {
			callback(null, doc);
		}
	});
}
module.exports.create = create;

function remove(pool, request, callback) {
	var jsonStr = JSON.stringify(request);
	console.log('[' + pname + '] ' + 'Removing request for pool ' + pool.name + '(id: ' + pool._id + '): ' + jsonStr);
	Requests.findByIdAndRemove(request._id, function(err) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when removing request: ' + err);
			if (callback) {
				callback(err);
			}
			return;
		}
		console.log('[' + pname + '] ' + 'Request removed: ' + request);
	});
}
module.exports.remove = remove;

function updateUUID(pool, request, uuid, callback) {
	var jsonStr = JSON.stringify(request);
	console.log('[' + pname + '] ' + 'Updating request for pool ' + pool.name + '(id: ' + pool._id + '): ' + jsonStr);
	Requests.findByIdAndUpdate(request._id, { uuid: uuid, status: 'PROCESSING' }, function(err, doc) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when updating request: ' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		console.log('[' + pname + '] ' + 'Request updated: ' + doc);
		if (callback) {
			callback(null, doc);
		}
	});
}

module.exports.updateUUID = updateUUID;

function listByPool(pool, callback) {
	Requests.find({ poolRef: pool._id }, function(err, requests) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding requests for pool ' + pool.name + '(id: ' + pool._id + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (callback) {
			callback(null, requests);
		}
	});
}
module.exports.listByPool = listByPool;
