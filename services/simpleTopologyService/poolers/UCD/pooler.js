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
var request = require('request');
//Hack for self-signed certificate
request.defaults({
	strictSSL: false,
	rejectUnauthorized: false
});

//Hack for self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

UCD_ADAPTER = 'https://' + nconf.get('STS_HOSTNAME') + ':' + nconf.get('PORT');

function generateDatetime() {
	var time = (new Date()).toISOString();
	var str = time.replace(/[\-:T\.Z]*/gi, '')
//	str = str.substring(0, str.indexOf('.'));
	return str;
}

function generateRequestContent(pool) {
	var props = JSON.parse(pool.properties);
	if (pool.type == 'noapp') {
		return {
			name: pool.name + '-env-' + generateDatetime(),
			application: props.appName,
			baseResource: '/STS',
			blueprint: props.blueprintName,
			lockSnapshots: false,
			requireApprovals: false,
			nodeProperties: props.nodeProperties
		};
	} else if (pool.type == 'app') {
		return {
			application: props.appName,
			applicationProcess: props.appProcessName,
			onlyChanged: false,
			properties: props.processProperties,
			snapshot: props.snapshotName
		};
	} else {
		return {};
	}
}
exports.generateRequestContent = generateRequestContent;

var pname='Pooler - UCD';

function createPoolInstance(provider, type, content, callback) {
	if (type == 'noapp') {
		//console.log('[' + pname + '] ' + 'Creating UCD environment with topology document: ' + JSON.stringify(content));
		console.log('[' + pname + '] ' + 'Creating UCD environment: ');
		createEnvironment(provider, content, function(err, uuid) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when creating UCD environment: ' + err);
				if (callback) {
					callback(err, null, null);
				}
				return;
			}
			console.log('[' + pname + '] ' + 'New environment(id:' + uuid + ') has been created.');
			var teams = nconf.get('TEAMS');
			console.log('[' + pname + '] ' + 'About to add Environment to team ' + teams);
			console.log('[' + pname + '] ' + 'Application name ' + content.application);
			console.log('[' + pname + '] ' + 'Environment name ' + content.name);
			var team_array = teams.split(':');
			addEnvironmentToTeams(provider, content.application, content.name, team_array, function(err) {
				if(err) {
					console.log('[' + pname + '] ' + 'Error when add Environment to Teams: ' + err);
				}
			});
			if (callback) {
				var url = provider.server + '/#environment/' + uuid;
				callback(null, uuid, url);
			}
		});
	} else if (type == 'app') {
		console.log('[' + pname + '] ' + 'Running UCD application process with request: ' + JSON.stringify(content));
		requestApplicationProcess(provider, content, function (err, body) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when running UCD application process: ' + err);
				if (callback) {
					callback(err, null, null);
				}
				return;
			}
			var uuid = JSON.parse(body).requestId;
			if (callback) {
				var url = provider.server + '/#applicationProcessRequest/' + uuid;
				callback(null, uuid, url);
			}
		});
	} else {
		
	}
}
exports.createPoolInstance = createPoolInstance;

function checkPoolInstanceStatus(provider, type, uuid, content, callback) {
	if (type == 'noapp') {
		var appName = content.application;
		var envName = content.name;
		console.log('[' + pname + '] ' + "Checking UCD status of environment '" + envName + "' in application '" + appName + "'");
		pingEnvironment(provider, appName, envName, function(err, online) {
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
	} else if (type == 'app') {
		var appName = content.application;
		var requestId = uuid;
		console.log('[' + pname + '] ' + "Checking UCD status of application request '" + requestId + "' in application '" + appName + "'");
        getRequestStatus(provider, appName, requestId, function(err, online) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when checking UCD application process status: ' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (callback) {
				callback(null, online);
			}
        });
	} else {
		
	}
}
exports.checkPoolInstanceStatus = checkPoolInstanceStatus;

function deletePoolInstance(provider, type, instance, callback) {
	var props = JSON.parse(instance.properties);
	if (type == 'noapp') {
		var appName = props.application;
		var envName = props.name;
		deleteEnvironment(provider, appName, envName, function(err, deleted) {
			if (err) {
				console.log('[' + pname + '] ' + 'Error when deleting UCD environment: ' + err);
				if (callback) {
					callback(err, null);
				}
				return;
			}
			if (callback) {
				callback(null, deleted);
			}
		});
	} else if (type == 'app') {
		if (callback) {
			callback(null, true);
		}
	} else {
		
	}
}
exports.deletePoolInstance = deletePoolInstance;

function createEnvironment(provider, topoDoc, callback) {
	request.put({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + topoDoc.application + '/environments',
		headers: {
			'UCD_SERVER': provider.server,
			'UCD_USERNAME': provider.username,
			'UCD_PASSWORD': provider.password,
			'content-type': 'application/json'
		},
		body: JSON.stringify(topoDoc)
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode != 201) {
			return callback(JSON.stringify(resp), null);
		}
		callback(null, body);
	});
}

function pingEnvironment(provider, appName, envName, callback) {
	request.get({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + appName + '/environments/' + envName + '/ping',
		headers: {
			'UCD_SERVER': provider.server,
			'UCD_USERNAME': provider.username,
			'UCD_PASSWORD': provider.password
		}
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode != 200) {
			return callback(JSON.stringify(resp), null);
		}
		var envStat = JSON.parse(body);
		callback(null, envStat.online);
	});
}

function addEnvironmentToTeams(provider, app, env, teams, callback) {
	teams.forEach(function(team) {
		console.log('add to team:' + team);
		addEnvironmentToTeam(provider, app, env, team, callback);
	});
}

function addEnvironmentToTeam(provider, app, env, team, callback) {
	var team_json = {team: ""};
	team_json["team"] = team;
	request.put({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + app + '/environments/' + env,
		headers: {
			'UCD_SERVER': provider.server,
			'UCD_USERNAME': provider.username,
			'UCD_PASSWORD': provider.password,
			'content-type': 'application/json'
		},
		body: JSON.stringify(team_json)
	}, function(err, resp, body) {
		if (err) {
			return callback(err);
		}
		if (resp.statusCode != 201) {
			return callback(JSON.stringify(resp));
		}
		callback(null);
	});
}

function deleteEnvironment(provider, appName, envName, callback) {
	request.del({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + appName + '/environments/' + envName,
		headers: {
			'UCD_SERVER': provider.server,
			'UCD_USERNAME': provider.username,
			'UCD_PASSWORD': provider.password
		}
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode == 404) {
			return callback(null, true);
		}
		if (resp.statusCode != 202) {
			return callback(JSON.stringify(resp), null);
		}
		callback(null, true);
	});
}

function requestApplicationProcess(provider, requestcontent, callback) {
	request.put({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + requestcontent.application + '/requestApplicationProcess',
		headers: {
			'UCD_SERVER': provider.server,
			'UCD_USERNAME': provider.username,
			'UCD_PASSWORD': provider.password,
			'content-type': 'application/json'
		},
		body: JSON.stringify(requestcontent)
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode != 201) {
			return callback(JSON.stringify(resp), null);
		}
		callback(null, body);
	});
}

function getRequestStatus(provider, appname, requestId, callback) {
	request.get({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + appname + '/requestApplicationProcess/' +requestId,
		headers: {
			'UCD_SERVER': provider.server,
			'UCD_USERNAME': provider.username,
			'UCD_PASSWORD': provider.password,
			'content-type': 'application/json'
		}
		
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode != 200) {
			return callback(JSON.stringify(resp), null);
		}
		var reqStat = JSON.parse(body);
		if (reqStat.result == 'FAULTED') {
			return callback(reqStat, null);
		}
		callback(null, reqStat.result == 'SUCCEEDED');
	});
}
