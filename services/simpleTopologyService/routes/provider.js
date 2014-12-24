/**
*  Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*	 http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

var Provider = require('../models/providermodel');

function listProvidersView(req, res) {
	res.sendfile('public/html/settings/providers.html');
};
exports.findAllView = listProvidersView;

function listAllProviders(req, res) {
	Provider.find({}, function(err, docs) {
		if (err) {
			console.log('Error when listing providers: ' + err);
			return res.send(err, 500);
		}
		return res.json(!docs ? '[]' : docs);
	});
}
exports.findAll = listAllProviders;

function getProviderById(req, res) {
	Provider.findById(req.params.id, function(err, doc) {
		if (err) {
			console.log('Error when read provider: ' + err);
			return res.send(err, 500);
		}
		if (doc) {
			return res.json(doc);
		}
		return res.send(404);
	});
}
exports.find = getProviderById;

function createProvider(req, res) {
	var provider = req.body;
	Provider.create(provider, function(err, doc) {
		if (err) {
			console.log('Error when creating provider: ' + err);
			return res.send(err, 400);
		}
		return res.json(doc);
	});
};
exports.create = createProvider;

function updateProvider(req, res) {
	var provider = req.body;
	Provider.findByIdAndUpdate(req.params.id, provider, function(err, doc) {
		if (err) {
			console.log('Error when updating provider: ' + err);
			return res.send(err, 400);
		}
		return res.json(doc);
	});
}
exports.update = updateProvider;

function deleteProvider(req, res) {
	Provider.findByIdAndRemove(req.params.id, function(err, doc) {
		if (err) {
			console.log('Error when deleting provider: ' + err);
			return res.send(500, err);
		}
		return res.send(doc ? 200 : 404);
	})
}
exports.remove = deleteProvider;
