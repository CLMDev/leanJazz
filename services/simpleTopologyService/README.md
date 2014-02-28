README(leanJazz) 
================

Overview 
========
Set of light weight services used to develop a continuous, test and delivery pipeline. 

Status 
======
   * [2014-02-27] Initial implementation is in progress for a REST API 
   * [2014-02-27] Initial test cases written for REST API 

Usage 
=====
Local Test 
----------
mongod 
node app.js 
mocha --reporter list


Dependencies 
============
Node.js  
-------
These services are written in Node.js and are dependent upon the following packages:  
   * "express": "3.4.8",
   * "jade": "*",
   * "mongoose": ">=2.3.1",
   * "mocha": "*",
   * "should": "*",
   * "nconf":  "*",
   * "validator": "*",
   * "jquery":"*",
   * "request-json":"*"
More information on these packages can be found at https://www.npmjs.org/

API v0.1
======== 
SimpleTopologyService Restricted 
--------------------------------
   * put /topology/topologies 
   * post /topology/topologies/:id 

   * put /topology/providers
   * post /topology/providers/:id 

   * put /topology/pool
   * post /topology/pool

SimpleTopologyService Public 
----------------------------
   * get /topology/topologies
   * get /topology/topologies/:id 

   * get /topology/provider
   * get /topology/provider/:id 

   * get /topology/instance  
   * get /topology/instance/:id 

   * get /topology/pool
