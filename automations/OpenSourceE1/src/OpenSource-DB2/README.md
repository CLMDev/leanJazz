# Open Source Component of IBM DB2 Server

## Overview
All processes / scripts inside this component are basically for IBM DB2 Server only.

## Configurations

### Environment Property Definitions
The environment property definitions here are for users to configure the parameters to connect to IBM DB2 Server.

* DEFAULT_DB_ROOT_PASSWORD
The root password of IBM DB2 Server

* DEFAULT_DB_ADMIN_USERNAME
The username of administrative user of IBM DB2 Server, default value is *db2inst1*

* DEFAULT_DB_ADMIN_PASSWORD
The password of administrative user of IBM DB2 Server

* DEFAULT_DB_PORT
The port the IBM DB2 Server will be listen on, default value is *50001* for Linux instances


### Processes

* Install Database Administrative Scripts
This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM DB2 Server(not implemented yet), several variables like **DB_TYPE** / **DB_HOSTNAME** / **DB_ROOT_PASSWORD** / **DB_ADMIN_USERNAME** / **DB_ADMIN_PASSWORD** / **DB_PORT** will be registered to the environment.