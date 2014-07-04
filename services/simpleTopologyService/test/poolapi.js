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
var assert = require('assert');
var fs = require('fs');
var nconf = require('nconf');
var request = require('request-json');
var today = Date.now();

nconf.argv().env().file({ file: './config.json'});

var topologyPort = nconf.get('PORT');
var topologyHostname = nconf.get('HOSTNAME');
var client = request.newClient('http://localhost:' + topologyPort);

describe('SimpleTopologyService::Pool API v1', function() {
    var newpool = {
        name: 'test-pool-new' + today,
        description: 'pool of test topology instances of the latest build',
        topologyRef: '',
        poolMinAvailable: 0,
        poolMaxTotal: 2,
        type: 'noapp'
    };
    var newpool_id;
    var newtop = {
      name: 'test-topology-new' + today,
      description: 'testing a new topology creation update and deletion on ' + today,
      referenceURL: 'http://jazz.net/testtopologynew'
    };
    var newtop_id;
    before(function(done) {
      client.post('/api/v1/topology/topologies', newtop, function(err, res, body) {
        newtop_id=body._id;
        newpool.topologyRef=newtop_id;
        client.post('/api/v1/topology/pools', newpool, function(err, res, body) {
            if (! err) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(
                res.headers['content-type'],
                    'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                assert.equal(body.poolMethod, 'basic', 'Expected:basic,Actual:' + body.poolMethod);
                assert.equal(body.available, 0, 'Expected 0 available instances');
                assert.equal(body.checkedout, 0, 'Expected 0 checked out instances');
                newpool_id=body._id; 
                done();
            }else {
                console.log('SimpleTopologyService Pool API v1.before:could not create test data for pool');
                console.log(err);
                assert.equal(err, undefined, 'could not create test pool');
                done();
            }
        });
        });
    });
    after(function(done) {
        remove = nconf.get('REMOVE-TEST-DATA');
        if (remove == 'false') {
            done();
        }else {
            client.del('/api/v1/topology/pools/' + newpool_id, function(err, res, body) {
            client.del('/api/v1/topology/topologies/' + newtop_id, function(err, res, body) {
                done();
            });
            });
        }
    });
    describe('GET /api/v1/topology/pools/:id', function() {
        it('should be able get created test data and a 200 response code and json', function(done) {
            client.get('/api/v1/topology/pools/' + newpool_id, function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                done();
            });
        });
    });
    describe('GET /api/v1/topology/pools', function() {
        it('should return a 200 response', function(done) {
            http.get({ hostname: topologyHostname, path: '/api/v1/topology/pools', port: topologyPort }, function(res) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                done();
            });
        });
        it('should return JSON', function(done) {
            http.get({ hostname: topologyHostname, path: '/api/v1/topology/pools', port: topologyPort }, function(res) {
                assert.equal(res.headers['content-type'],
                    'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                done();
            });
        });
    });
  describe('POST /api/v1/topology/pools', function() {
        it('should return 400 response code if I try to create a pool with the same name', function(done) {
            client.post('/api/v1/topology/pools', newpool, function(err, res, body) {
                assert.equal(res.statusCode, 400, 'Expected: 400 Actual: ' + res.statusCode);
                done();
            });
        });
        it('should return at 400 response code if there is a validation error', function(done) {
            var invalidPoolData = {
                        name: 'test-pool-new-invalid' + today,
                        description: 'invalid pool of test topology instances of the latest build',
                        topologyRef: 'not a topology id' 
                };
                client.post('/api/v1/topology/pools', invalidPoolData, function(err, res, body) {
                    assert.equal(res.statusCode, 400, 'Expected: 400 Actual: ' + res.statusCode);
                        done();
                });
        });
        it('should get 400 response code if attempt to set type to anything but latest and lastGood', function(done) {
            var invalidPoolDataType = {
                name: 'test-pool-invalid-type' + today,
                description: 'pool of test topology instances of the latest build',
                topologyRef: 'http://www.google.com',
                type: 'not app or noapp'
            };
            client.post('/api/v1/topology/pools', invalidPoolDataType, function(err, res, body) {
                    assert.equal(res.statusCode, 400, 'Expected: 400 Actual: ' + res.statusCode);
                    if (res.statusCode == 200) {
                                client.del('/api/v1/topology/pools/' + invalidPoolData.name, function(err, res, body) {
                                        done();
                                });
                    }else {
                        done();
                    }
            });
    });
  });
});
