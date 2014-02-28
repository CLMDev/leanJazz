leanJazz
========

Overview
--------
This project is a set of automation scripts and recipes for the install, configuraiton and migration of IBM Collaborative Lifecycle Management. These scripts provide automation for the deployment and configuration of best practice topologies.  The automation of these deployments are a piece of our Continuous Test and Deployment processes.  

Other sources of information
-----------------------------
* The project is managed at https://github.com/rjminsha/CLMAutoDev 
* Documentation and best practices for deployment and automation is avaiable on https://jazz.net/wiki/bin/view/Deployment/WebHome 
* Blogs on the adoption path of DevOps by the Rational Collaborative Lifecycle Management Team, of which these scripts are a part of, can be found at https://jazz.net/blog/?tag=DevOps 

Dependencies 
============
Listed under Sub Projects
 
Mini Projects 
=============
This project has a number of sub-projects contained within it.  They are all provided under the same license.  These projects are grouped together (currently) to make it easy to find all the utilities in a single place. 

Utilities
---------
/utilities: 		helper shell scripts and other useful utilities 
/utilities/setupSSH:	exchanges SSH certificates between sets of machines.  

**Dependencies** 
   * expect 

SimpleTopologyService
---------------------
/services/simpleTopologyService 

Application to provide basic pool of pre-deployed topologies provided by IBM Urbancode Deploy, IBM Workload Deployer or IBM Pure Application System. 

**Dependencies** 
   * Node.js 
   * Mongodb 

Node Modules
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

