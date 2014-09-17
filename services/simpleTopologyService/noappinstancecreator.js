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


var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json'});
var redis_host=nconf.get('REDIS_HOST');
var redis = require("redis"),
client = redis.createClient(6379,redis_host);
var instance_prefix=nconf.get('STS_INSTANCE_PREFIX');

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
var mprovider = require('./models/providermodel');
var pool_provider;


console.log(pname+': noapp_C process is running! ');

var pool_id=0;

process.on('message', function(m) {
    pool_id=m.pool_id;
    pname+='_for_pool_'+ pool_id;
    pname='[ '+pname+' ] ';
    console.log(pname+'pool_id:', pool_id);
    mpool.findById(pool_id ,function(err, pool){
      mprovider.findById(pool.topologyRef.providerRef ,function(err, provider){
      pool_provider=provider;
      //console.log(pname+'pool_provider:', JSON.stringify(pool_provider));
      });
    }).populate('topologyRef');
});

var timer;
var timeoutcb= function(){

  if (pool_id==0 || pool_provider==undefined) {
  timer=setTimeout(timeoutcb, 2000);
  return;
  }
  console.log(pname+': noapp_C callback');

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
    var request_obj=JSON.parse(request);
    console.log('pool id:' + request_obj.pool_id);
    mpool.findById(request_obj.pool_id ,function(err, pool){
      if (err) {
      timer=setTimeout(timeoutcb, 60000); 
      return console.error(err);
      }     
        console.log('pool name:'+pool.name);
        console.log('pool id:'+pool._id);
        console.log('topology name:'+pool.topologyRef.name);
        var dir='/tmp/pool-'+pool.id;

        if(!fs.existsSync(dir))
            fs.mkdirSync(dir );

        var tdoc_object=JSON.parse(pool.topologyRef.topologyDocument);
              
        var pool_id_long=''+pool._id;
        var pool_id_short=pool_id_long.substr(17);
        var date=new Date();
        var year=date.getFullYear();
        var month=date.getMonth()+1;
        var MM;
        if(month<10) MM='0'+month;
          else MM=''+month;
        var day=date.getDate();
        var dd;
        if(day<10) dd='0'+day;
          else dd=''+day;
        var hour=date.getHours();
        var hh;
        if(hour<10) hh='0'+hour;
          else hh=''+hour;
        var min=date.getMinutes();
        var mm;
        if (min<10) mm='0'+min;
          else mm=''+min;
        var creation_date=''+year+MM+dd+hh+mm;
        var request_obj=JSON.parse(request)
        var instance_name=instance_prefix+'pool-'+pool_id_short+'-'+creation_date+'-No'+request_obj.request_no;
        console.log(pname+'instance name:'+instance_name);
        tdoc_object.name=instance_name;
        var json=JSON.stringify(tdoc_object);
        var stream=fs.createWriteStream(dir+'/'+instance_name+ '.json');
        stream.end(json, function(){
          console.log(pname +'::fork background process for instance : '+instance_name);
        
          var exec = require('child_process').exec, child;
          child = exec('/root/createEnv.py -v --udclient /root/udclient/udclient --weburl ' + pool_provider.UCD_webURL + ' --iwdcli /root/deployer.cli/bin/deployer ' +
          ' --authtoken ' + pool_provider.UCD_authtoken + ' --iwdhost ' + pool_provider.IWD_host + ' --iwduser ' + pool_provider.IWD_username +
          ' --iwdpassword '+ pool_provider.IWD_password + ' --outputFile '
            +dir+'/'+instance_name+ '.log ' + dir +'/'+instance_name+ '.json',
            function (error, stdout, stderr) {
              console.log(pname +' instance creation callback:');
              //when this call back is called, the instance has been created in IWD, we can check the status by check the child process output
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              var outputfile = dir +'/'+instance_name+ '.log'; 
              fs.readFile(outputfile, 'utf8', function (err, data) {
                if (err) {
                console.log('Error: ' + err);
                timer=setTimeout(timeoutcb, 60000); //every 60 seconds
                return;
                } 
                console.log(pname +'environment creation logs:'+ data);
                var clog = JSON.parse(data); 
                var env_id= clog[0].id;
                console.log(pname +'env_id:'+ env_id);
                
                if(env_id === undefined){
                  console.log('env_id:undefined');
                  //UCD cli hit errors, we should not create instance here; instead, we should remove the request from processing queue.
                  client.lrem(pool_id+'-noapp-processing',1, request , function (err){                   
                  });
                  timer=setTimeout(timeoutcb, 60000);
                  return;
                }
 
               /* var ucdjson_0=JSON.stringify(clog[0]);
                console.log(pname +'ucdjson_0:'+ ucdjson_0);
                var ucdjson_1=ucdjson_0.substring(1,ucdjson_0.length-1);
                console.log(pname +'ucdjson_1:'+ ucdjson_1);
                var ucdjson_2=ucdjson_1.replace(/\\/g, '');;
                console.log(pname +'ucdjson_2:'+ ucdjson_2);
               */
          
                
                var instance= new minstance();
                instance.name=instance_name;
                instance.description='instance for pooling, with bare environment';
                instance.type='noapp';
                instance.topologyRef=pool.topologyRef._id;
                instance.poolRef=pool._id;
                instance.ucdEnvDesc=data;
                instance.ucdEnvName=clog[0].name;
                instance.ucdEnvID=clog[0].id;
                instance.ucdApplication=clog[0].application;
                instance.ucdURI='https://udeploy04.rtp.raleigh.ibm.com:8443/#environment/'+env_id;
                instance.creationDate=date;
                instance.iwdStatus=clog[0].IWDstatus;
                if(clog[0].IWDstatus == 'Failed'){
                  console.log(pname +'instance creation failed, please check if iwd have reource for the request.');                  
                }
                instance.save (function(err) {
                if (err) {
                  console.log(pname +' error saving instance');
                  console.log(err);
                }
                });//instance.save
      
                mpool.findById(pool.id,  function(err, doc) {                
                  doc.available++;
                  console.log(pname +'available instances for pool:'+doc.available);
                  doc.save (function(err) {
                    if (err) {
                      console.log(pname +' error saving pool');
                      console.log(err);
                    }
                  });//pool.save
                });//mpool.findById
                  
                client.lrem(pool_id+'-noapp-processing',1, request , function (err){
                 if (err) {
                 timer=setTimeout(timeoutcb, 60000);
                 return console.error(err);
                 }
                });
 
                timer=setTimeout(timeoutcb, 60000);
              
              }); //fs.readFile
           });//child=exec
        });//stream.end
    }).populate('topologyRef');//mpool.findById
  
  
});//client.rpoplpush

}//var timeoutcb=function

timer=setTimeout(timeoutcb, 60000+60000*Math.random()); //every 60 seconds

