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
var nconf = require('nconf');
nconf.argv().env().file({ file: '../config.json'});

mongoose.connect(nconf.get('MONGO_URI'),
  function(err) {
    if (!err) {
      console.log('mongoose connected');
    }else {
      console.log('mongoose already connected');
    }
});

var Topology = require ('./topologymodel');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var TopologyPoolSchema = new Schema({
	_id: {type: ObjectId, auto: true},
	name: {type: String, unique: true},
	description: String,
	type: {type: String, default: 'noapp'},
	parentPool:{type: String, default: 'N/A'},
	parentPoolName:{type: String, default: 'N/A'},
	attachedStream:{type: String, default: 'N/A'},
	topologyRef: {type: String, ref:'Topology'},
	poolMethod: {type: String, default: 'basic'},
	poolMinAvailable: {type: Number, default: 2},
	poolMaxTotal: {type: Number, default: 10},
	available: {type: Number, default: 0},
	checkedout: {type: Number, default: 0},
	//total: {type: Number, default: 0},
	availableInstances: {type: [], default: []},
	checkedOutInstances: {type: [], default: []}
	},{strict: 'throw'}
);

TopologyPoolSchema.virtual('o.poolingMethod').get(function () {
  return this.oPoolingMethod;
});


TopologyPoolSchema.path('name').set(function(v) {
	console.log('setting id to name');

	if (this.new) {
		console.log('this is a new pool initiatizing');
	}
	return v;
});

var validator = require('validator');
var validateType = function(val) {
	console.log(">>>validating type:" +val);
	return (val == 'noapp') || (val == 'app');
};
var validatePoolMethod = function(val) {
	console.log(">>>validating poolingMethod:" +val);
	var response = (val === 'basic') || (val === 'aggressive');
	console.log(response);
	return (val === 'basic') || (val === 'aggressive');
};
var validatePoolMinAvailable = function(val) {
	console.log(">>>validating validatePoolMinAvailable:" +val);
	return (val >= 0) && (val <= this.poolMaxTotal);
};
var validatePoolMaxTotal = function(val) {
	console.log(">>>validating validatePoolMaxTotal:" +val);
	return (val >= this.poolMinAvailable);
};

TopologyPoolSchema.path('type').validate(validateType, 'validation of `{PATH}` failed with value `{VALUE}` failed as the value needs to be either app or noapp');
TopologyPoolSchema.path('poolMinAvailable').validate(validatePoolMinAvailable, 'validation of `{PATH}` failed with value `{VALUE}` invalid value set for pool min');
TopologyPoolSchema.path('poolMaxTotal').validate(validatePoolMaxTotal, 'validation of `{PATH}` failed with value `{VALUE}` invalud valiue set for pool max');
TopologyPoolSchema.path('poolMethod').validate(validatePoolMethod, 'validation of `{PATH}` failed with value `{VALUE}` invalid value set for pool type');

TopologyPoolSchema.pre('save', function (next) {
	console.log(">>>save.pre");
	//this.setProcessing("Initializing Pool");
	if (this.poolMethod == "basic"){
		this.oPoolingMethod = new BasicPoolingMethod(this.poolMin, this.poolMax); 
		setTimeout(next, 200);
		next();
	}else if (this.poolMethod == "aggressive"){
		this.oPoolingMethod = new AggPoolingMethod(this.poolMin, this.poolMax); 
		setTimeout(next, 500);
	}else{
		//this should never happen due to validators.
		next(new Error('Pooling method ' + newpool.poolMethod + '  not supported'));
	}
	console.log("<<<save.pre");
});
TopologyPoolSchema.post('save', function (doc) {
	console.log(">>>save.post");
	console.log(doc);
	console.log("<<<save.post");
});

/*
	Create instances methods for: 
		1. purge 
		2. getInstance 
		3. returnInstance

TopologyPoolSchema.methods.setStable = function(){
	this.stable = true;
	ee.emit("poolStableEvent");
};
TopologyPoolSchema.methods.setProcessing = function(message){
	this.stable = false;
	ee.emit("poolProcessingEvent", message);
};
*/

/*
TopologyPoolSchema.methods.waitFor = function(callback){
	if (this.stable){
		callback();
	}else{
		console.log(">>>waitFor");
		ee.on("poolStableEvent", callback);
	}
};
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

//TBD should this simple be a virtual rather than a method
TopologyPoolSchema.methods.getStatus = function (cb) {
	console.log('>>>getStatus');
	try{
		var status = {
			state: this.state,
			minPool: this.poolMin,
			maxPool: this.poolMax, 
			poolMethod: this.poolMethod
		};
		status.availableinstances = this.availableInstances.length;
		status.checkedOutInstances = this.checkedOutInstances.length;
		if(this.oPoolingMethod === undefined){
			status.state = "error";
			status.oPoolingMethod = undefined;
			cb(undefined,JSON.stringify(status));
		}else{
			console.log("adding created ");
			status.state = "created";
			status.oPoolingMethod = JSON.stringify(this.oPoolingMethod);
			cb(undefined,JSON.stringify(status));
		}

	}catch(err){
		console.log("<<<getStatus " + err);
		cb(err, {state: "error"});
	}
	console.log('<<<getStatus');
};

TopologyPoolSchema.statics.create = function(json, callback){
	console.log(">>>create");
	console.log(json);
	var obj = new mTopologyPool(json);
	console.log("saving pool");
	console.log(obj);
        if(obj.type=='noapp'){
          obj.parentPool='N/A';
          obj.attachedStream='N/A';
        } else {
          obj.topologyRef='N/A';
        }
	obj.save(function(err, newpool){
		console.log("saved pool, err:" + err);	
		callback(err,newpool);
	});
	console.log("<<<create");
};

var mTopologyPool = mongoose.model('mTopologyPool', TopologyPoolSchema);


/**
	Need to move this into a function like so https://github.com/stevekwan/experiments/blob/master/javascript/module-pattern.html 
	Or simply leave this much simpler ... probably a better idea
*/

//define a basic pooling method
function BasicPoolingMethod(min, max){
	console.log('>>>BasicPoolingMethod Constructor');
	this.min = min; 
	this.max = max;
	this.aboutme = "basic";
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
	return this.aboutme;
};

//define a basic pooling method
function AggPoolingMethod(min, max){
	console.log('>>>AggPoolingMethod Constructor');
	this.min = min; 
	this.max = max;
	this.aboutme = "aggressive";
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
	return this.aboutme;
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
