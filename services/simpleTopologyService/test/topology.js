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
var http = require('http');
http.globalAgent.maxSockets = 100;
var assert = require('assert');
var jq = require('jQuery');
var fs = require('fs');
var nconf = require('nconf');
request = require('request-json');

nconf.argv()
        .env()
        .file({ file: './config.json'});

var topologyPort = nconf.get('PORT');
var topologyHostname = nconf.get('HOSTNAME');
var client = request.newClient('http://localhost:' + topologyPort);
var today = Date.now();
var data = {
                name: 'test-topology-'+today,
                description: 'testing topology creation update and deletion on '+today,
                referenceURL: 'http://jazz.net/testtopology',
                solution: 'CLM'
};
var invaliddataset = [{
                name: 'test-invalid-topology-invalidURL'+today,
                description: 'testing invalid topology creation update and deletion on '+today,
                referenceURL: 'not a URL',
                solution: 'CLM'}];

describe('SimpleTopologyService Webui Tests', function(){
  describe('GET /topology/topologies', function(){
    it('should return a 200 response code', function(done){
      http.get({ hostname: topologyHostname, path: '/topology/topologies', port: topologyPort }, function(res){
	assert.equal(res.statusCode,
           200,
           'Expected: 200 Actual: ' + res.statusCode );
      	done();
      })
    })
  })
  describe('GET /topology/topologies/new', function(){
    it('should return a 200 response code', function(done){
      http.get({ hostname: topologyHostname, path: '/topology/topologies/new', port: topologyPort }, function(res){
        assert.equal(res.statusCode,
           200,
           'Expected: 200 Actual: ' + res.statusCode );
        done();
      })
    })
  })
})

describe('SimpleTopologyService Topology API v1', function(){
  //create a record first
  before(function(done){
               client.post('/api/v1/topology/topologies', data, function(err, res, body) {
                        console.log('SimpleTopologyService Topology API v1.before: created test data');
                        done();
                });
  })
  after(function(done){
		remove = nconf.get('REMOVE-TEST-DATA');
		if (remove == 'false'){
			console.log('SimpleTopologyService Topology API v1.after: keeping test data');
			done();
		}else{
                	client.del('/api/v1/topology/topologies/'+data.name, function(err, res, body){
                        	console.log('SimpleTopologyService Topology API v1.after: removed test data');
                        	done();
               		});
		}
  })

  describe('GET /api/v1/topology/topologies', function(){
    it('should return a 200 response', function(done){
      http.get({ hostname: topologyHostname, path: '/api/v1/topology/topologies', port: topologyPort }, function(res){
        assert.equal(res.statusCode, 
           200,
           'Expected: 200 Actual: ' + res.statusCode );
        done();
      })
    })
    it('should return JSON', function(done){
      http.get({ hostname: topologyHostname, path: '/api/v1/topology/topologies', port: topologyPort }, function(res){
        assert.equal(res.headers["content-type"], 
           "application/json; charset=utf-8", 
           'Expected: application/json; charset=utf-8 Actual: ' + res.headers["content-type"]);
        done();
      })
    })
  })
  describe('POST /api/v1/topology/topologies', function(){
	newdata = {
                        name: 'test-topology-new'+today,
                        description: 'testing a new topology creation update and deletion on '+today,
                        referenceURL: 'http://jazz.net/testtopologynew',
                        solution: 'CLM'
        };
	it('should return at 200 response code on success and return json', function(done){
		client.post('/api/v1/topology/topologies', newdata, function(err, res, body) {
			assert.equal(res.statusCode,200,'Expected: 200 Actual: ' + res.statusCode );
			assert.equal(
				res.headers["content-type"],
		           	"application/json; charset=utf-8",
           			'Expected: application/json; charset=utf-8 Actual: ' + res.headers["content-type"]);
			done();
		});
	})
        it('should return 400 response code if I try to create a document with the same name', function(done){
                client.post('/api/v1/topology/topologies', newdata, function(err, res, body) {
                        assert.equal(res.statusCode,400,'Expected: 400 Actual: ' + res.statusCode );
                        done();
                });
        })
	it('should be able to locate new topology record I just created and get 200 status code with json', function(done){
      		client.get('/api/v1/topology/topologies/'+newdata.name, function(err,res, body){
			assert.equal(res.statusCode, 200,'Expected: 200 Actual: ' + res.statusCode );
			assert.equal(
                                res.headers["content-type"],
                                "application/json; charset=utf-8",
                                'Expected: application/json; charset=utf-8 Actual: ' + res.headers["content-type"]);
			done();
		});
	})
	it('should be able to delete new topology record and recieve 200 response code in response',function(done){
 		remove = nconf.get('REMOVE-TEST-DATA');
                if (remove == 'false'){
                        console.log('SimpleTopologyService Topology API v1: POST keeping test data');
			done();
		}else{
			client.del('/api/v1/topology/topologies/'+newdata.name, function(err, res, body){
                        	assert.equal(res.statusCode, 200,'Expected: 200 Actual: ' + res.statusCode );
				done();
			});
		}
	})
        it('should no longer be able to locate record of the topology I just removed so should recieve a 400 response code', function(done){
		remove = nconf.get('REMOVE-TEST-DATA');
                if (remove == 'false'){
                        done();
                }else{
			client.get('/api/v1/topology/topologies/'+newdata.name, function(err,res, body){
                        	assert.equal(res.statusCode, 404,'Expected: 404 Actual: ' + res.statusCode );
				done();
			});
		}
	})

        it('should return at 400 response code if there is a validation error', function(done){
		for (i in invaliddataset){	
		  invaliddata = invaliddataset[i];
                  client.post('/api/v1/topology/topologies', invaliddata, function(err, res, body) {
                        assert.equal(res.statusCode,400,'Expected: 400 for invalid data. Actual: ' + res.statusCode );
                        //done();
                  });
		}
		done();
        })
  })

  describe('GET /api/v1/topology/topologies:id', function(){
	var response;
	var body;
	before(function(done){
		client.get('/api/v1/topology/topologies/'+data.name, function(err, res, resbody){
			body = resbody;
                        done();
                });
	})
	it('topology name should be correct', function(){
		assert.equal(body.name, data.name,'Expected for name of topology to match.  EXPECTED:' + data.name + ' ACTUAL:' + body.name);	
	})
	it('topology should list of URIs for pools of this topology', function(){
		assert.notEqual(body.pools, undefined, "Expected list of URIs for pools but got " + data.pools);
	})
	it('topology should list of providers for this topology',function(){
		assert.notEqual(body.providers, undefined, "Expected list of providers " + data.providers);
	})
  })
  
  describe('PUT /api/v1/topology/topologies:id', function(){
	it('should return at 200 response code if a valid referenceURL is passed', function(done){
		data.referenceURL = 'http://www.google.com';
                client.put('/api/v1/topology/topologies/'+data.name, data, function(err, res, body) {
                	assert.equal(res.statusCode,200,'Expected: 200 Actual: ' + res.statusCode );
                      	assert.equal(body.referenceURL, 'http://www.google.com', 'Expected reference URL to be changedto www.google.com was Actual:' + body.referenceURL);
                        done();
             	});
	})
	it('should return at 400 response code if invalid data is passed', function(done){
		for (i in invaliddataset){
                	invaliddata = invaliddataset[i];
                  	client.put('/api/v1/topology/topologies/'+data.name, invaliddata, function(err, res, body) {
                        	assert.equal(res.statusCode,400,'Expected: 400 for invalid data. Actual: ' + res.statusCode + ' body ' + body);
                  	});
                }
                done();	
	})
	it('should return at 404 response code if the tasks does not exist', function(done){
	        client.put('/api/v1/topology/topologies/fakeid', data, function(err, res, body) {
	                assert.equal(res.statusCode,400,'Expected: 400 Actual: ' + res.statusCode );
			done();
		});	
	})
	it('can update pools with new pool URL', function(done){
		var updatedPools = ['/topology/pools/fakeid'];
		client.put('/api/v1/topology/topologies/'+data.name, {pools:['/topology/pools/fakeid']}, function(err, res, body) {
                        assert.equal(res.statusCode,200,'Expected: 200 Actual: ' + res.statusCode );
		        client.get('/api/v1/topology/topologies/'+data.name, function(err, res, body) {
                        	assert.deepEqual(body.pools, updatedPools, "Expected for pools to be updated.  Actual: " + body + " Expected " + updatedPools);
				done();
                	})
                });
		
	})
  })
})
