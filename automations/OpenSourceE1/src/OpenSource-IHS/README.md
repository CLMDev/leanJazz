# Open Source Component of IBM HTTP Server

## Overview
All processes / scripts inside this component are basically for IBM HTTP Server only.

## Configurations

### Environment Property Definitions
The environment property definitions here are for users to configure the parameters used by IBM HTTP Server.

* IHS_ROOT_PASSWORD
The root password of IBM HTTP Server

* IHS_HOME
The home directory of IBM HTTP Server, default value is */opt/IBM/HTTPServer*

* IHS_WEB_PORT
The HTTP port that IBM HTTP Server will be listen on, default value is *80*

* IHS_HTTPS_PORT
The HTTPS port that IBM HTTP Server will be listen on, default value is *9443*

* IHS_KEYSTORE_PASSWORD
The password of IBM HTTP Server key store database

* IHS_ADMIN_PORT
The port that IBM HTTP Admin Server will be listen on, default value is *8008*

* IHS_ADMIN_USERNAME
The username of administrative user of IBM HTTP Server, default value is *clmadmin*

* IHS_ADMIN_PASSWORD
The password of administrative user of IBM HTTP Server

* IHS_PLUGINS_HOME
The home directory of IBM HTTP Server Plugins, default value is */opt/IBM/Plugins*


### Processes

* Install IHS Configuration Scripts
This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM HTTP Server(not implemented yet), several variables like **IHS_HOSTNAME** / **IHS_ROOT_PASSWORD** / **IHS_HOME** / **IHS_WEB_PORT** / **IHS_ADMIN_PORT** / **IHS_ADMIN_USERNAME** / **IHS_ADMIN_PASSWORD** / **IHS_PLUGINS_HOME** will be registered to the environment.

* Configure IHS Plugins for WAS Nodes
This process will help you to enable SSL of IBM HTTP Server and configure it with IBM HTTP Server Plugins with a blank configuration file, not map to WebSphere Application Server(s) yet.

* Restart IHS
This process will help you to restart the IBM HTTP Server