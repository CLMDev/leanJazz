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

var pname='noapp_C';

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

//setup properties file
var fs = require('fs');
var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});

console.log(pname+': noapp_C process is running! ');

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
  console.log(pname+': noapp_C process is creating instance');



  console.log(pname+'get a new request:');
  client.rpoplpush(pool_id+'-noapp-request',pool_id+'-noapp-processing', function (err, request){
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
    mpool.find({type:'noapp', id:request.pool_id},function(err, pools){
      if (err) {
      timer=setTimeout(timeoutcb, 60000); 
      return console.error(err);
      }     
      pools.forEach(function( pool){
    
        console.log(pname+': pool to be checked:')
        console.log(pool)
        console.log('pool name:'+pool.name);
        console.log('pool id:'+pool._id);
        console.log('topology name:'+pool.topologyRef.name);
        timer=setTimeout(timeoutcb, 60000); //every 60 seconds
      });//pool.forEach
    }).populate('topologyRef');//mpool.find
  
  
  timer=setTimeout(timeoutcb, 60000); 
});//client.rpoplpush

}//var timeoutcb=function

timer=setTimeout(timeoutcb, 2000); //every 60 seconds

