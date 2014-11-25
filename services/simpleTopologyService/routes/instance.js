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

var topologyPoolModel = require('../models/poolmodel');
var Topology = require('../models/topologymodel');
var mprovider = require('../models/providermodel');
var minstance= require('../models/instancemodel');
var ucd = require('../experiments/UCDAdapter');


process.env['JAVA_HOME'] = '/root/ibm-java-x86_64-60/jre';
var fs = require('fs');
exports.findAllView = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   topologyPoolModel.findById(req.params.id, function(err, pool) {
     if (pool==undefined) { 
       console.log ( 'pool not found');
       return;
     }
     if (pool.type=='noapp'){
       minstance.find({poolRef:req.params.id}, function(err, instances) {
         res.render('topology/instances/instanceindex', {
            title: 'Associated Instances',
            docs: instances
          });
       });
     } else {//pool.type=='app'
       console.log('processing app pool');
       minstance.find({apppoolRef:req.params.id}, function(err, instances) {
       //  console.log('app pool instances:');
       //  console.log(instances);
         res.render('topology/instances/appinstanceindex', {
            title: 'Associated Instances',
            docs: instances
         });
       });
     }
   });
};

exports.findAll = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   topologyPoolModel.findById(req.params.id, function(err, pool) {
		
		if (pool!=undefined) { 
		  if(pool.type=='noapp'){ 
            minstance.find({poolRef:req.params.id}, function(err, instances) {
            if (err) {
            console.log ( 'error get instances associated with noapp pool');
            res.send(404);
            return;
            }   
            res.json(instances);
            });
          } else {//poot.type=='app'
            minstance.find({apppoolRef:req.params.id}, function(err, instances) {
            if (err) {
            console.log ( 'error get instances associated with app pool');
            res.send(404);
            return;
            }   
            res.json(instances);
            });
          }
        } 
        else
         res.send(404);
  });
};

exports.find = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   console.log('req.params.pid:'+req.params.pid);
   topologyPoolModel.count({_id:req.params.pid}, function(err, count) {
		console.log('::::count of pool:'+count);
		if (count==1) { 
           minstance.findById(req.params.id, function(err, instance) {
           if (err) {
             console.log ( 'error get instance');
             res.send(404);
             return;
           }   
           res.json(instance);
           });
       }
       else
         res.send(404);
  });
};

exports.delete = function(req, res) {
   var instId = req.params.id;
   var poolId = req.params.pid;
   minstance.findById(instId, function(err, instance) {
	   if (err) {
           console.log ('Error when finding instance with id(' + instId + '): ' + err);
           res.send(404);
           return;
	   }
	   console.log(instance);
	   var appName = instance.ucdApplication;
	   var envName = instance.ucdEnvName;
	   var providerRef = instance.topologyRef.providerRef;
	   mprovider.findById(providerRef, function(err, provider) {
			if (err) {
				console.log('Error when finding provider with id(' + providerRef + '): ' + err);
				res.send(404);
				return;
			}
			ucd.deleteEnvironment(provider, appName, envName, function(err, removed) {
				if (err) {
					console.log('Error when deleting UCD environment: ' + err);
					res.send(500);
					return;
				}
				minstance.findByIdAndRemove(instId, function(err) {
					if (err) {
						console.log('Error when removing instance: ' + err);
						res.send(500);
						return;
					}
					console.log('Instance removed: ' + instance);
					res.send(200);
				});
			});
	   });// End of find provider by id
   }).populate('topologyRef');// End of find instance by id
};

exports.update = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   console.log('req.params.pid:'+req.params.pid);
   var updateDoc = req.body;
   console.log(updateDoc);
   topologyPoolModel.count({_id:req.params.pid}, function(err, count) {
		console.log('::::count of pool:'+count);
		if (count==1) { 
           minstance.findById(req.params.id, function(err, instance) {
           if (err) {
             console.log ( 'error get instance');
             res.send(404);
             return;
           } 
           try {
			console.log('found document, attempting to update');
			for (var param in updateDoc) {
			    if (param =='_id'||param =='name'||param=='topologyRef'||param=='poolRef'||param=='checkoutUser'||param=='appcheckoutUser')
                              {
				console.log('omitting ' + param );
                             
			      continue;//update to the above fields are ignored
                              }
                            if(param=='checkedout'){
                              if(updateDoc[param]== false)
                                continue;//checkout only, no checkin support
                              else {
                                instance['checkoutUser']=req.session.userid;
                                topologyPoolModel.findById(instance.poolRef, function(err, npool){
                                npool.available=npool.available-1;
                                npool.checkedout=npool.checkedout+1;
                                npool.save();
                                });
                              }
                            }
                            if(param=='appcheckedout'){
                              if(updateDoc[param]== false)
                                continue;//checkout only, no checkin support
                              else {
                                instance['appcheckoutUser']=req.session.userid;
                                topologyPoolModel.findById(instance.apppoolRef, function(err, apppool){
                                apppool.available=apppool.available-1;
                                apppool.checkedout=apppool.checkedout+1;
                                apppool.save();
                                });
                              }
                            }
                                
			   
				console.log('updating ' + param + ' with ' + updateDoc[param]);
				instance[param] = updateDoc[param];
			}
			instance.save();
		   }catch (myerror) {
			console.log('error caught ' + myerror);
			res.send(myerror, 400);
		   }  
           res.json(instance);
           });
       }
       else
         res.send(404);
  });
};





exports.deleteView = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   minstance.findById(req.params.id, function(err, instance) {
   if (err) {
     console.log ( 'error get instance to remove');
     return;
   }   
   res.render('topology/instances/instanceindex', {
      title: 'Associated Instances',
      docs: instances
    });
  });
};

