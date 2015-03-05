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

var log = require('./utils/logger').getLogger('Pool Monitor');

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
			log.debug("Checking out instance from parent pool ...")
			if (callback) {
				callback(null, instance);
			}
		});
	} else {
		var error = "Unsupported pool type: " + pool.type;
		log.error(error);
		if (callback) {
			callback(error, null);
		}
	}
}

function submitRequestForNewInstance(pool, callback) {
	checkoutInstanceFromParentPool(pool, function(err, parentInstance) {
		if (err) {
			log.error("Failed to check out instance from parent pool " + pool.name + "(id: " + pool._id + ", type: " + pool.type + "): " + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!parentInstance) {
			log.warn("No available instance in parent pool " + pool.name + "(id: " + pool._id + ", type: " + pool.type + ").");
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
			var error = "Unsupported pool type: " + pool.type;
			log.error(error);
			return;
		}
		createInstance(pool, parentInstance._id, properties, function(err, instance) {
			if (err) {
				if (callback) {
					callback(err, null);
				}
				return;
			}
			log.debug('Creating instance for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') with properties: ' + JSON.stringify(properties));
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
					log.info("New instance has been created successfuly for pool " + pool.name + "(id: " + pool._id + ", type: " + pool.type + ")");
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
			log.error('Error when counting request for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		InstanceModel.count({ poolRef: pool._id, status: 'FAULTED' }, function(err, faultedCnt) {
			if (err) {
				log.error('Error when counting faulted instances for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			InstanceModel.count({ poolRef: pool._id, status: 'AVAILABLE' }, function(err, poolAvailable) {
				if (err) {
					log.error('Error when counting available instances for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
					if (callback) {
						callback(err, null);
					}
					return;
				}
				InstanceModel.count({ poolRef: pool._id, status: 'CHECKED_OUT' }, function(err, checkedOutCnt) {
					if (err) {
						log.error('Error when counting checked out instances for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
						if (callback) {
							callback(err, null);
						}
						return;
					}
					
					log.verbose('Pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') c/a/q/f status: ' + checkedOutCnt + ' / ' + poolAvailable + ' / ' + queueCnt + ' / ' + faultedCnt);
					
					var needToCreate = pool.poolMinAvailable - (poolAvailable + queueCnt);
					if (needToCreate > 0) {
						var totalInstCnt = poolAvailable + checkedOutCnt + faultedCnt;
						if (totalInstCnt + queueCnt + needToCreate > pool.poolMaxTotal) {
							needToCreate = pool.poolMaxTotal - (totalInstCnt + queueCnt);
							if (needToCreate <= 0) {
								return log.verbose('Reaches max instance count, No need to create more instances.');
							}
						}
						log.info('Pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') c/a/q/f status: ' + checkedOutCnt + ' / ' + poolAvailable + ' / ' + queueCnt + ' / ' + faultedCnt);
						log.info('Need to create ' + needToCreate + ' more instance(s) for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ').');
						for (i = 0; i < needToCreate; i++) {
							setTimeout(function() {
								submitRequestForNewInstance(pool, callback);
							}, i * 1000);
						}
					} else {
						return log.verbose('Still have available or queued instance(s) for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '), no need to create more instances.');
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
			log.error('Error when finding instances which are initializing for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '):' + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!instances || instances.length < 1) {
			log.verbose('No instance waiting to initialize for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') yet.');
			return;
		}
		instances.forEach(function(instance) {
			if (!instance.trackingId) {
				log.verbose('The instance(id:' + instance._id + ') is still initializing, waiting ...');
				return;
			}

			var provider = pool.provider[0];
			var properties = JSON.parse(instance.properties);
			var pooler = require('./poolers/' + provider.type + '/pooler.js');
			
			pooler.checkPoolInstanceStatus(provider, pool.type, instance.trackingId, properties, function(err, online) {
				if (err) {
					log.error('Error when checking instance status: ' + err);
					if (err.result == 'FAULTED') {
						InstanceModel.findByIdAndUpdate(instance._id, { status: err.result }, function(err, updatedInst) {
							if (err) {
								log.error("Error when marking instance as " + err.result + ": " + err);
								if (callback) {
									callback(err, null);
								}
								return;
							}
							log.error('Failed to create new instance pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ')');
							if (callback) {
								callback(null, updatedInst);
							}
						});
					}
					return;
				}
				if (!online) {
					return log.verbose("New instance is not ready for pool " + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ') yet.');
				}
				log.info("New instance goes online for pool " + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + ')');
				InstanceModel.findByIdAndUpdate(instance._id, { status: 'AVAILABLE' }, function(err, updatedInst) {
					if (err) {
						log.error("Error when marking instance as AVAILABLE: " + err);
						if (callback) {
							callback(err, null);
						}
						return;
					}
					log.debug('New instance has been created successfuly for pool ' + pool.name + '(id: ' + pool._id + ', type: ' + pool.type + '): ' + JSON.stringify(properties));
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
			log.error("Error when creating instance data in database: " + err)
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

function fixInstanceProperties(instance) {
	return {
		_id: instance._id,
		checkoutDate: instance.checkoutDate,
		checkoutUser: instance.checkoutUser,
		checkoutComment: instance.checkoutComment,
		creationDate: instance.creationDate,
		description: instance.description,
		name: instance.name,
		poolRef: instance.poolRef,
		props: JSON.parse(instance.properties),
		parentInstance: instance.parentInstance,
		status: instance.status,
		trackingId: instance.trackingId,
		trackingUrl: instance.trackingUrl,
		type: instance.type
	};
}

function checkoutInstance(poolId, user, comment, callback) {
	log.info('User ' + user + ' is checking out instance from pool (id: ' + poolId + ') with comment: ' + comment);
	InstanceModel.findOne({ poolRef: poolId, status: 'AVAILABLE' }, function(err, inst) {
		if (err) {
			log.error("Error when finding available instance in pool " + poolId + ": " + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!inst) {
			log.warn("No available instance in pool " + poolId);
			if (callback) {
				callback(null, null);
			}
			return;
		}
		InstanceModel.findByIdAndUpdate(inst._id, { status: 'CHECKED_OUT', checkoutUser: user, checkoutDate: (new Date()).toISOString(), checkoutComment: comment }, function(err, updatedDoc) {
			if (err) {
				log.error("Error when updating instance data during checkout:" + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (callback) {
				callback(null, fixInstanceProperties(updatedDoc));
			}
		});
	});
}
exports.checkoutInstance = checkoutInstance;

function deleteInstanceInDatabase(instance, callback) {
	InstanceModel.findByIdAndRemove(instance._id, function(err, deletedInstance) {
		if (err) {
			log.error("Error when removing instance " + instance.name + "(id: " + instance._id + ") data in database: " + err);
			if (callback) {
				callback(err);
			}
			return;
		}
		if (!deletedInstance) {
			log.warn("Cannot find the instance " + instance.name + "(id: " + instance._id + ") to be deleted, it should be gone already.");
			if (callback) {
				callback(null, true);
			}
			return;
		}
		var parentInstanceId = deletedInstance.parentInstance;
		if (!parentInstanceId || parentInstanceId == 'NA') {
			log.info("No parent instance found of instance " + instance.name + "(id: " + instance._id + "), skipping delete parent instance.");
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
			log.error("Error when finding instance " + instanceId + ": " + err);
			if (callback) {
				callback(err, null);
			}
			return;
		}
		if (!instance) {
			log.warn("Instance " + instanceId + " no found when trying to delete, should be gone already.")
			if (callback) {
				callback(null, null);
			}
			return;
		}
		InstanceModel.find({ parentInstance: instance._id }, function(err, childInstances) {
			if (err) {
				log.error("Error when finding child instance(s) of instance " + instance.name + "(id: " + instance._id + "): " + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (childInstances && childInstances.length > 0) {
				var message = "Cannot delete instance " + instance.name + "(id: " + instance._id + ") because it has " + childInstances.length + " child instance(s).";
				log.warn(message);
				if (callback) {
					callback(message, null);
				}
				return;
			}
			var pool = instance.poolRef;
			var provider = pool.provider[0];
			var pooler = require('./poolers/' + provider.type + '/pooler.js');
			log.info("Deleting instance " + instance.name + "(id: " + instance._id + ") from pool " + pool.name + "(id: " + pool._id + ", type: " + pool.type + ").");
			if (instance.status == 'INITIALIZING' && !instance.trackingId) {
				log.info("Instance " + instance.name + "(id: " + instance._id + ") is INITIALIZING but no tracking ID assign, can be deleted directly.");
				deleteInstanceInDatabase(instance, function(err, deleted) {
					if (err) {
						if (callback) {
							callback(err, null);
						}
						return;
					}
					if (callback) {
						callback(null, deleted ? fixInstanceProperties(instance) : null);
					}
				});
			} else {
				pooler.deletePoolInstance(provider, pool.type, instance, function(err, deleted) {
					if (err) {
						log.error("Error when deleting instance " + instance.name + "(id: " + instance._id + ") from pooler:" + err);
						if (callback) {
							callback(err, null);
						}
						return;
					}
					if (!deleted) {
						var error = "Failed to delete instance " + instance.name + "(id: " + instance._id + ") from pooler.";
						log.error(error);
						if (callback) {
							callback(error, null);
						}
						return;
					}
					deleteInstanceInDatabase(instance, function(err, deleted) {
						if (err) {
							if (callback) {
								callback(err, null);
							}
							return;
						}
						if (callback) {
							callback(null, deleted ? fixInstanceProperties(instance) : null);
						}
					});
				});
			}
		});
    }).populate('poolRef');
}
exports.deleteInstance = deleteInstance;
