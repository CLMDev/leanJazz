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
	_id: {type: ObjectId, auto: true},
	name: {type: String, required: true, unique: true},
	description: {type: String},
	type: {type: String, required: true},
	server: {type: String, required: true},
	username: {type: String, required: true},
	password: {type: String, required: true}
	},{strict: 'throw'}
);

ProviderSchema.path('server').validate(validator.isURL, 'validation of `{PATH}` failed with value `{VALUE}` failed and needs to be an URL');

module.exports = mongoose.model('Provider', ProviderSchema);

