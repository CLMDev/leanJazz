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
var nconf = require('nconf');

nconf.argv()
        .env()
        .file({ file: './config.json'});

//define documents for mongo
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Topology = new Schema({
	_id: {type: ObjectId, auto: true},
	name: {type: String, unique: true},
	topologyDocument: String,
	description: String,
	topologyDocument: String,
	appProcessTemplate:String,
	referenceURL: String,
	pools: [],
	providerRef: {type: String, ref:'Provider'},	
	},{strict: 'throw'}
);
var validator = require('validator');
//this is used for very basic validation of json document being passed in 
//TBD: add in schema validation for the properties on the model 



var validateProviders = function(providers) {
	console.log(">>>validating providers:");
	/**
		{
			type: 
			url: 
			usernameProperty: 
			passwordProperty: 
		}
	*/
	for (var i=0;i<providers.length;i++){
		val = providers[i];
		console.log("checking : ");
		console.log(val);
		console.log("checking password property");
		console.log(val.passwordProperty);
		if (! validator.isURL(val.url)){
			console.log("invalid provider URL " + val);
			return false;
		}else if (! (validator.equals(val.type, "IWD") || validator.equals(val.type, "UCD"))){
			console.log("invalid provider type ");
			return false;
		}else if (validator.isNull(val.usernameProperty) || validator.isNull(nconf.get(val.usernameProperty)) ){
			console.log("invalid provider username ... the following property is not set " + val.usernameProperty);
			return false;
		}else if (validator.isNull(val.passwordProperty) || validator.isNull(nconf.get(val.passwordProperty)) ){
			console.log("invalid provider password ... the following property is not set " + val.passwordProperty);
			return false;
		}else{
			console.log("checking valie of passwordProperty ");
			console.log(nconf.get(val.passwordProperty));
			return true;
		}
	}
};
Topology.path('referenceURL').validate(validator.isURL, 'validation of `{PATH}` failed with value `{VALUE}` failed and needs to be an URL');
Topology.path('providers').validate(validateProviders, 'validation of `{PATH}` failed with value `{VALUE}` failed');


Topology.path('name').set(function(v) {
	console.log('setting name');
	//this._id = v;
	if (! this.pools) {
		this.pools = [];
	}
	if (! this.providers) {
		this.providers = [];
	}
	return v;
});

var Topology = mongoose.model('Topology', Topology);

module.exports =Topology;
