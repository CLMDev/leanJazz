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
var crypto=require('crypto')
//var hashes = crypto.getHashes();
//console.log(hashes); // ['sha', 'sha1', 'sha1WithRSAEncryption', ...]
var sha = crypto.createHash('sha1');

var nodemailer = require('nodemailer');


// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(); 

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'STS<sts@sts.rtp.raleigh.ibm.com>', // sender address
    to: 'liuzc@cn.ibm.com', // list of receivers
    subject: 'Activate your account for STS', // Subject line
    text: 'DO *NOT* ACTIVATE THIS ACCOUNT, UNLESS YOU CREATE AND INTEND TO USE IT. To activate, click on this link, https://liuzc-rh.rtp.raleigh.ibm.com:3001/activate' // html body
};
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
    res.render('topology/users/signup', { message: ''});
};


exports.activate = function(req, res) {
  User.find({_salt:req.params.id},function(err, docs) {
    if (!docs.length) {
      console.log('no users found');
      res.render('topology/users/signup', { message: 'User does not exist, please signup!'});
      return;
    }
    var u=docs[0];
    u.isRegistered=true;
    u.save(); 
    res.redirect('/login');
  });
};


exports.createAccount = function(req, res) {
  if(req.body.mail.indexOf('.ibm.com')==-1)
    res.render('topology/users/signup', { message: 'Use IBM intranet ID, please'});
  else {
    User.find({mail: req.body.mail},function( err, docs){
      console.log('docs.length:'+docs.length);
      if(docs.length){
        console.log('user already exist!');
        res.render('topology/users/signup', { message: 'Account already exist!'});
        return;
      }
      var hashes = crypto.getHashes();
      var newUser=new User();
      newUser.mail=req.body.mail;
      sha.update(req.body.password+newUser._salt);

      newUser.passwordHash=sha.digest('hex');
      console.log('new User:'+newUser);
      newUser.save();
      res.render('topology/users/signup', { message: 'Account created! Please check your mail and activate it.'});
      // send mail with defined transport object
      mailOptions.text=mailOptions.text+'/'+newUser._salt;
      transporter.sendMail(mailOptions, function(error, info){
      if(error){
        console.log('error: sending mail!');
        console.log(error);
      }else{
        console.log('Message sent: ' + info);
      }
      });
   });
  }
};

exports.list = function(req, res){
  res.send("respond with a resource");
};
