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

var pname='basicpooler';

var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});
var redis_host=nconf.get('REDIS_HOST');
var redis = require("redis"),
client = redis.createClient(6379,redis_host);

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


console.log(pname+': pooling process is running! ');
var timer;
var request_no=0;
var timeoutcb= function(){

console.log(pname+': inside callback');
mpool.find({type:'noapp'},function(err, pools){

  if (err) {
    console.log('got error:'+err);
    return console.error(err);
  }
  pools.forEach(function( pool){
    console.log(pname+': pool to be checked:')
    //console.log(pool)
    console.log('pool name:'+pool.name);
    console.log('topology name:'+pool.topologyRef.name);
    console.log('pool available:'+pool.available);
    console.log('pool checkedout:'+pool.checkedout);
    console.log('pool poolMinAvailable:'+pool.poolMinAvailable);
    console.log('pool poolMaxTotal:'+pool.poolMaxTotal);
    var request_queuelen=0;
    var processing_queuelen=0;
    client.llen(pool._id+'-noapp-request', function (err, len){
      if (err) return console.error(err);
      request_queuelen=len;
      console.log('request queue length:'+ request_queuelen);
      client.llen(pool._id+'-noapp-processing', function (err, len){
        if (err) return console.error(err);
        processing_queuelen=len;
        console.log('processing queue length:'+ processing_queuelen);
        queuelen=request_queuelen+processing_queuelen;
      
        if (pool.available + queuelen < pool.poolMinAvailable && pool.available+ pool.checkedout + queuelen< pool.poolMaxTotal){
          console.log('need to add resource to pool:'+ pool.name);
          for (i=1;i<= Math.min(pool.poolMaxTotal-pool.available- pool.checkedout, pool.poolMinAvailable- pool.available)-queuelen; i++ ){
            request_no++;
            json=JSON.stringify( { pool_id: pool._id, topology_id:pool.topologyRef._id, date: Date.now(), request_no: request_no})
            console.log('json representation:'+ json);
            console.log('adding to queue:'+pool._id+'-noapp-request');
            client.lpush(pool._id+'-noapp-request', json);
          }
        } else 
        console.log('maximum resources reached or still have available resources for pool:'+ pool.name);
      });//client.llen processing
    });//client.llen request
  });//pools.foreach
  timer=setTimeout(timeoutcb, 60000); //every 60 seconds

}).populate('topologyRef');//mpool.find


};

timer=setTimeout(timeoutcb, 2000); //every 60 seconds

