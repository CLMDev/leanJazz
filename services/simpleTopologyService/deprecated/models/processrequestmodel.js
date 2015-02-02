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
var ProcessRequestsSchema = new Schema({
    _id: {type: ObjectId, auto: true},
    poolRef: {type: String, ref: 'TopologyPool'},	
    requestId: {type: String},
	content: {type: String},
	},{strict: 'throw'}
);

var ProcessRequests = mongoose.model('ProcessRequests', ProcessRequestsSchema);
module.exports = ProcessRequests;

var pname='Process Requests';

function create(pool, content, callback) {
	var req = new ProcessRequests();
	req.poolRef = pool._id;
	req.content = JSON.stringify(content);
	
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
	ProcessRequests.findByIdAndRemove(request._id, function(err) {
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

function updateRequestId(pool, request, requestId, callback) {
	var jsonStr = JSON.stringify(request);
	console.log('[' + pname + '] ' + 'Updating request for pool ' + pool.name + '(id: ' + pool._id + '): ' + jsonStr);
	Requests.findByIdAndUpdate(request._id, { requestId: requestId }, function(err, doc) {
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

module.exports.updateRequestId = updateRequestId;
