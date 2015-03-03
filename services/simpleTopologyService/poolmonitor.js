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
var monitorLib = require('./poolmonitor_lib');

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
	}
);

console.log('[' + pname + '] ' + 'Monitoring process is running! ');

var timer1 = setInterval(function() {
	PoolModel.find({}, function(err, pools) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding pool: ' + err);
//			return clearInterval(timer1);
			return;
		}
		pools.forEach(function(pool) {
			monitorLib.createNewInstancesIfNeeded(pool, function(err, request) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when creating instance(s) when needed: ' + err);
//					return clearInterval(timer1);
					return;
				}
			});
		});
	});//PoolModel.find
}, 30000); //every 30 seconds

var timer2 = setInterval(function() {
	PoolModel.find({}, function(err, pools) {
		if (err) {
			console.log('[' + pname + '] ' + 'Error when finding pool: ' + err);
//			return clearInterval(timer2);
			return;
		}
		pools.forEach(function(pool) {
			monitorLib.processRequestIfNeeded(pool, function(err) {
				if (err) {
					console.log('[' + pname + '] ' + 'Error when processing request(s) when needed: ' + err);
//					return clearInterval(timer2);
					return;
				}
			});
		});
	});//PoolModel.find
}, 30000); //every 30 seconds
