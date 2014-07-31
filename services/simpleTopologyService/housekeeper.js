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

var pname='Housekeeper';

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
var mbuildstream = require('./models/buildstreammodel');
var mbuild = require('./models/buildmodel');


//setup properties file
var fs = require('fs');
var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});
var http = require('http');
var request = require('request-json');
var topologyPort = nconf.get('PORT');
var json_client = request.newClient('http://localhost:' + topologyPort);
console.log(pname+': Housekeeper process is running! ');


console.log(pname+': sweep out records of worker process from last run upon startup');

client.keys('*', function (err, keys){
  console.log('keys:');
  console.log(keys);
  keys.forEach(function(key){     
    client.del(key, function (err, number){
     if(err||number!=1){
     console.log('error deleting key:'+ key);
     console.log(err);
     }
    });//client.del
  });//forEach
});//client.keys

var timer;
var timeoutcb= function(){
console.log(pname+': Housekeeper process is scanning processing queue');
client.keys('*app-processing', function (err, keys){
  console.log('app processing keys:');
  console.log(keys);
  keys.forEach(function(key){     
    client.lrange(key, 0, -1, function(err, list){
     list.forEach(function(item){
     console.log('queue item:'+ item);
     var json=JSON.parse(item);
     var now=Date.now();
     var diff=now-json.date;
     console.log('request time:'+ json.date);
     console.log('now:'+ now);
     console.log('diff:'+ diff);
     if(key.indexOf('noapp-')>-1){
        if(diff/1000/60>120)
          client.lrem(key,0, item, function(err){});
     } else
     if(diff/1000/60>5)
      client.lrem(key,0, item, function(err){});
     })//forEach item
    });//client.lrange
  });//forEach key
});//client.keys

timer=setTimeout(timeoutcb, 60000); //every 60 seconds
}//var timeoutcb=function

timer=setTimeout(timeoutcb, 60000); //every 60 seconds

