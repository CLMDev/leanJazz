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

var Topology = require('../models/topologymodel');
var TopologyPool = require('../models/poolmodel');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var TopologyInstanceSchema = new Schema({
	_id: {type: ObjectId, auto: true},
	name: {type: String, unique: true},
	description: String,
	type: {type: String, default: 'noapp'},
	topologyRef: {type: String, ref: 'Topology'},
	poolRef: {type: String, ref: 'TopologyPool'},
    ucdEnvName: String,
    ucdEnvID: String,
    ucdApplication: String,
    ucdURI: String,
    creationDate: String,
    
	apppoolRef: {type: String, ref: 'TopologyPool'},
	
	buildid: String,
        iwdStatus: String,
        iwdURI: String,
        ucdStatus: String,
        ucdEnvDesc: String,
        checkoutDate: String,
        checkoutUser: String,
        checkoutComment: String,
	    checkedout: {type: Boolean, default: false },
	    appcheckoutDate: String,
        appcheckoutUser: String,
        appcheckoutComment: String,
	    appcheckedout: {type: Boolean, default: false },
	    apprequestId: {type: String, default: 'N/A' },
	    appdeploymentStatus:{type: String, default: 'N/A' }
	},{strict: 'throw'}
);

var mInstance = mongoose.model('TopologyInstance', TopologyInstanceSchema);
module.exports = mInstance;

var pname='Pool Instances';

function createInstance(provider, pool, request, callback) {
	var topoDoc = JSON.parse(request.content);
	var instance = new mInstance();
	instance.name = topoDoc.name;
	instance.description = 'instance for pooling, with bare environment';
	instance.type = 'noapp';
	instance.topologyRef = pool.topologyRef._id;
	instance.poolRef = pool._id;
	instance.ucdEnvName = topoDoc.name;
	instance.ucdEnvID = request.uuid;
	instance.ucdApplication = topoDoc.application;
	instance.ucdURI = provider.UCD_SERVER + '/#environment/' + request.uuid;
	instance.creationDate = new Date();
	
	var jsonStr = JSON.stringify(instance);
	console.log('[' + pname + '] ' + 'Creating instance for pool '+ pool.name + '(id: ' + pool._id + '): ' + jsonStr);
	
	instance.save(function(err, doc) {
		if (err) {
			console.log('[' + pname + '] ' + "Error saving new instance: " + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		console.log('[' + pname + '] ' + 'Instance saved: ' + JSON.stringify(doc));
		if (callback) {
			callback(null, doc);
		}
	});//instance.save
}

module.exports.createInstance = createInstance;

