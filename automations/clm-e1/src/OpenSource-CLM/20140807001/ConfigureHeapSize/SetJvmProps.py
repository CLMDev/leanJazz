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

#####################################################################
#
# Function SetHeapSize
#
#####################################################################
def SetHeapSize(appNodeName, appServerName):
	print "----- set heap size ---------------"
	jvmprops = "[-serverName " + appServerName + " -nodeName " + appNodeName
	jvmprops = jvmprops + " -initialHeapSize " + properties.getProperty("jvm.initialHeapSize")
   	jvmprops = jvmprops + " -maximumHeapSize " + properties.getProperty("jvm.maximumHeapSize") 
	jvmprops = jvmprops + " -genericJvmArguments " + properties.getProperty("jvm.genericJvmArguments")
	jvmprops = jvmprops + "]"
	rc = AdminTask.setJVMProperties(jvmprops)
	rc = AdminConfig.save()

#####################################################################
#
# Function Add Custom Properties
#
#####################################################################
def AddCustomProperties(cellName, appNodeName, appServerName):
	print "----- add custom properties ----------------"
	serverid = AdminConfig.getid("/Cell:" + cellName + "/Node:" + appNodeName + "/Server:" + appServerName +"/")
	jvm = AdminConfig.list('JavaVirtualMachine', serverid)
	print "----- creating jvm custom properties ----------"
	for propname in properties.keys():
		if propname.find("jvmcp.") == 0:
			if propname.find(".file.") == 5:
				#file url properties
				pname = propname[11:]
				pvalue = "file:///" + properties.getProperty("CLM_HOME") + "/" + properties.getProperty(propname)
			else:
				pname = propname[6:]
				pvalue = properties.getProperty(propname)
			profcmd = '[[validationExpression ""]'
			profcmd = profcmd +  ' [name \"' + pname + '\"]'
			profcmd = profcmd +  ' [description ""]'
			profcmd = profcmd +  ' [value \"' + pvalue + '\"]'
			profcmd = profcmd +  ' [required "false"]]'
			print "----- creating property",pname,": ",pvalue
			rc = AdminConfig.create('Property', jvm, profcmd)
		AdminConfig.save()


#####################################################################
#
# Main
#
#####################################################################
import sys
import java.util as util
import java.io as javaio
import os

if len(sys.argv) < 1:
	print("The path of properties file should be provided.");
	sys.exit(1);
else:
	d=sys.argv[0]
	if os.path.exists(d):
		propfile=d
	else:
		print("The properties file " + d + "does not exist.");
		sys.exit(1);
	print "PROFILE_TYPE =", sys.argv[1]
	PROFILE_TYPE = sys.argv[1]

print "----- loading properties from: " + propfile
properties = util.Properties()
propertiesfis =javaio.FileInputStream(propfile)
properties.load(propertiesfis)

jvm = AdminConfig.list("JavaVirtualMachine").split("\n")

cellName = AdminControl.getCell()
print "----- cell name is " + cellName + "\n"
# for cluster
# if cluster
if PROFILE_TYPE == "dmgr":

	clusterID=AdminConfig.getid('/ServerCluster:/')
	clusterList=AdminConfig.list('ClusterMember',clusterID)
	servers = clusterList.splitlines();

	print "----- Servers ...", servers, "\n"

	for serverID in servers:
		appServerName=AdminConfig.showAttribute(serverID,'memberName')
		print "----- App server name is ", appServerName, "\n"
		appNodeName=AdminConfig.showAttribute(serverID, 'nodeName')
		print "----- App node name is ", appNodeName
		SetHeapSize(appNodeName, appServerName)
		AddCustomProperties(cellName, appNodeName, appServerName)
else: 
	# for non-cluster
	servers = AdminTask.listServers('[-serverType APPLICATION_SERVER ]').splitlines();
	print "----- serverlist ..." ,servers, "\n"

	for serverID in servers:
		appServerName = AdminConfig.showAttribute(serverID, 'name')
		print "----- App server name is ", appServerName, "\n"
		stuffAfterNodes = serverID.split("nodes/")[1]
		appNodeName = stuffAfterNodes.split("/servers/")[0]
		print "----- App node name is ", appNodeName
		SetHeapSize(appNodeName, appServerName)
		AddCustomProperties(cellName, appNodeName, appServerName)  
