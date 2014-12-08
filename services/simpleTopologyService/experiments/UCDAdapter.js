var request = require('request');
//Hack for self-signed certificate
request.defaults({
    strictSSL: false,
    rejectUnauthorized: false
});

// Hack for self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

UCD_ADAPTER = 'http://localhost:64869';

exports.requestApplicationProcess = function(provider, requestcontent, callback) {
	request.put({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + requestcontent.application + '/requestApplicationProcess',
		headers: {
			'UCD_SERVER': provider.UCD_SERVER,
			'UCD_USERNAME': provider.UCD_USERNAME,
			'UCD_PASSWORD': provider.UCD_PASSWORD,
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

exports.getRequestStatus = function(provider, appname, requestId, callback) {
	request.get({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + appname + '/requestApplicationProcess/' +requestId,
		headers: {
			'UCD_SERVER': provider.UCD_SERVER,
			'UCD_USERNAME': provider.UCD_USERNAME,
			'UCD_PASSWORD': provider.UCD_PASSWORD,
			'content-type': 'application/json'
		}
		
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode != 200) {
			return callback(JSON.stringify(resp), null);
		}
		callback(null, body);
	});
}


exports.createEnvironment = function(provider, topoDoc, callback) {
	request.put({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + topoDoc.application + '/environments',
		headers: {
			'UCD_SERVER': provider.UCD_SERVER,
			'UCD_USERNAME': provider.UCD_USERNAME,
			'UCD_PASSWORD': provider.UCD_PASSWORD,
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

exports.addEnvironmentToTeams = function(provider, app, env, teams, callback) {
	teams.forEach(function(team) {
		console.log('add to team:' + team);
		addEnvironmentToTeam(provider, app, env, team, callback);
	});
}

addEnvironmentToTeam = function(provider, app, env, team, callback) {
	var team_json = {team: ""};
	team_json["team"] = team;
//	var json_string = JSON.stringify(team_json);
//	console.log('json string as request body:'+json_string);
	request.put({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + app + '/environments/' + env,
		headers: {
			'UCD_SERVER': provider.UCD_SERVER,
			'UCD_USERNAME': provider.UCD_USERNAME,
			'UCD_PASSWORD': provider.UCD_PASSWORD,
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

exports.pingEnvironment = function(provider, appName, envName, callback) {
	request.get({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + appName + '/environments/' + envName + '/ping',
		headers: {
			'UCD_SERVER': provider.UCD_SERVER,
			'UCD_USERNAME': provider.UCD_USERNAME,
			'UCD_PASSWORD': provider.UCD_PASSWORD
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

exports.deleteEnvironment = function(provider, appName, envName, callback) {
	request.del({
		url: UCD_ADAPTER + '/rest/ucd/applications/' + appName + '/environments/' + envName,
		headers: {
			'UCD_SERVER': provider.UCD_SERVER,
			'UCD_USERNAME': provider.UCD_USERNAME,
			'UCD_PASSWORD': provider.UCD_PASSWORD
		}
	}, function(err, resp, body) {
		if (err) {
			return callback(err, null);
		}
		if (resp.statusCode != 202) {
			return callback(JSON.stringify(resp), null);
		}
		callback(null, true);
	});
}
