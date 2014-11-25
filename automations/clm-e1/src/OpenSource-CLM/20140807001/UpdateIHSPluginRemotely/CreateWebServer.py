#############################################################################
#
# (c) Copyright 2014 IBM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#############################################################################

import java.util as util
import java.io as javaio
import os, sys

def _getServer(type='APPLICATION_SERVER'):
	servers = AdminTask.listServers('[-serverType ' + type + ']').splitlines();
	if (len(servers) == 0):
		return None;
	elif (len(servers) == 1):
		return servers[0];
	else:
		print "this script works with one server top, There are " + len(servers);
		sys.exit(-1);

def getServerName(type='APPLICATION_SERVER'):
	srv = _getServer(type);
	if srv is None or srv == '':
		return None;
	srvName = AdminConfig.showAttribute(srv, 'name');
	return srvName;

def getNodeName(type='APPLICATION_SERVER'):
	nodeName = '';
	nodes = AdminConfig.list("Node").splitlines();
	for node in nodes:
		nodeName = AdminConfig.showAttribute(node, 'name');
		nodeServers = AdminConfig.list("Server", node).splitlines();
		if (len(nodeServers) < 1):
			continue;
		nodeServer = nodeServers[0];
		if (AdminConfig.showAttribute(nodeServer, 'serverType') == type):
			break;
	return nodeName;

def createWebServer(webserverName, hostName, webPort, ihsHome, ihsPluginsHome, adminPort, adminUserID, adminPasswd):
	settings = "[-webserverName " + webserverName + " -hostName " + hostName + " -platform linux"
	settings = settings + " -templateName IHS -webPort " + webPort + " -serviceName " + " -webInstallRoot " + ihsHome + " -webProtocol HTTP " + " -configurationFile -errorLogfile -accessLogfile "
	settings = settings + " -pluginInstallRoot " + ihsPluginsHome + " -webAppMapping ALL "
	settings = settings + " -adminPort " + adminPort + " -adminUserID " + adminUserID + " -adminPasswd " + adminPasswd + " -adminProtocol HTTP]"
	rc = AdminTask.createWebServerByHostName(settings)
	rc = AdminConfig.save()

def deleteWebServer(webSrvName, webNodeName):
	print("Deleting web server " + webSrvName + " on node " + webNodeName);
	AdminTask.deleteWebServer(['-serverName', webSrvName, '-nodeName', webNodeName]);
	AdminConfig.save();
	
if (len(sys.argv) != 8):
	print("Parameters:");
	print("\t <WEBSERVER_NAME> <WEBSERVER_HOSTNAME> <IHS_WEB_PORT> <IHS_HOME> <IHS_PLUGINS_HOME> <IHS_ADMIN_PORT> <IHS_ADMIN_USERNAME> <IHS_ADMIN_PASSWORD>");
	sys.exit(1);

WEBSERVER_NAME = sys.argv[0];
WEBSERVER_HOSTNAME = sys.argv[1];
IHS_WEB_PORT = sys.argv[2];
IHS_HOME = sys.argv[3];
IHS_PLUGINS_HOME = sys.argv[4];
IHS_ADMIN_PORT = sys.argv[5];
IHS_ADMIN_USERNAME = sys.argv[6];
IHS_ADMIN_PASSWORD = sys.argv[7];

webSrvName = getServerName('WEB_SERVER');
if webSrvName is None or webSrvName == '':
	print("No web server configured.");
else:
	print("Found existing web server: " + webSrvName);
	webNodeName = getNodeName('WEB_SERVER');
	if webNodeName is None or webNodeName == '':
		print("Failed to get node name of web server " + webSrvName);
		sys.exit(-1);
	deleteWebServer(webSrvName, webNodeName);

createWebServer(WEBSERVER_NAME, WEBSERVER_HOSTNAME, IHS_WEB_PORT, IHS_HOME, IHS_PLUGINS_HOME, IHS_ADMIN_PORT, IHS_ADMIN_USERNAME, IHS_ADMIN_PASSWORD);
