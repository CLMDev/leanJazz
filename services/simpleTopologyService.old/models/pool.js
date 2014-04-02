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

/*
TODO: 
	add in virtuals for the size of the pool
	Tank.findByIdAndUpdate(id, { $set: { size: 'large' }}, function (err, tank) {
	Replace my validator with cutomer validator in mongoose : http://mongoosejs.com/docs/validation.html
	schema.path('name').validate(validator, 'validation of `{PATH}` failed with value `{VALUE}`');
	how to require that topologyRef is set as a part of the constructor
*/
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/leanJazz',
  function(err) {
    if (!err) {
      console.log('connected');
    }else {
      console.log('already connected');
    }
});
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

TopologyPoolSchema.virtual('o.poolingMethod').get(function () {
  return this.oPoolingMethod;
});

TopologyPoolSchema.path('name').set(function(v) {
	console.log('setting id to name');
	this._id = v;
	if (this.new) {
		console.log('this is a new pool initiatizing');
	}
	return v;
});

//see if I can set the instance method to something else 
TopologyPoolSchema.path('poolingMethod.type').set(function(v) {
		console.log('>>>setting pooling method to:' + v);
		var json = {
			type: v,
			min: 3,
			max: 10
		};
		if (v === "basic"){
			this.oPoolingMethod = new BasicPoolingMethod(json); 
		}else if (v === "aggressive"){
			this.oPoolingMethod = new AggPoolingMethod(json); 
		}else{
			throw new Error('Pooling method ' + v + ' is not supported'); 
		}
		this.purge = function(callback){
			console.log('TBD purge different');
			callback();
		};
		console.log('<<<setting pooling method to:' + v);
		return v;
});

var validator = require('validator');
var validateType = function(val) {
	return (val == 'latest') || (val == 'last-good');
};
TopologyPoolSchema.path('topologyRef').validate(validator.isURL, 'validation of `{PATH}` failed with value `{VALUE}` failed and needs to be an URL');
TopologyPoolSchema.path('type').validate(validateType, 'validation of `{PATH}` failed with value `{VALUE}` failed as the value needs to be either latest or last-good');
/*
	Create instances methods for: 
		1. purge 
		2. getInstance 
		3. returnInstance
*/
TopologyPoolSchema.methods.purge = function(callback){
	console.log('TBD purge');
	callback();
};
TopologyPoolSchema.methods.checkin = function(id,callback){
	console.log('TBD checkin:' + id);
	callback(undefined);
};
TopologyPoolSchema.methods.checkout = function(id,callback){
	console.log('TBD purge:' + id);
	var obj = 'fakeinstance';
	callback(undefined,obj);
};

TopologyPoolSchema.statics.create = function(json, callback){
	console.log(">>>create");
	var obj = new mTopologyPool(json);
	console.log("saving topology");
	obj.save(function(err){
		callback(err,obj);
	});
	console.log("<<<create");
};

var mTopologyPool = mongoose.model('mTopologyPool', TopologyPoolSchema);


/**
	Need to move this into a function like so https://github.com/stevekwan/experiments/blob/master/javascript/module-pattern.html 
	Or simply leave this much simpler ... probably a better idea
*/

//define a basic pooling method
function BasicPoolingMethod(json){
	console.log('>>>BasicPoolingMethod Constructor');
	console.log(json);
	this.min = json.min; 
	this.max = json.max;
	this.type = json.type;
	console.log('<<<BasicPoolingMethodConstructor'); 
}
BasicPoolingMethod.prototype.fPurge = function(){
	console.log('BasicPoolingMethod.fPurge');
};
BasicPoolingMethod.prototype.fCreate = function(){
	console.log('BasicPoolingMethod.fCreate');
};
BasicPoolingMethod.prototype.fGet = function(){
	console.log('BasicPoolingMethod.fGet');
};
BasicPoolingMethod.prototype.fGetType = function(){
	console.log('BasicPoolingMethod.fGetType');
	return type;
};

//define a basic pooling method
function AggPoolingMethod(json){
	console.log('>>>AggPoolingMethod Constructor');
	console.log(json);
	this.min = json.min; 
	this.max = json.max;
	this.type = json.type;
	console.log('<<<AggPoolingMethod'); 
}
AggPoolingMethod.prototype.fPurge = function(){
	console.log('AggPoolingMethod.fPurge');
};
AggPoolingMethod.prototype.fCreate = function(){
	console.log('AggPoolingMethod.fCreate');
};
AggPoolingMethod.prototype.fGet = function(){
	console.log('AggPoolingMethod.fGet');
};
AggPoolingMethod.prototype.fGetType = function(){
	console.log('AggPoolingMethod.fGetType');
	return type;
};

var poolingMethods = {
	"basic" : BasicPoolingMethod,
};

/*
//constructor 
function Pool(json, callback){
	console.log(">>>Pool");
	var cPool = poolingMethods[json.poolingMethod.type];
	this.oPool = new cPool(json.poolingMethod);
	console.log('initialized topology');	
	//create the pooling mechanism 
	this.myPool = new mTopologyPool(json);
	console.log("saving topology");
	this.myPool.save(callback());
	console.log("<<<Pool");
}
*/

/*
Pool.prototype.toJSON = function(){
	return JSON.stringify(this.myPool);
};

function createFromModel(mTopologyPool, callback){
	//based on the value of poolingMethodType create a pooling method object 
	var cPool = poolingMethods[json.poolingMethod.type];
	var oPool = new cPool(json.poolingMethod);
	//resulting object is the Model and a Pooling Method 
	var obj = {
		model : mTopologyPool,
		poolingMethod: oPool
	};
	//return the resulting object
	callback(obj);
}

function createFromJson(json, callback){
	//based on the value of poolingMethodType create a pooling method object 
	var cPool = poolingMethods[json.poolingMethod.type];
	var oPool = new cPool(json.poolingMethod);
	var mTopologyModel = new mTopologyPool(json);

	//resulting object is the Model and a Pooling Method 
	var obj = {
		model : mTopologyPool,
		poolingMethod: oPool
	};
	//return the resulting object
	callback(obj);
}


function findByName = function(name,callback){
	//find object in the database and return a Pool 
	mTopologyPool.findById(name, function(err, doc){
		obj = {

		};
		callback(err,obj);
	});
};
*/

module.exports = mTopologyPool;