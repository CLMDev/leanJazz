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

var pname='app_basicpooler';

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

var mbuild = require('./models/buildmodel');
var mprovider = require('./models/providermodel');
var mtopology = require('./models/topologymodel');
var mpool = require('./models/poolmodel');
var minstance = require('./models/instancemodel');
var mprocessrequest = require('./models/processrequestmodel');
var mongoose = require('mongoose');

var ucd = require('./experiments/UCDAdapter');

var api_password;



var https = require('https');
var request_json= require('request-json');
var topologyPort = nconf.get('PORT');
var options = {
rejectUnauthorized: false,
headers: {cookie:''}
};
var json_client = request_json.newClient('https://localhost:' + topologyPort, options);

process.on('message', function(m) {
	  api_password=m.password;
});

console.log(pname+': pooling process is running! ');
var timer;
var request_no=0;

function submitRequestForProcessRun(pool, callback) {
	var providerRef = pool.topologyRef.providerRef;
	mprovider.findById(providerRef, function(err, provider) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding provider: ' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		var request = {			
			application: pool.topologyRef.appName,
		};
		mprocessrequest.create(pool, request, function (err, req ) {
			if (err) {
				if (callback) {
					callback(err, null);
				}
				return;
			}
			console.log('[' + pname + '] ' + 'Run process with request: ' + JSON.stringify(req.content));
			
			RunProcesswithRequest(pool, request, callback);
		});
	});
}

function CheckIfBuildAvailable(pool, callback){
    
    console.log('lookup buildstream:'+pool.attachedStream);
    mbuild.find({buildStream:pool.attachedStream}, function( err, builds){
      if(err){
            console.log('error get builds for build stream:'+pool.attachedStream);
            
            callback(err);
            return;
      }
      console.log('builds available:'+builds);
      var latest_recommend='';
      builds.forEach(function(build){
        if(build.isRecommended && build.BUILDID>latest_recommend)
             latest_recommend=build.BUILDID;
      });//forEach()
      console.log('latest recommended build:'+latest_recommend);
      if(latest_recommend==undefined){
            console.log('latest recommended undefined, returning!');
            
            callback('latest recommended undefined, returning!');
            return;
      }
      callback(null,latest_recommend);
    });
}
function CheckoutIfResourceAvailableInParentPool(pool, parentpool, build, callback){
	
	json_client.setBasicAuth('apiuser@ibm.com', api_password);
    //console.log('api user password:'+api_password);
    
    json_client.get('/api/v1/topology/pools/' + parentpool.id+'/instances', function(err, res, body) {
      var today = Date.now();
      var found=false;
        body.forEach(function(instance){
              if(!found && !instance.checkedout){
                found=true;
                instance.checkedout=true;
                instance.type='app';
                instance.buildid=build;
                instance.checkoutUser='APP Pooler';
                instance.checkoutDate=today;
                instance.checkoutComment='reserved for app pool';
                instance.apppoolRef=pool._id;
                json_client.put('/api/v1/topology/pools/' + parentpool.id+'/instances/'+instance._id,instance, function(err, res, body) {
                  if (res.statusCode!=200) {
                    console.log('checkout from parent pool failed!');
                    callback('checkout from parent pool failed!');
                    return; 
                  }
                  callback(null, instance);
                });
              };//if(!found && !instance.checkedout)
        });//body.forEach
      if(!found) callback('No Available resource in parent pool');
      return;
    }); //json_client.get    
	
}

function RunProcesswithRequest(pool, request, callback) {
	CheckIfBuildAvailable(pool, function(err, build){
		CheckoutIfResourceAvailableInParentPool(pool, pool.parentPool, build, function(err, instance){
			var process_template,process_template_obj;
			mpool.findById(pool.parentPool, function(err, parent) {
			    if(!parent){
			      console.log('error: can not find parent pool!');
			      callback('error: can not find parent pool!');
                	      mprocessrequest.remove(pool, request, callback);                	
			      return;
			    }
			    try{
			          process_template=parent.topologyRef.appProcessTemplate;
			          console.log(process_template);
			          process_template_obj=JSON.parse(process_template);
			    } catch (err){
			          console.log(err);
			          console.log('please check process template of pool:'+parent.name);
			          console.log('process template:');
			          callback(err);
                	          mprocessrequest.remove(pool, request, callback);                	
			          return;
			    }
			    process_template_obj.environment=instance.name;
                            process_template_obj.versions[0].version=build;
            
                            var providerRef = pool.topologyRef.providerRef;
        	            mprovider.findById(providerRef, function(err, provider) {
        		      if (err) {
        			console.log('[' + pname + '] ' + 'Error when finding provider: ' + err);
        			if (callback) {
        				callback(err, null);
        			}
                	        mprocessrequest.remove(pool, request, callback);                	
        			return;
        		      }
                              ucd.requestApplicationProcess(provider, process_template_obj, function (err, body){
                	        if(err) { 
                                    callback(err); 
                	            mprocessrequest.remove(pool, request, callback);                	
                                    return;
                                }
                                console.log('instance.id:'+instance._id);
                                minstance.findById(instance._id, function(err, instance_mg){
                                  if(err) console.log(err);  
                                  console.log(instance_mg);
                                  instance_mg.apppoolRef=pool.id;
                                  instance_mg.apprequestId=body;
                                  console.log('apprequestId:'+instance_mg.apprequestId);
                                  instance_mg.save();
                	          mprocessrequest.remove(pool, request, callback);                	
                                });
                	
                              });//ucd.requestApplicationProcess
        	            });//mprovider.findById
		       }).populate('topologyRef');//mpoolfindById
	      });//Checkout
         });//CheckifBuildAvailable
}	
			

			

function requestProcessIfNeeded(pool, callback) {
	mprocessrequest.count({ poolRef: pool._id }, function(err, queueCnt) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when counting request for pool ' + pool.name + '(id: ' + pool._id + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		minstance.count({ poolRef: pool._id }, function(err, totalInstCnt) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when counting instances for pool ' + pool.name + '(id: ' + pool._id + '):' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			minstance.count({ poolRef: pool._id, checkedout: true }, function(err, checkedOutCnt) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when counting checked out instances for pool ' + pool.name + '(id: ' + pool._id + '):' + err);
					if (callback) {
						callback(err, null);
					}
					return;
				}
				
				var poolAvailable = totalInstCnt - checkedOutCnt;
				console.log('[' + pname + '] ' + 'Pool ' + pool.name + '(id: ' + pool._id + ') c/a/q status: ' + checkedOutCnt + ' / ' + poolAvailable + ' / ' + queueCnt);
				
				var needToCreate = pool.poolMinAvailable - (poolAvailable + queueCnt);
				if (needToCreate > 0) {
					if (totalInstCnt + queueCnt + needToCreate > pool.poolMaxTotal) {
						needToCreate = pool.poolMaxTotal - (totalInstCnt + queueCnt);
						if (needToCreate <= 0) {
							return console.log('[' + pname + '] ' + 'Reaches max instance count, No need to create more instances.');
						}
					}
					console.log('[' + pname + '] ' + 'Need to create ' + needToCreate + ' more instance(s).');
					for (i = 0; i < needToCreate; i++) {
						submitRequestForProcessRun(pool, callback);
					}
				} else {
					return console.log('[' + pname + '] ' + 'Still have available or queued instance(s), no need to create more instances.');
				}
			});
		});
	});
}



var timeoutcb= function(){

mpool.find({type:'app'},function(err, pools){

    console.log('['+pname+']:inside call back')
  if (err) return console.error(err);
    console.log(pools)
  pools.forEach(function( pool){
	  requestProcessIfNeeded(pool, function(err){
		  if(err)
			  console.log('['+pname+']:'+ err);
	  });
  });//pools.foreach
  timer=setTimeout(timeoutcb, 60000); //every 60 seconds

}).populate('topologyRef').populate('parentPool');//mpool.find


};

timer=setTimeout(timeoutcb, 2000); //every 60 seconds

