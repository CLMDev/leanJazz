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
var today = Date.now();
var assert = require('assert');

function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { 
        return false;
    }
}
var Pool = require('../models/poolmodel');  


describe('Topology Pool should initialize initialization', function() {
    var testPool;
var testPool2;
var newdata1 = {
        name: 'test-pool-new1' + today,
        description: 'pool of test topology instances of the latest build',
        topologyRef: 'http://www.google.com',
        type: 'latest',
        poolMethod: 'basic',
        poolMin: 2,
        poolMax:11
};
var newdata2 = {
        name: 'test-pool-new2' + today,
        description: 'pool of test topology instances of the latest build',
        topologyRef: 'http://www.google.com',
        type: 'latest',
        poolMethod: 'basic',
        poolMin: 2,
        poolMax:11
};

before(function(done){
    Pool.create(newdata1, function(err, pool){ 
        testPool = pool;
        Pool.create(newdata2, function(err, pool){ 
            if (! err){
                testPool2 = pool;
                /*
                testPool2.waitFor(function(){
                    console.log("waiting on pool to become stable");
                    done();
                });
                */
    
                done();
            } else{
                assert.fail(err, undefined, "Expected to save new pool but got error:" + err);
            }
        });
    });            
});
after(function(done){
    /*
        test that I can delete instances by deleting test data
    */
    Pool.count({name: /test/i}, function(err, count) {
        assert.equal(err, undefined,"got error calling find with /test/i :" + err);
        Pool.remove({name: /test/i}, function(err){
            Pool.count({name: /test/i}, function(err,numberLeft) { 
                assert.equal(numberLeft, 0, "Expected for there to be no more instances of test data remaining but got " + numberLeft);
                done();
            });
        });
    }); 
});
    it('testPool should be initialized', function(done){
        assert.notEqual(testPool, undefined, "should have created an object from: " + newdata1);
        done();
    });

    it('should be able to call purge', function(done){
        try{
            testPool.purge(function(err){
                done(); 
            });
        }catch(err){
            assert.fail(err, undefined,'exception caught trying to call purge on pool');
            done();
        }
    });
    it('should be able to call checkin', function(done){
        try{
            var id = 'fakeinstanceid';
            testPool.checkin(id, function(err){
                done(); 
            });
        }catch(err){
            console.log(err);
            assert.fail(err, undefined,'exception caught trying to call checkin on pool');
            done();
        }
    });
    it('should be able to call checkout', function(done){
        try{
            var id = 'fakeinstanceid';
            testPool.checkout(id, function(err, myinstance){
                done(); 
            });
        }catch(err){
            console.log(err);
            assert.fail(err, undefined,'exception caught trying to call checkout on pool');
            done();
        }
    });
    it('should be able to change pooling method of test-pool-new1 using just testPool.poolingMethod', function(done){
        try{
            testPool.poolMethod = "aggressive";
            testPool.save(function(){
                assert.equal(testPool.poolMethod, "aggressive", "Actual:" + testPool.poolMethod +", Expected:aggressive");        
                assert.equal(testPool2.poolMethod, newdata2.poolMethod, "Actual:" + testPool2.poolMethod +", Expected:" + newdata2.poolingMethod);     
                done();   
            });
        }catch(err){
            assert.fail(err, undefined,'exception caught trying to set pooling type on pool');
            console.log(err);
            done();
        }
    });
    it('should be able to change pooling method of test-pool-new1 using just testPool.poolingMethod', function(done){
        testPool.poolMethod = "aggressive";
        testPool.save(function(err,obj){
            assert.equal(testPool.poolMethod, "aggressive", "Actual:" + testPool.poolMethod +", Expected:aggressive");        
            done();
        });
    });
    it('should recieve an error changing poolMethod to invalid data', function(done){
        testPool.poolMethod = "incorrect";
        testPool.save(function(err,obj){
            assert.notEqual(err, undefined, "expected to receive error when setting pooling method to invalid value");
            testPool.poolMethod = "basic";
            done();
        });
    });
    it('should recieve an error setting minPool to negative value', function(done){
        testPool.poolMin = -10;
        testPool.save(function(err,obj){
            assert.notEqual(err, undefined, "expected to receive error");
            testPool.poolMin = 0;
            done();
        });
    });
    it('should recieve an error setting minPool greater than maxPool', function(done){
        testPool.poolMin = testPool.poolMax + 1;
        testPool.save(function(err,obj){
            assert.notEqual(err, undefined, "expected to receive error");
            testPool.poolMin = 1;
            testPool.poolMin = 10;
            done();
        });
    });
    it('should recieve an error setting maxPool less than minPool', function(done){
        testPool.minPool = 3;
        testPool.poolMax = testPool.poolMin - 1;
        testPool.save(function(err,obj){
            assert.notEqual(err, undefined, "expected to receive error");
            //set back to something valid 
            testPool.poolMin = 0;
            testPool.poolMax = 10;
            testPool.save(done);
        });
    });

    it('can call getStatus and see that pool is initialized', function(done){
        testPool.getStatus(function(error, status){
            assert.equal(error, undefined, "got error calling getStatus: " + error);
            assert.notEqual(status, undefined,"expected to get a status back");
            assert(tryParseJSON(status), "expected response to be in json format but it was " + status);
            done();
        });
    });

    it('can get a property from a pool call alias which returns the name of the pool and the max pool size', function(){
        assert.equal(testPool.alias, testPool.name + testPool.maxPool,"alias should be awesome");
    });

});

describe('Topology Pool model can find instances based on name', function(){
    it('can find all documents by name', function(done){
         Pool.find({name: /test/i}, function(err, docs) {
            assert.equal(err, undefined,"got error calling find with /test/i :" + err);
            done();
        });    
    });
});

describe('Topology Pool responds to a notification that there is a new build', function() {
    it('Topology provides REST API to notify of a new build');
    it('Topology creates event when new build is received');
    it('Topology Pool recieves event when a new build is created');
    it('When a new build event is recieved the Pool should purge old instances');
    it('When a new build even is recieved the Pool should new new instances of the build');
    it('When a new build event is received the Pool should notify existing users that a new instance is available');
});

describe('Topology Pool can checkin and checkout instances', function() {
    it('can call checkout and get an instance from the pool');
    it('after calling checkout the pool status is updated');
    it('pooling method ensures that the pool is extended when all instances are checked out');
    it('can call checkin and return an instance to the pool');
    it('after calling checkin the getStatus is updated correctly');
    it('get error if no instances are available in the pool');
});

describe('Topology Pool Object can handle scenarios where it is not able to deploy new instances', function() {
    it('pool will return an error it is unable to deploy new instances'); 
    it('pool will notify operations if it is unable to deploy new instances'); 
    it('pool switches to a new provider if it is having issues deploying new instances');
});
