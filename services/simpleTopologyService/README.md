README(leanJazz) 
================

Overview 
========
SimpleTopologyService provides a pool of pre-deployed instances of topologies.  This pool of predeployed instances triggers off of build notifications, and is intended for use by developers, testers and automated systems.  The basic idea is to reduce the time and frustration needed for people to get access to an enterprise-like topology of the latest build.  

The appliation is built on Node using express and mongdb. Tests are written using mocha.  A rest (like) API is provide as well as a basic webui built using jade.  

Status 
======
   * [2014-02-27] Initial implementation is in progress for a REST API 
   * [2014-02-27] Initial test cases written for REST API 

Usage 
=====
Local Test 
----------
   1. Start Mongo Database: *mongod* 
   2. Install node modules: *npm install* 
   3. Start Node Application (express): *node app.js* 
   4. Run tests: *mocha --reporter list*

Dependencies  
============
Listed in top level READMD.md 

API v0.1
======== 
Coming Soon 
