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

var mongoose = require('mongoose');
var nconf = require('nconf');

nconf.argv()
        .env()
        .file({ file: './config.json'});

var User = require ('../models/usermodel');


// setup routes for topologies and apis
exports.findAllView = function(req, res) {
  User.find({},function(err, docs) {
    if (!docs) {
      console.log('no users found');
      docs = [];
    }
    res.render('topology/users/userindex', {
      title: 'Available Users',
      docs: docs
    });
  });
};

exports.signup = function(req, res) {
  
    res.render('topology/users/signup');
  
};

exports.list = function(req, res){
  res.send("respond with a resource");
};
