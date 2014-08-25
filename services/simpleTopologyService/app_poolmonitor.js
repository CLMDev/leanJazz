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
//var doployer= require('child_process').fork('app_deployer.js');//monitor pools and fork instance creators for pools
var pname='apppool_monitor';
var num_deployer_per_pool=2

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
var api_password;

console.log(pname+': monitoring process is running! ');

process.on('message', function(m) {
  api_password=m.password;
});
var timer;
var request_no=0;
var timeoutcb= function(){

mpool.find({type:'app'},function(err, pools){

  if (err) return console.error(err);
    //console.log(pools)
  pools.forEach(function( pool){
    console.log(pname+': app pool to be checked:')
    //console.log(pool)
    console.log('pool name:'+pool.name);
    console.log('pool id:'+pool._id);
        
    client.scard('workers_for_pool_'+pool._id, function (err, card){
      if (err) return console.error(err);
      
      console.log(pname+': number of deployers for app pool:'+ card);
      if(card<num_deployer_per_pool){//slow start, gradually increase the number of deployer process
      var deployer = require('child_process').fork('app_deployer.js');//fork process to deploy app
      console.log('step3: app monitor to app deployer');
      console.log('api_password:'+api_password);
      deployer.send({password:api_password});
      
      console.log(pname+'sending message to App_Deployer');
      deployer.send({pool_id: pool._id});
      client.sadd('workers_for_pool_'+pool._id, deployer.pid);
      console.log(pname+': add deployer process: '+deployer.pid);
            
      }
      
    });//client.scard
  });//pools.foreach
  timer=setTimeout(timeoutcb, 60000); //every 60 seconds

});//mpool.find


};

timer=setTimeout(timeoutcb, 2000); //every 60 seconds

