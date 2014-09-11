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

########################################################
#
#       Authored: Jennifer Liu (yeliu@us.ibm.com)
#       Rational Core Team Automation
#
########################################################
import sys, os;

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
	
def getCellName():
	return AdminControl.getCell();
	
certPath="/tmp/serverroot.cer"
if (len(sys.argv) == 1):
	certPath = sys.argv[0]

if (os.path.exists(certPath)):
	print("The certification file " + certPath + " exists, will override it.");
	os.remove(certPath);
	
cellName = getCellName()
nodeName = getNodeName('APPLICATION_SERVER');
AdminTask.extractCertificate('[-certificateFilePath ' + certPath + ' -base64Encoded true -certificateAlias root -keyStoreName NodeDefaultRootStore -keyStoreScope (cell):' + cellName + ':(node):' + nodeName +' ]') 
