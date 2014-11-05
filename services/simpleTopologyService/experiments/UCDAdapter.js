var request = require('request');
//Hack for self-signed certificate
request.defaults({
    strictSSL: false,
    rejectUnauthorized: false
});

// Hack for self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

UCD_ADAPTER = 'https://10.2.0.1:9443'

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