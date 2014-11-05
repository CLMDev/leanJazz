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
var mprovider = require('./models/providermodel');
var mpool = require('./models/poolmodel');
var mrequests = require('./models/requestsmodel');
var minstance = require('./models/instancemodel');
var ucd = require('./experiments/UCDAdapter');

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

var pname='pool_monitor';

var mongoose = require('mongoose');
mongoose.connect(nconf.get('MONGO_URI'),
  function(err) {
    if (!err) {
    	console.log('[' + pname + '] ' + 'Mogoose DB connected! ');
    } else {
      throw err;
    }
});

console.log('[' + pname + '] ' + 'Monitoring process is running! ');

var requestCnt = 0;

function submitRequestForNewInstance(pool, callback) {
	var providerRef = pool.topologyRef.providerRef;
	mprovider.findById(providerRef, function(err, provider) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding provider: ' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		var envName = pool.name + '-env-' + requestCnt++;
		var request = {
			name: envName,
			application: pool.topologyRef.appName,
			baseResource: '/STS',
			blueprint: pool.topologyRef.blueprintName,
			lockSnapshots: false,
			requireApprovals: false,
			nodeProperties: JSON.parse(pool.topologyRef.nodeProperties)
		};
		mrequests.create(pool, request, function(err, req) {
			if (err) {
				if (callback) {
					callback(err, null);
				}
				return;
			}
			console.log('[' + pname + '] ' + 'Creating UCD environment with request: ' + JSON.stringify(req.content));
			ucd.createEnvironment(provider, JSON.parse(req.content), function(err, uuid) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when creating UCD environment: ' + err);
					mrequests.remove(pool, req);
					return;
				}
				console.log('[' + pname + '] ' + 'New environment has been created.');
				mrequests.updateUUID(pool, req, uuid, function(err, updatedReq) {
					if (err) {
						if (callback) {
							callback(err, null);
						}
						return;
					}
					console.log('[' + pname + '] ' + 'UCD environment has been created successfuly with request: ' + JSON.stringify(request));
					if (callback) {
						callback(null, updatedReq);
					}
				});
			});// End of create environment
		});// End of create request
	});
}

function checkEnvForPool(pool, app, env, callback) {
	console.log('[' + pname + '] ' + "Checking UCD status of environment '" + env + "' in application '" + app + "' for pool " + pool.name + '(id: ' + pool._id + ')');
	var providerRef = pool.topologyRef.providerRef;
	mprovider.findById(providerRef, function(err, provider) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding provider: ' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		ucd.pingEnvironment(provider, app, env, function(err, online) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when pinging UCD environment status: ' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (callback) {
				callback(null, online);
			}
		});
	});
}

function createNewInstancesIfNeeded(pool, callback) {
	mrequests.count({ poolRef: pool._id }, function(err, queueCnt) {
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
						submitRequestForNewInstance(pool, callback);
					}
				} else {
					return console.log('[' + pname + '] ' + 'Still have available or queued instance(s), no need to create more instances.');
				}
			});
		});
	});
}

function processRequestIfNeeded(pool, callback) {
	mrequests.find({ poolRef: pool._id }, function(err, requests) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding requests for pool ' + pool.name + '(id: ' + pool._id + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		
		if (!requests || requests.length < 1) {
			console.log('[' + pname + '] ' + 'No request for pool ' + pool.name + '(id: ' + pool._id + ') yet.');
			return;
		}
		requests.forEach(function(request) {
			if (!request.uuid) {
				return console.log('[' + pname + '] ' + 'The environment UUID is not assigned yet, skipping checking request: ' + JSON.stringify(request));
			}
			var topoDoc = JSON.parse(request.content);
			var app = topoDoc.application;
			var env = topoDoc.name;
			checkEnvForPool(pool, app, env, function(err, online) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when checking enviroment status: ' + err);
					mrequests.remove(pool, request);
					return;
				}
				if (!online) {
					return console.log('[' + pname + '] ' + "New environment '" + env + "' in application '" + app + "' is not ready for pool " + pool.name + '(id: ' + pool._id + ') yet.');
				}
				console.log('[' + pname + '] ' + "New environment '" + env + "' in application '" + app + "' goes online for pool " + pool.name + '(id: ' + pool._id + ')');
				removeRequest(pool, request);
				mprovider.findById(pool.topologyRef.providerRef, function(err, provider) {
					if (err) {
						console.log('[' + pname + '] ' + 'Error when finding provider: ' + err);
						if (callback) {
							callback(err, null);
						}
						return;
					}
					minstance.createInstance(provider, pool, request, function(err, instance) {
						if (err) {
							console.log('[' + pname + '] ' + 'Error when creating instance: ' + err);
							if (callback) {
								callback(err, null);
							}
							return;
						}
					});
				});
			});
		});
	});	
}

var timer1 = setInterval(function() {
	mpool.find({ type: 'noapp' }, function(err, pools) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding pool: ' + err);
			return clearInterval(timer1);
		}
		pools.forEach(function(pool) {
			createNewInstancesIfNeeded(pool, function(err, request) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when creating instance(s) when needed: ' + err);
					clearInterval(timer1);
					return;
				}
			});
		});
	}).populate('topologyRef');//mpool.find
}, 30000); //every 30 seconds

var timer2 = setInterval(function() {
	mpool.find({ type: 'noapp' }, function(err, pools) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding pool: ' + err);
			return clearInterval(timer2);
		}
		pools.forEach(function(pool) {
			processRequestIfNeeded(pool, function(err) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when processing request(s) when needed: ' + err);
					clearInterval(timer2);
					return;
				}
			});
		});
	}).populate('topologyRef');//mpool.find
}, 30000); //every 30 seconds

