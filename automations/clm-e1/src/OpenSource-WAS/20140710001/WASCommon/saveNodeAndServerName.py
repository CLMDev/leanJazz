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

def _getServer(type='APPLICATION_SERVER'):
	servers = AdminTask.listServers('[-serverType ' + type + ' ]').splitlines();
	if (len(servers) == 1):
		return servers[0];
	else:
		print "this script works with single server only. There are " + len(servers);
		sys.exit(-1);
	
def getServerName(type='APPLICATION_SERVER'):
	appSrv = _getServer(type);
	serverName = AdminConfig.showAttribute(appSrv, 'name');
	return serverName;
	
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
	

##################################################
# Main
##################################################
import sys

if (len(sys.argv) < 1):
	print("Need to provide a file to save node name.");
	sys.exit(1);

envfile = sys.argv[0];

nodeName = getNodeName();
appServerName = getServerName();
fh = open(envfile,'a');
fh.write("NODE_NAME=" + nodeName + "\n");
fh.write("SERVER_NAME=" + appServerName + "\n");
fh.close();
