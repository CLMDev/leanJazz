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

var InstanceSchema = new Schema({
	_id: {type: ObjectId, auto: true},
	name: {type: String, required: true, unique: true},
	type: {type: String, required: true, default: 'noapp'},
	poolRef: {type: String, required: true, ref: 'TopologyPool'},
    parentInstance: {type: String, required: true},
    properties: {type: String, required: true, default: '{}'},
	status: {type: String, required: true},
    creationDate: {type: String, required: true},
    
	trackingId: {type: String},
	trackingUrl: {type: String},
	
    checkoutDate: {type: String},
    checkoutUser: {type: String},
    checkoutComment: {type: String}
	
	},{strict: 'throw'}
);

var Instances = mongoose.model('TopologyInstance', InstanceSchema);
module.exports = Instances;
