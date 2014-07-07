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
var pool_id=nconf.get('NOAPP_POOL_ID');
var client = request.newClient('http://localhost:' + topologyPort);

describe('SimpleTopologyService::Instance API v1', function() {
    /*
    It will take time to create instances for pool, so will leverage existing pool for testing.
    keep the code so that we could switch back to creating new pool/instances for this test.
    
    var instance_id;
    var newpool = {
        name: 'test-pool-new' + today,
        description: 'pool of test topology instances of the latest build',
        topologyRef: '',
        poolMinAvailable: 1,
        poolMaxTotal: 1,
        type: 'noapp'
    };
    var newpool_id;
    var newtop = {
      name: 'test-topology-new' + today,
      description: 'testing a new topology creation update and deletion on ' + today,
      referenceURL: 'http://jazz.net/testtopologynew',
      topologyDocument: '{"blueprint": "IBM CLM E1 Distributed Linux CLM Only", "baseResource": "/Testing", "application": "CLM-E1-distributed-linux", "nodeProperties": {"/IBM CLM E1 Distributed Linux Base topology/ibm_http_servers": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/db2_awse": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/standalone_server_0_1_2": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/standalone_server_0_1_2_3": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/standalone_server": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/standalone_server_0_1_2_3_4": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/standalone_server_0_1": {"cloud_group": "shared cloud group 1"}, "/IBM CLM E1 Distributed Linux Base topology/standalone_server_0": {"cloud_group": "shared cloud group 1"}}, "description": "test populating pool for simple topology service", "name": "pool-53abc-201405270145-No5ae"}'
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
                console.log('SimpleTopologyService Instance API v1.before:could not create pool for testing instance');
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
    
    */
    var instance;
    var instance_id;
    var incorrect_pool_id='no_such_pool_id';
    var incorrect_instance_id='no_such_instance_id';
    describe('GET /api/v1/topology/pools/:id/instances', function() {
        it('should be able get pooled instances and a 200 response code and json', function(done) {
            client.get('/api/v1/topology/pools/' + pool_id+'/instances', function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                instance=body[0];
                instance_id=instance._id;
                var instance_name=instance.name
                console.log('first instance in the pool:' + instance_id + ' name:'+instance_name);
                done();
            });
        });
       
        it('should get a 404 response code if request wtih incorrect pool id', function(done) {
            client.get('/api/v1/topology/pools/' + incorrect_pool_id+'/instances', function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                done();
            });
        });
    });
    describe('GET /api/v1/topology/pools/:pid/instances/:id', function() {
        it('should be able get a specific instance and a 200 response code and json', function(done) {
            client.get('/api/v1/topology/pools/' + pool_id+'/instances/'+instance_id, function(err, res, body) {

                console.log('pool id:' + pool_id);
                console.log('instance id:' + instance_id);
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                done();
            });
        });
        it('should get a 404 response code if requested with a non-existing pool id', function(done) {

            client.get('/api/v1/topology/pools/' + incorrect_pool_id+'/instances/'+instance_id, function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                done();
            });
        });
        it('should get a 404 response code if requested with a non-existing instance id', function(done) {

            client.get('/api/v1/topology/pools/' + pool_id+'/instances/'+incorrect_instance_id, function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                done();
            });
        });
    });
    
    describe('DEL /api/v1/topology/pools/:pid/instances/:id', function() {
        it('should be able get pooled instances and a 200 response code and json', function(done) {
            client.del('/api/v1/topology/pools/' + pool_id+'/instances/'+instance_id, function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                done();
            });
        });
        it('should be get a 404 response code if request with an incorrect pool_id', function(done) {
            client.del('/api/v1/topology/pools/' + incorrect_pool_id+'/instances/'+instance_id, function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
               
                done();
            });
        });
        it('should be get a 404 response code if request with an incorrect instance id', function(done) {
            client.del('/api/v1/topology/pools/' + pool_id+'/instances/'+incorrect_instance_id, function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                
                done();
            });
        });
    });
    
    describe('PUT /api/v1/topology/pools/:pid/instances/:id', function() {
        it('should be able to change instance to checked out and get a 200 response code and json', function(done) {
            client.put('/api/v1/topology/pools/' + pool_id+'/instances'+instance_id, function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(body.checkedOut,true, 'Expected: true Actual: ' + body.checkedOut );
                done();
            });
        });
    });
  
});
