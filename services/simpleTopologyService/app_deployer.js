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

var pname='App_Deployer';

var redis = require("redis"),
client = redis.createClient(6379,'9.42.64.55');

    // if you'd like to select database 3, instead of 0 (default), call
    // client.select(3, function() { /* ... */ });

    client.on("error", function (err) {
        console.log(pname+": Redis Error " + err);
    });

var mtopology = require('./models/topologymodel');
var mpool = require('./models/poolmodel');
var minstance = require('./models/instancemodel');
process.env['JAVA_HOME'] = '/root/ibm-java-x86_64-60/jre';
//process.env['JAVA_HOME'] = '/usr/java/jre1.7.0_60';

//setup properties file
var fs = require('fs');
var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});
var http = require('http');
var request = require('request-json');
var topologyPort = nconf.get('PORT');
var json_client = request.newClient('http://localhost:' + topologyPort);
console.log(pname+': App Deployer process is running! ');

var pool_id=0;

process.on('message', function(m) {
    pool_id=m.pool_id;
    pname+='_for_pool_'+ pool_id;
    console.log(pname+'pool_id:', pool_id);
});

var timer;
var timeoutcb= function(){

  if (pool_id==0) {
  timer=setTimeout(timeoutcb, 2000);
  return;
  }
  console.log(pname+': deployer process is creating instance');

  console.log(pname+'get a new request:');
  client.rpoplpush(pool_id+'-app-request',pool_id+'-app-processing', function (err, request){
    if (err) {
      timer=setTimeout(timeoutcb, 60000); 
      return console.error(err);
    }
    if (request==null){
      console.log("request queue is empty");
      timer=setTimeout(timeoutcb, 300000); 
      return ;
    }
    console.log(pname+'request:');
    console.log(request);
    mpool.find({type:'app', id:request.pool_id},function(err, pools){
      if (err) {
      timer=setTimeout(timeoutcb, 60000); 
      return console.error(err);
      }     
      pools.forEach(function( pool){
        console.log(pname+': pool to be checked:')
        console.log(pool)
        console.log('pool name:'+pool.name);
        console.log('parent pool:'+pool.parentPoll);
        console.log('sttached stream:'+pool.attachedStream);
        
        mpool.findById(pool.parentPool, function(err, parent) {
          if(!parent){
            console.log('error: can not find parent pool!');
            timer=setTimeout(timeoutcb, 2000);
            return;
          }
          json_client.get('/api/v1/topology/pools/' + parent._id+'/instances', function(err, res, body) {
          var found=false;
          body.forEach(function(instance){
            if(!found && !instance.checkedout){
              var today = Date.now();            
              found=true;
              instance.checkedout=true;
              instance.checkoutUser='APP Pooler';
              instance.checkoutDate=today;
              instance.checkoutComment='reserved for app pool';
              instance.apppoolRef=parent._id;
              json_client.put('/api/v1/topology/pools/' + parent._id+'/instances/'+instance._id,instance, function(err, res, body) {
              });
              pool.available++;
              pool.save();
              client.lrem(pool_id+'-app-processing',1, request , function (err){
                 if (err) {
                 timer=setTimeout(timeoutcb, 60000);
                 return console.error(err);
                 }
              });
              timer=setTimeout(timeoutcb, 60000);
            }//if(!found && !instance.checkedout)
          });//forEach
          if(!found){
            console.log('no available instance found in parent pool!');
            timer=setTimeout(timeoutcb, 2000);
            return;
          }
          });//json_client.get(
        });//mpool.findById(pool.parentPool
      });//pool.forEach
    });//mpool.find
});//client.rpoplpush
}//var timeoutcb=function

timer=setTimeout(timeoutcb, 60000); //every 60 seconds

