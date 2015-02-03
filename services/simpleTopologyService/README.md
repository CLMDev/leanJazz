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
    * Request Payload:
        ```json
        {
            name: "pool-01",
            description: "This is a sample pool",
            type: "noapp or app",
            parentPool: "The ID of parent pool, use NA for noapp pool",
            provider: [{
                type: "UCD",
                server: "https://<your UCD server>:<port>",
                username: "username of UCD",
                password: "password of UCD"
            }],
            properties: "A JSON string(not JSON object) contains any necessary properties for UCD to create an environment when creating noapp pool or run a application process when creating app pool",
            poolMaxTotal: 5,
            poolMinAvailable: 1
        }
        ```
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
    * Request Payload:
        ```json
        {
            type: "checkout",
            comment: "Sample comments"
		}
        ```
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
