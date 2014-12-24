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
var validator = require('validator');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ProviderSchema = new Schema({
	type: {type: String, required: true},
	server: {type: String, required: true},
	username: {type: String, required: true},
	password: {type: String, required: true}
});
var PoolSchema = new Schema({
	_id: {type: ObjectId, auto: true},
	name: {type: String, required: true, unique: true},
	description: {type: String},
	type: {type: String, required: true, default: 'noapp'},
	provider: [ProviderSchema],
	properties: {type: String, required: true},
	parentPool:{type: String, default: 'N/A'},
	parentPoolName:{type: String, default: 'N/A'},
	attachedStream:{type: String, default: 'N/A'},
	poolMinAvailable: {type: Number, required: true},
	poolMaxTotal: {type: Number, required: true}
	},{strict: 'throw'}
);

var validateType = function(val) {
	console.log(">>>validating type:" + val);
	return (val == 'noapp') || (val == 'app');
};
var validateProvider = function(val) {
	console.log(">>>validating provider:" + val);
	return val && val.length == 1;
};
var validatePoolMinAvailable = function(val) {
	console.log(">>>validating validatePoolMinAvailable:" +val);
	return (val >= 0) && (val <= this.poolMaxTotal);
};
var validatePoolMaxTotal = function(val) {
	console.log(">>>validating validatePoolMaxTotal:" +val);
	return (val >= this.poolMinAvailable);
};

PoolSchema.path('type').validate(validateType, 'validation of `{PATH}` failed with value `{VALUE}`, failed as the value needs to be either app or noapp');
PoolSchema.path('provider').validate(validateProvider, 'validation of `{PATH}` failed with value `{VALUE}`, failed as only one provider allowed');
PoolSchema.path('poolMinAvailable').validate(validatePoolMinAvailable, 'validation of `{PATH}` failed with value `{VALUE}`, invalid value set for pool min');
PoolSchema.path('poolMaxTotal').validate(validatePoolMaxTotal, 'validation of `{PATH}` failed with value `{VALUE}`, invalud valiue set for pool max');

var Pools = mongoose.model('TopologyPool', PoolSchema);
module.exports = Pools;
