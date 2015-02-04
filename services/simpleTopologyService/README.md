Simple Topology Service(STS)
============================

Overview 
========
Simple Topology Service(STS) or Cached Topology Service is a service that can pool/cache pre-provisioned and pre-deployed topology instances of applications, such as CLM but not limited to it, for developers, testers, DevOps pipelines, etc. It will save the time for getting an environment or application instance, which traditionally takes hours. 

The application is built on Node using express and mongodb. Tests are written using mocha.  A rest (like) API is provide as well as a basic web UI built using jade.  

STS is still under development, so the service and the document are not finalized and are subject to change as we move forward.

Dependencies  
============
   * See package.json

Configurations
==============


Usage 
=====
Local Test 
----------
   1. Start Mongo Database: *mongod* 
   2. Install node modules: *npm install* 
   3. Start Node Application (express): *node app.js* 
   4. Run tests: *mocha --reporter list*

APIs
====
   * **List all existing pools**
    * Endpoint: /api/v1/topology/pools
    * Method: GET
    * Request Payload: NA
    * Response: A JSON array that contains all basic information of pools
   * **Create a pool**
    * Endpoint: /api/v1/topology/pools
    * Method: POST
    * Request Payload: See Appendix for detail
    * Response: A JSON object of pool
   * **Read base information of a specified pool**
    * Endpoint: /api/v1/topology/pools/:id
    * Method: GET
    * Request Payload: NA
    * Response: A JSON object of pool
   * **Update base information of a specified pool**
    * Endpoint: /api/v1/topology/pools/:id
    * Method: PUT
    * Request Payload: Sample as pool creation
    * Response: A JSON object of pool
   * **Delete a specified pool**
    * Endpoint: /api/v1/topology/pools/:id
    * Method: DELETE
    * Request Payload: NA
    * Response: http code 200 if success
   * **Perform actions like checkout instance against a specified pool**
    * Endpoint: /api/v1/topology/pools/:id/actions
    * Method: POST
    * Request Payload: See Appendix for detail
    * Response: Full JSON object of an instance ready to use
   * **List all existing instances belong to a specified pool**
    * Endpoint: /api/v1/topology/pools/:id/instances
    * Method: GET
    * Request Payload: NA
    * Response: A JSON array of instances
   * **Read base information of a specified instance**
    * Endpoint: /api/v1/topology/pools/:pid/instances/:id
    * Method: GET
    * Request Payload: NA
    * Response: A JSON object of instance
   * **Delete a specified instance from pool**
    * Endpoint: /api/v1/topology/pools/:pid/instances/:id
    * Method: DELETE
    * Request Payload: NA
    * Response: http code 200 if success

Authentication for APIs
=======================
The REST API end points are protected using HTTP basic authentication method. Each API call should provide authentication headers with username and password.

Appendix
========
Example payload for no-app pool creation
----------------------------------------
If you are using UCD as the pooler type, take the following JSON as an example 
```json
{
    "name": "noapp-01",
    "description": "This is a sample no-app pool",
    "type": "noapp",
    "parentPool": "NA",
    "provider": [{
        "type": "UCD",
        "server": "https://www.example.com:8080",
        "username": "username of UCD",
        "password": "password of UCD"
    }],
    "properties": "{\"appName\": \"Application name in UCD\", \"blueprintName\": \"Blueprint name in UCD\", \"nodeProperties\": {\"key1\":\"value1\", \"key2\":\"value2\"}",
    "poolMaxTotal": 5,
    "poolMinAvailable": 1
}
```

Example payload for app pool creation
-------------------------------------
If you are using UCD as the pooler type, take the following JSON as an example 
```json
{
    "name": "app-01",
    "description": "This is a sample app pool",
    "type": "app",
    "parentPool": "54cee801e7f30df219fcc42f",
    "provider": [{
        "type": "UCD",
        "server": "https://www.example.com:8080",
        "username": "username of UCD",
        "password": "password of UCD"
    }],
    "properties": "{\"appName\": \"Application name in UCD\", \"appProcessName\": \"Application process name in UCD\", \"processProperties\": {\"key1\":\"value1\", \"key2\":\"value2\"}, \"snapshotName\": \"Snapshot name in UCD\"}",
    "poolMaxTotal": 5,
    "poolMinAvailable": 1
}
```

Example payload for checkout
----------------------------
```json
{
    "type": "checkout",
    "comment": "Sample comments"
}
```