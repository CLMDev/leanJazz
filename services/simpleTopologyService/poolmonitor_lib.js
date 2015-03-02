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
var PoolModel = require('./models/poolmodel');
var InstanceModel = require('./models/instancemodel');

var pname='pool_monitor';

function generateDatetime() {
	var time = (new Date()).toISOString();
	var str = time.replace(/[\-:T\.Z]*/gi, '')
//	str = str.substring(0, str.indexOf('.'));
	return str;
}

function checkoutInstanceFromParentPool(pool, callback) {
	if (pool.type == 'noapp') {
		if (callback) {
			callback(null, { _id: 'NA' });
		}
	} else if (pool.type == 'app') {
		var parentPoolId = pool.parentPool;
		checkoutInstance(parentPoolId, pool._id, 'reserved for app pool', function(err, instance) {
			if (err) {
				console.log('[' + pname + '] ' + 'Failed to check out instance from parent pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '): ' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (!instance) {
				if (callback) {
					callback(null, null);
				}
				return;
			}
			if (callback) {
				callback(null, instance);
			}
		});
	} else {
		if (callback) {
			callback('Unsupported pool type: ' + pool.type, null);
		}
	}
}

function submitRequestForNewInstance(pool, callback) {
	checkoutInstanceFromParentPool(pool, function(err, parentInstance) {
		if (err) {
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!parentInstance) {
			console.log('[' + pname + '] ' + 'No available instance in parent pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ').');
			return;
		}
		
		var provider = pool.provider[0];
		var pooler = require('./poolers/' + provider.type + '/pooler.js');
		var properties = pooler.generateRequestContent(pool);
		if (pool.type == 'noapp') {
			//
		} else if (pool.type == 'app') {
			var topoDoc = JSON.parse(parentInstance.properties);
			properties.environment = topoDoc.name;
		} else {
			console.log('[' + pname + '] ' + 'Unsupported type: ' + pool.type);
			return;
		}
		createInstance(pool, parentInstance._id, properties, function(err, instance) {
			if (err) {
				if (callback) {
					callback(err, null);
				}
				return;
			}
			console.log('[' + pname + '] ' + 'Creating instance for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') with properties: ' + JSON.stringify(properties));
			pooler.createPoolInstance(provider, pool.type, properties, function(err, trackingId, trackingUrl) {
				if (err) {
					deleteInstance(instance._id);
					return;
				}
				InstanceModel.findByIdAndUpdate(instance._id, { trackingId: trackingId, trackingUrl: trackingUrl }, function(err, updatedInst) {
					if (err) {
						if (callback) {
							callback(err, null);
						}
						return;
					}
					console.log('[' + pname + '] ' + 'New instance has been created successfuly for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') with properties: ' + JSON.stringify(properties));
					if (callback) {
						callback(null, updatedInst);
					}
				});
			});
		});
	});
}

function createNewInstancesIfNeeded(pool, callback) {
	InstanceModel.count({ poolRef: pool._id, status: 'INITIALIZING' }, function(err, queueCnt) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when counting request for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		InstanceModel.count({ poolRef: pool._id, status: 'FAULTED' }, function(err, faultedCnt) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when counting faulted instances for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			InstanceModel.count({ poolRef: pool._id, status: 'AVAILABLE' }, function(err, poolAvailable) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when counting available instances for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
					if (callback) {
						callback(err, null);
					}
					return;
				}
				InstanceModel.count({ poolRef: pool._id, status: 'CHECKED_OUT' }, function(err, checkedOutCnt) {
					if (err) {
						console.log('[' + pname + '] ' + 'Error when counting checked out instances for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
						if (callback) {
							callback(err, null);
						}
						return;
					}
					
					console.log('[' + pname + '] ' + 'Pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') c/a/q/f status: ' + checkedOutCnt + ' / ' + poolAvailable + ' / ' + queueCnt + ' / ' + faultedCnt);
					
					var needToCreate = pool.poolMinAvailable - (poolAvailable + queueCnt);
					if (needToCreate > 0) {
						var totalInstCnt = poolAvailable + checkedOutCnt + faultedCnt;
						if (totalInstCnt + queueCnt + needToCreate > pool.poolMaxTotal) {
							needToCreate = pool.poolMaxTotal - (totalInstCnt + queueCnt);
							if (needToCreate <= 0) {
								return console.log('[' + pname + '] ' + 'Reaches max instance count, No need to create more instances.');
							}
						}
						console.log('[' + pname + '] ' + 'Need to create ' + needToCreate + ' more instance(s) for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ').');
						for (i = 0; i < needToCreate; i++) {
							submitRequestForNewInstance(pool, callback);
						}
					} else {
						return console.log('[' + pname + '] ' + 'Still have available or queued instance(s) for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '), no need to create more instances.');
					}
				});
			});
		});
	});
}
exports.createNewInstancesIfNeeded = createNewInstancesIfNeeded;

function processRequestIfNeeded(pool, callback) {
	InstanceModel.find({ poolRef: pool._id, status: 'INITIALIZING' }, function(err, instances) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding instances which are initializing for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!instances || instances.length < 1) {
			console.log('[' + pname + '] ' + 'No instance waiting to initialize for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') yet.');
			return;
		}
		instances.forEach(function(instance) {
			if (!instance.trackingId) {
				console.log('[' + pname + '] ' + 'The instance(id:' + instance._id + ') is still initializing, waiting ...');
				return;
			}

			var provider = pool.provider[0];
			var properties = JSON.parse(instance.properties);
			var pooler = require('./poolers/' + provider.type + '/pooler.js');
			
			pooler.checkPoolInstanceStatus(provider, pool.type, instance.trackingId, properties, function(err, online) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when checking instance status: ' + err);
					if (err.result == 'FAULTED') {
						InstanceModel.findByIdAndUpdate(instance._id, { status: err.result }, function(err, updatedInst) {
							if (err) {
								if (callback) {
									callback(err, null);
								}
								return;
							}
							console.log('[' + pname + '] ' + 'Failed to create new instance pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ')');
							if (callback) {
								callback(null, updatedInst);
							}
						});
					}
					return;
				}
				if (!online) {
					return console.log('[' + pname + '] ' + "New instance is not ready for pool " + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') yet.');
				}
				console.log('[' + pname + '] ' + "New instance goes online for pool " + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ')');
				InstanceModel.findByIdAndUpdate(instance._id, { status: 'AVAILABLE' }, function(err, updatedInst) {
					if (err) {
						if (callback) {
							callback(err, null);
						}
						return;
					}
					console.log('[' + pname + '] ' + 'New instance has been created successfuly for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '): ' + JSON.stringify(properties));
					if (callback) {
						callback(null, updatedInst);
					}
				});
			});
		});
	});
}
exports.processRequestIfNeeded = processRequestIfNeeded;

function createInstance(pool, parentInstanceId, properties, callback) {
	var instance = new InstanceModel({
		name: pool.name + '-inst-' + generateDatetime(),
		type: pool.type,
		poolRef: pool._id,
		parentInstance: parentInstanceId,
		properties: JSON.stringify(properties),
		status: 'INITIALIZING',
		creationDate: (new Date()).toISOString(),
	});
	instance.save(function(err, doc) {
		if (err) {
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (callback) {
			callback(null, doc);
		}
	});//instance.save
}
exports.createInstance = createInstance;

function checkoutInstance(poolId, user, comment, callback) {
	console.log('[' + pname + '] ' + 'User ' + user + ' is checking out instance from pool (id: ' + poolId + ') with comment: ' + comment);
	InstanceModel.findOne({ poolRef: poolId, status: 'AVAILABLE' }, function(err, inst) {
		if (err) {
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!inst) {
			console.log('[' + pname + '] ' + 'No available instance in pool (id: ' + poolId + ')');
			if (callback) {
				callback(null, null);
			}
			return;
		}
		InstanceModel.findByIdAndUpdate(inst._id, { status: 'CHECKED_OUT', checkoutUser: user, checkoutDate: (new Date()).toISOString(), checkoutComment: comment }, function(err, updatedDoc) {
			if (err) {
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (callback) {
				callback(null, updatedDoc);
			}
		});
	});
}
exports.checkoutInstance = checkoutInstance;

function onInstanceDeletedInPooler(instance, callback) {
	InstanceModel.findByIdAndRemove(instance._id, function(err, deletedInstance) {
		if (err) {
			if (callback) {
				callback(err);
			}
			return;
		}
		if (!deletedInstance) {
			console.log('[' + pname + '] ' + 'Cannot find the instance ' + instance.name + '(id: ' + instance._id + ') to be deleted, it should be gone already.');
			if (callback) {
				callback(null, true);
			}
			return;
		}
		var parentInstanceId = deletedInstance.parentInstance;
		if (!parentInstanceId || parentInstanceId == 'NA') {
			console.log('[' + pname + '] ' + 'No parent instance found of instance ' + instance.name + '(id: ' + instance._id + '), skipping delete parent instance.');
			if (callback) {
				callback(null, true);
			}
			return;
		}
		deleteInstance(parentInstanceId, null);
	});
}

function deleteInstance(instanceId, callback) {
    InstanceModel.findById(instanceId, function(err, instance) {
		if (err) {
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!instance) {
			if (callback) {
				callback(null, null);
			}
			return;
		}
		InstanceModel.find({ parentInstance: instance._id }, function(err, childInstances) {
			if (err) {
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (childInstances && childInstances.length > 0) {
				if (callback) {
					callback('Cannot delete instance because it has child instance.', null);
				}
				return;
			}
			var pool = instance.poolRef;
			var provider = pool.provider[0];
			var pooler = require('./poolers/' + provider.type + '/pooler.js');
			console.log('[' + pname + '] ' + 'Deleting instance ' + instance.name + '(id: ' + instance._id + ') from pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ').');
			if (instance.status == 'INITIALIZING' && !instance.trackingId) {
				onInstanceDeletedInPooler(instance, function(err, deleted) {
					if (err) {
						if (callback) {
							callback(err, null);
						}
						return;
					}
					if (callback) {
						callback(null, deleted ? instance : null);
					}
				});
			} else {
				pooler.deletePoolInstance(provider, pool.type, instance, function(err, deleted) {
					if (err) {
						if (callback) {
							callback(err, null);
						}
						return;
					}
					if (!deleted) {
						if (callback) {
							callback('Failed to delete instance.', null);
						}
						return;
					}
					onInstanceDeletedInPooler(instance, function(err, deleted) {
						if (err) {
							if (callback) {
								callback(err, null);
							}
							return;
						}
						if (callback) {
							callback(null, deleted ? instance : null);
						}
					});
				});
			}
		});
    }).populate('poolRef');
}
exports.deleteInstance = deleteInstance;
