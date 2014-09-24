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
var mbuildstream = require('./models/buildstreammodel');
var mbuild = require('./models/buildmodel');

process.env['JAVA_HOME'] = '/root/ibm-java-x86_64-60/jre';

//setup properties file
var fs = require('fs');

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

console.log(pname+': Housekeeper process is scanning app instances');
minstance.find({type:'app'}, function(err, instances){
  instances.forEach(function(instance){
    if(instance.appdeploymentStatus=='N/A'){
      console.log(pname+': check app deployment status for '+instance.name);
      var exec = require('child_process').exec, child;
                   child = exec('/root/getRequestStatus.py -v --udclient /root/udclient/udclient ' +instance.apprequestId,
                      function (error, stdout, stderr) {
                        console.log(pname +' instance creation callback:');
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        var index=stdout.indexOf('{');
                        var json_string=stdout.substring(index);
                        var json=JSON.parse(json_string);
                        if(json.result!='NONE'){
                           instance.appdeploymentStatus=json.result;
                           instance.save();
                        }
                      });//child=exec
    }
  });//instances.forEach()
});//minstance.find()

console.log(pname+': Housekeeper process is recalculating available/checkedout instances for pools');
mpool.find({type:'noapp'}, function(err, pools){
    pools.forEach(function(pool){
        minstance.find({poolRef:pool._id}, function(err, instances){
            var num_checkedout=0;
            var num_available=0;
            instances.forEach(function(instance){
                
                if(instance.checkedout)
                   num_checkedout++;
                else
                   num_available++;
            });//instance.forEach
            pool.available=num_available;
            pool.checkedout=num_checkedout;
            pool.save();
        });//minstance.find
    });//pools.forEach
});//mpool.find

mpool.find({type:'app'}, function(err, pools){
    pools.forEach(function(pool){
        minstance.find({apppoolRef:pool._id}, function(err, instances){
            var num_checkedout=0;
            var num_available=0;
            instances.forEach(function(instance){
                
                if(instance.appcheckedout)
                   num_checkedout++;
                else
                   num_available++;
            });//instance.forEach
            pool.available=num_available;
            pool.checkedout=num_checkedout;
            pool.save();
        });//minstance.find
    });//pools.forEach
});//mpool.find

timer=setTimeout(timeoutcb, 60000); //every 60 seconds
}//var timeoutcb=function

timer=setTimeout(timeoutcb, 60000); //every 60 seconds

