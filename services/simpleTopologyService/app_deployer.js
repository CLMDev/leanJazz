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
//process.env['JAVA_HOME'] = '/usr/java/jre1.7.0_60';
var api_password;
//setup properties file
var fs = require('fs');

var mprovider = require('./models/providermodel');
var https = require('https');
var request_json= require('request-json');
var topologyPort = nconf.get('PORT');
var options = {
  rejectUnauthorized: false,
  headers: {cookie:''}
};
var json_client = request_json.newClient('https://localhost:' + topologyPort, options);
console.log(pname+': App Deployer process is running! ');

var pool_provider;

var process_template,process_template_obj, process_template_updated;
var build_id;
var pool_id=0;
 
var user=require('./routes/user');

process.on('message', function(m) {
    console.log('step4:APP Deployer got message:');
    if(m.pool_id!=undefined){
      pool_id=m.pool_id;
      pname+='_for_pool_'+ pool_id;
      console.log(pname+'pool_id:', pool_id);
      mpool.findById(pool_id ,function(err, pool){
        mpool.findById(pool.parentPool ,function(err, parentpool){
          mprovider.findById(parentpool.topologyRef.providerRef ,function(err, provider){
            pool_provider=provider;
            console.log(pname+'pool_provider:', JSON.stringify(pool_provider));
          });
        }).populate('topologyRef');
      });
    }
    if(m.password!=undefined){
      api_password=m.password; 
    }
    
});

var timer;
var timeoutcb= function(){

  if (pool_id==0 || pool_provider==undefined) {
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
        console.log('parent pool:'+pool.parentPool);
        console.log('sttached stream:'+pool.attachedStream);
        
        mpool.findById(pool.parentPool, function(err, parent) {
          if(!parent){
            console.log('error: can not find parent pool!');
            timer=setTimeout(timeoutcb, 2000);
            return;
          }
          try{
                process_template=parent.topologyRef.appProcessTemplate;
                console.log(process_template);
                process_template_obj=JSON.parse(process_template);
          } catch (err){
                console.log(err);
                console.log('please check process template of pool:'+parent.name);
                console.log('process template:');
                console.log(process_template);
                timer=setTimeout(timeoutcb, 60000);
                return console.error(err);
          }
          console.log('lookup buildstream:'+pool.attachedStream);
          mbuild.find({buildStream:pool.attachedStream}, function( err, builds){
            if(err){
                  console.log('error get builds for build stream:'+pool.attachedStream);
                  timer=setTimeout(timeoutcb, 60000);
                  return;
            }
            console.log('builds available:'+builds);
            var latest_recommend='';
            builds.forEach(function(build){
              if(build.isRecommended && build.BUILDID>latest_recommend)
                   latest_recommend=build.BUILDID;
            });//forEach()
            console.log('latest recommended build:'+latest_recommend);
            if(latest_recommend==undefined){
                  console.log('latest recommended undefined, returning!');
                  timer=setTimeout(timeoutcb, 60000);
                  return;
            }
            var login={ 
              username: 'apiuser@ibm.com',
              password: ''
            }
            login.password=api_password;
            console.log('api user password:'+login.password);
            json_client.post('/api/v1/login',login , function(err, res, body) {

              console.log('res.headers:'+JSON.stringify(res.headers));
              var cookie= res.headers['set-cookie'];
              console.log('cookie:'+cookie);
              options.headers.cookie=cookie;
              json_client = request_json.newClient('https://localhost:' + topologyPort, options);

              json_client.get('/api/v1/topology/pools/' + parent._id+'/instances', function(err, res, body) {
              var found=false;
              body.forEach(function(instance){
              if(!found && !instance.checkedout){
                var today = Date.now();            
                found=true;
                instance.checkedout=true;
                instance.type='app';
                instance.buildid=latest_recommend;
                instance.checkoutUser='APP Pooler';
                instance.checkoutDate=today;
                instance.checkoutComment='reserved for app pool';
                instance.apppoolRef=pool._id;
                json_client.put('/api/v1/topology/pools/' + parent._id+'/instances/'+instance._id,instance, function(err, res, body) {
                if (res.statusCode!=200) {
                  console.log('checkout from parent pool failed!');
                  timer=setTimeout(timeoutcb, 60000);
                  return; 
                }
                pool.available++;
                pool.save();
                client.lrem(pool_id+'-app-processing',1, request , function (err){
                  if (err) {
                  timer=setTimeout(timeoutcb, 60000);
                  return console.error(err);
                  }
                });
                process_template_obj.environment=instance.name;
                process_template_obj.versions[0].version=latest_recommend;
                //process_template_obj["post-deploy-put-url"]='http://liuzc-rh.rtp.raleigh.ibm.com:3001/api/v1/topology/pools/'+pool._id+'/instances/'+instance._id;
                process_template_updated=JSON.stringify(process_template_obj);
                var dir='/tmp/pool-'+pool._id;
                if(!fs.existsSync(dir))
                  fs.mkdirSync(dir );
                var stream=fs.createWriteStream(dir+'/'+instance.name+ '.json');
                   stream.end(process_template_updated, function(){
                     console.log(pname +'::fork background process for instance : '+instance.name);
                   });
                   var exec = require('child_process').exec, child;
                   child = exec('/root/requestProcess.py -v --udclient /root/udclient/udclient --weburl ' + pool_provider.UCD_webURL + 
                   ' --authtoken ' + pool_provider.UCD_authtoken +' '+ dir +'/'+instance.name+ '.json',
                      function (error, stdout, stderr) {
                        console.log(pname +' instance creation callback:');
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        var bracket_index=stdout.indexOf('{');
                        var json_string=stdout.substring(bracket_index);
                        var request_json=JSON.parse(json_string);
                        
                        minstance.findById(instance._id, function(err, instance_to_be_updated){
                          instance_to_be_updated.apprequestId=request_json.requestId;
                          instance_to_be_updated.save();
                        })//findById
                          
                      });//child=exec
                timer=setTimeout(timeoutcb, 60000);
                });//jsonclient.put
              
            }//if(!found && !instance.checkedout)
          });//forEach
          if(!found){
            console.log('no available instance found in parent pool!');
            timer=setTimeout(timeoutcb, 2000);
            return;
          }
          });//json_client.get(
          });//longin
          });//mbuild.find
        }).populate('topologyRef');//mpool.findById(pool.parentPool
      });//pool.forEach
    });//mpool.find
});//client.rpoplpush
}//var timeoutcb=function

timer=setTimeout(timeoutcb, 60000); //every 60 seconds

