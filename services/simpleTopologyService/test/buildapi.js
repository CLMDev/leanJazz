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

describe('SimpleTopologyService::Build API v1', function() {
    
    var newbuild = {
        BUILDID:'CALM501-T20140716-2028',
        buildStream: 'main-501',
        description: 'test build stream',
        refURL: 'https://jazzweb.ratl.swg.usma.ibm.com/calm/main-501/T/CALM501-T20140716-2028/'
    };
    incorrect_build='incorrect_build';
    before(function(done) {
      client.post('/api/v1/builds', newbuild, function(err, res, body) {
            if (! err) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(
                res.headers['content-type'],
                    'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                done();
            }else {
                console.log('SimpleTopologyService Build API v1.before:could not create test build');
                console.log(err);
                assert.equal(err, undefined, 'could not create test build');
                done();
            }
        });
    });

    after(function(done) {
        remove = nconf.get('REMOVE-TEST-DATA');
        if (remove == 'false') {
            done();
        }else {
            client.del('/api/v1/builds/' + newbuild.BUILDID, function(err, res, body) {
                done();
            });
        }
    });
    
    describe('GET /api/v1/builds/', function() {
        it('should be able get all available build streams and a 200 response code and json', function(done) {
            client.get('/api/v1/builds/', function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                bs=body[0];
                console.log('first build:' + bs.build);
                done();
            });
        });
       
    });
    describe('GET /api/v1/builds/:id', function() {
        it('should be able get a specific build stream and a 200 response code and json', function(done) {
            client.get('/api/v1/builds/'+newbuild.BUILDID, function(err, res, body) {

                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(res.headers['content-type'], 'application/json; charset=utf-8',
                    'Expected: application/json; charset=utf-8 Actual: ' + res.headers['content-type']);
                assert.equal( body.BUILDID, newbuild.BUILDID,
                    'Expected: '+ newbuild.BUILDID + ' Actual: '+body.BUILDID);

                done();
            });
        });
        it('should get a 404 response code if requested with a non-existing build stream', function(done) {

            client.get('/api/v1/builds/'+incorrect_build, function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                done();
            });
        });
    });
    describe('PUT /api/v1/builds/:id', function() {
        it('should be able to update reference URL  and get a 200 response code and json', function(done) {
            update=newbuild;
            update.description='new description'
            client.put('/api/v1/builds/'+newbuild.BUILDID, update, function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                assert.equal(body.description,'new description', 'Expected: new description Actual: ' + body.description );
                done();
            });
        });
    });
  
    
    describe('DEL /api/v1/builds/:id', function() {
        it('should be able get a 200 response code and json', function(done) {
            client.del('/api/v1/builds/' + newbuild.BUILDID, function(err, res, body) {
                assert.equal(res.statusCode, 200, 'Expected: 200 Actual: ' + res.statusCode);
                done();
            });
        });
        it('should get a 404 response code if requested with a deleted build', function(done) {

            client.get('/api/v1/builds/'+newbuild.BUILDID, function(err, res, body) {
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                done();
            });
        });
        it('should be get a 404 response code if request with an incorrect build', function(done) {
            client.del('/api/v1/builds/incorrect_build', function(err, res, body) {
               
                assert.equal(res.statusCode, 404, 'Expected: 404 Actual: ' + res.statusCode);
                
                done();
            });
        });
    });
});
