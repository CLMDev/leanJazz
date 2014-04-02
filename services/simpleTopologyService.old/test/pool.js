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

describe('Pool Object', function() {
    var newdata1 = {
        name: 'test-pool-new1' + today,
        description: 'pool of test topology instances of the latest build',
        topologyRef: 'http://www.google.com',
        type: 'latest',
        poolingMethod: {
                type: 'basic',
                min: 2,
                max:11
        }
    };
    var newdata2 = {
        name: 'test-pool-new2' + today,
        description: 'pool of test topology instances of the latest build',
        topologyRef: 'http://www.google.com',
        type: 'latest',
        poolingMethod: {
                type: 'basic',
                min: 2,
                max:11
        }
    };
    var Pool = require('../models/pool');  
    var testPool;
    var testPool2;
    before(function(done){
        Pool.create(newdata1, function(err, pool){ 
            console.log('created pool');
            console.log(pool);
            testPool = pool;
            Pool.create(newdata2, function(err, pool){ 
                console.log('created pool');
                console.log(pool);
                done();
                testPool2 = pool;
            });
        });            
    });
    it('testPool should be initialized', function(done){
        assert.notEqual(testPool, undefined, "should have created an object from: " + newdata1);
        console.log(testPool);
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
    it('should be able to change pooling method of test-pool-new1', function(done){
        try{
            var id = 'fakeinstanceid';
            testPool.poolingMethod.type = "aggressive";
            testPool.save(function(){
                assert.equal(testPool.poolingMethod.type, "aggressive", "Actual:" + testPool.poolingMethod.type +", Expected:aggressive");        
                assert.equal(testPool2.poolingMethod.type, newdata2.poolingMethod.type, "Actual:" + testPool2.poolingMethod.type +", Expected:" + newdata2.poolingMethod.type);     
                done();   
            });
        }catch(err){
            assert.fail(err, undefined,'exception caught trying to set pooling type on pool');
            console.log(err);
            done();
        }
    });
});
    /*
    var Pool = require('../models/pool');  

    it('should be able to craete single pool', function(done){
        var mypool = new Pool(newdata1, function(){
            done();
        });
    });
    it('should not be able to create the same pool twice', function(done){
        var mypool = new Pool(newdata1, function(){
            done();
        });
    });
    
    it('should be able to find and return a pool', function(done){
        Pool.findByName(newdata1.name, function(err,foundPool){
            if (err){
                assert.fail(err,undefined,"Could not find by ID");
            }
            console.log("findByName: " + foundPool);
            done();        
        }); 
    });

});
*/