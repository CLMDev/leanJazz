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

def AddCustomProperties(sMgr):
	print "----- Add custom properties ----------------"
	for propname in properties.keys():
		if propname.find("smcp.") == 0:
			pname = propname[5:]
			pvalue = properties.getProperty(propname)
			profcmd = '[[validationExpression ""]'
			profcmd = profcmd +  ' [name \"' + pname + '\"]'
			profcmd = profcmd +  ' [description ""]'
			profcmd = profcmd +  ' [value \"' + pvalue + '\"]'
			profcmd = profcmd +  ' [required "false"]]'
			print "== creating property:",pname,":",pvalue
			rc = AdminConfig.create('Property', sMgr, profcmd)
	AdminConfig.save()

def SetAttributes(sMgr, enableCookies='false'):
	print "----------------- Set SessionManager attributes -----------------"
	smprops = "[[enableCookies " +  enableCookies + "]]"
	rc = AdminConfig.modify(sMgr, smprops)
	rc = AdminConfig.save()

############################
# Main
############################

import sys
import java.util as util
import java.io as javaio
import os

if len(sys.argv) != 1:
	print("The path of properties file should be provided.");
	sys.exit(1);

d=sys.argv[0]
if os.path.exists(d):
	propfile=d
else:
	print("The properties file does not exist.");
	sys.exit(1);
	
print "----- Load properties from: " + propfile + "\n"
properties = util.Properties()
propertiesfis = javaio.FileInputStream(propfile)
properties.load(propertiesfis)

cellName = AdminControl.getCell();
print("Cell name is " + cellName);

servers = AdminTask.listServers('[-serverType APPLICATION_SERVER ]').splitlines();

for server in servers:
	appServerName = AdminConfig.showAttribute(server, 'name')
	appNodeName = server.split("nodes/")[1].split("/servers/")[0]
	print "== App server name is", appServerName
	print "== App node name is", appNodeName
	serverid = AdminConfig.getid("/Cell:" + cellName + "/Node:" + appNodeName + "/Server:" + appServerName +"/")
	sMgr = AdminConfig.list('SessionManager', serverid)
	print "== SessionManager id is", sMgr
	AddCustomProperties(sMgr) 
	SetAttributes(sMgr, properties.getProperty("sm.enableCookies")) 
