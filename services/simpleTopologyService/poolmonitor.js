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
var monitor = require('child_process').fork('noappinstancecreator.js');//monitor pools and fork instance creators for pools
var pname='pool_monitor';
var num_instance_creator_per_pool=2

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

console.log(pname+': monitoring process is running! ');
var timer;
var request_no=0;
var timeoutcb= function(){

mpool.find({type:'noapp'},function(err, pools){

  if (err) return console.error(err);
    //console.log(pools)
  pools.forEach(function( pool){
    console.log(pname+': pool to be checked:')
    //console.log(pool)
    console.log('pool name:'+pool.name);
    console.log('pool id:'+pool._id);
    console.log('topology name:'+pool.topologyRef.name);
    
    client.scard('workers_for_pool_'+pool._id, function (err, card){
      if (err) return console.error(err);
      
      console.log(pname+': number of instance creators for pool:'+ card);
      if(card<num_instance_creator_per_pool){//slow start, gradually increase the number of instance creator process
      var instance_creator = require('child_process').fork('noappinstancecreator.js');//fork process to create instances
      
      console.log(pname+'sending message to noapp_C');
      instance_creator.send({pool_id: pool._id});
      client.sadd('workers_for_pool_'+pool._id, instance_creator.pid);
      console.log(pname+': add instance creator process: '+instance_creator.pid);
            
      }
      
    });//client.scard
  });//pools.foreach
  timer=setTimeout(timeoutcb, 60000); //every 60 seconds

}).populate('topologyRef');//mpool.find


};

timer=setTimeout(timeoutcb, 2000); //every 60 seconds

