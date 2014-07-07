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
var minstance= require('../models/instancemodel');



exports.findAllView = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   minstance.find({poolRef:req.params.id}, function(err, instances) {
   if (err) {
     console.log ( 'error get instances associated with pool');
     console.err(err);
     return;
   }   
   res.render('topology/instances/instanceindex', {
      title: 'Associated Instances',
      docs: instances
    });
  });
};

exports.findAll = function(req, res) {
   console.log('req.params.id:'+req.params.id);
   topologyPoolModel.count({_id:req.params.id}, function(err, count) {
		console.log('::::count of pool:'+count);
		if (count==1) { 
          minstance.find({poolRef:req.params.id}, function(err, instances) {
          if (err) {
            console.log ( 'error get instances associated with pool');
            res.send(404);
            return;
          }   
          res.json(instances);
          });
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
           console.log('populated instance'+ JSON.stringify(instance));
           //instance.remove(function() {
			//res.send(200);
			//});
           }).populate('topologyRef').populate('poolRef');
       }
       else
         res.send(404);
  });
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
			    if (param =='_id'||param =='name'||param =='type'||param=='topologyRef'||param=='poolRef')
                              {
				console.log('omitting ' + param );
                             
			      continue;//update to the above fields are ignored
                              }
                            if(param=='checkedout'&& updateDoc[param]== false)
                              continue;//checkout only, no checkin support
			   
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

