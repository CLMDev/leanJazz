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

var nodemailer = require('nodemailer');


// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(); 

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'STS<sts@sts.rtp.raleigh.ibm.com>', // sender address
    to: 'liuzc@cn.ibm.com', // list of receivers
    subject: 'Activate your account for STS', // Subject line
    text: 'DO *NOT* ACTIVATE THIS ACCOUNT, UNLESS YOU CREATE AND INTEND TO USE IT. To activate, click on this link, ' 
};

var resetmailOptions = {
    from: 'STS<sts@sts.rtp.raleigh.ibm.com>', // sender address
    to: 'liuzc@cn.ibm.com', // list of receivers
    subject: 'Reset Your Password for STS', // Subject line
    text: 'DO *NOT* CLICK THE LINK, UNLESS YOU WOULD LIKE TO RESET YOUR PASSWORD. To reset your password, click on this link, ' 
};


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

exports.update = function(req, res) {
  User.findById(req.params.id, function(err, doc) {
    if (!doc) {
      console.log('no users found');
      res.send(400);
      return;
    }
    doc.isActive=req.body.isActive;
    doc.save();
    res.send(doc);
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

exports.reset = function(req, res) {
    res.render('topology/users/password_reset', { message: ''});
};

exports.resetMail = function(req, res) {
  if(req.body.mail.indexOf('.ibm.com')==-1)
    res.render('topology/users/password_reset', { message: 'Use IBM intranet ID, please'});
  else {
    User.find({mail: req.body.mail},function( err, docs){
      console.log('docs.length:'+docs.length);
      if(docs.length==0){
        console.log('user not exist!');
        res.render('topology/users/password_reset', { message: 'Account does not exist, sign up first!'});
        return;
      }
      
      res.render('topology/users/password_reset', { message: 'Mail sent, please follow the link to reset your password'});
      // send mail with defined transport object
      resetmailOptions.to=docs[0].mail;
      resetmailOptions.text=resetmailOptions.text+'https://'+nconf.get('HOSTNAME')+':'+nconf.get('PORT')+'/reset/'+docs[0]._salt;
      transporter.sendMail(resetmailOptions, function(error, info){
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

exports.resetStep2 = function(req, res) {
  User.find({_salt:req.params.id},function(err, docs) {
    if (!docs.length) {
      console.log('no users found');
      res.render('topology/users/password_reset', { message: 'User does not exist!'});
      return;
    }
    res.render('topology/users/password_reset_2', { message: ''});
  });
};

exports.resetStep3 = function(req, res) {
  User.find({_salt:req.params.id},function(err, docs) {
    if (!docs.length) {
      console.log('no users found');
      res.render('topology/users/password_reset', { message: 'User does not exist!'});
      return;
    }
    var sha = crypto.createHash('sha1');
    sha.update(req.body.password+docs[0]._salt);
    docs[0].passwordHash=sha.digest('hex');
    docs[0].save();
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
      var newUser=new User();
      newUser.mail=req.body.mail;
      var sha = crypto.createHash('sha1');
      sha.update(req.body.password+newUser._salt);

      newUser.passwordHash=sha.digest('hex');
      console.log('new User:'+newUser);
      newUser.save();
      
      res.render('topology/users/signup', { message: 'Account created! Please check your mail and activate it.'});
      // send mail with defined transport object
      mailOptions.to=newUser.mail;
      mailOptions.text=mailOptions.text+'https://'+nconf.get('HOSTNAME')+':'+nconf.get('PORT')+'/activate/'+newUser._salt;
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


