#############################################################################
#
# (c) Copyright 2014 IBM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#	 http://www.apache.org/licenses/LICENSE-2.0
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
	
def getCellName():
	return AdminControl.getCell();

###################################################
# Uninstall application
###################################################
def uninstallExistingApp(installed_appname, cellName, appNodeName, appServerName):
	existApps = AdminApp.list("WebSphere:cell="+ cellName + ",node=" + appNodeName + ",server=" + appServerName).splitlines();
	found = 0;
	for existApp in existApps:
		if existApp == installed_appname:
			found = 1;
			print("There is an application with name " + installed_appname + " installed, removing ...");
			AdminApp.uninstall(existApp);
			AdminConfig.save();
			break;
	if found == 0:
		print("The application " + installed_appname + " not found on specified server, skipping uninstall operation ... ");	

###################################################
# Start application
###################################################
def startApp(installed_appname, cellName, appNodeName, appServerName):
	existApps = AdminApp.list("WebSphere:cell="+ cellName + ",node=" + appNodeName + ",server=" + appServerName).splitlines();
	found = 0;
	for existApp in existApps:
		if existApp == installed_appname:
			found = 1;
			stat = AdminControl.completeObjectName('type=Application,name=' + installed_appname + ',*');
			if stat is None or stat == '':
				print("The application " + installed_appname + " is not running, starting ...");
				appManager = AdminControl.queryNames("cell=" + cellName + ",node=" + appNodeName + ",type=ApplicationManager,process=" + appServerName + ",*");
				AdminControl.invoke(appManager, 'startApplication', installed_appname);
			else:
				print("The application " + installed_appname + " is running, skipping ... ");	
			break;
	if found == 0:
		print("The application " + installed_appname + " not found on specified server, skipping start operation ... ");	

def deployJazzApp(JAZZ_HOME, app_name, app_ctx, cellName, appNodeName, appServerName, webNodeName, webServerName, properties):
	if app_ctx is None or app_ctx == '':
		app_ctx = app_name;
	
	app_war= app_ctx + '.war';
	appfile = JAZZ_HOME + "/server/webapps/" + app_war;
	if not os.path.exists(appfile):
		print("Failed to locate web application file " + appfile);
		sys.exit(-1);
	
	installed_appname = app_ctx + '_war';
	
	uninstallExistingApp(installed_appname, cellName, appNodeName, appServerName);
	
	print("Installing application " + installed_appname + " on WAS node " + appNodeName + " server " + appServerName + " ...");
	
	installcmd = ""
	installcmd = installcmd + "["
	installcmd = installcmd + " -nopreCompileJSPs -distributeApp -nouseMetaDataFromBinary -nodeployejb"
	installcmd = installcmd + " -appname " + installed_appname
	installcmd = installcmd + " -createMBeansForResources -noreloadEnabled -nodeployws"
	installcmd = installcmd + " -validateinstall warn"
	installcmd = installcmd + " -noprocessEmbeddedConfig"
	installcmd = installcmd + " -filepermission .*\\.dll=755#.*\\.so=755#.*\\.a=755#.*\\.sl=755"
	installcmd = installcmd + " -noallowDispatchRemoteInclude -noallowServiceRemoteInclude"
	installcmd = installcmd + " -asyncRequestDispatchType DISABLED"
	installcmd = installcmd + " -nouseAutoLink"
	installcmd = installcmd + " -MapModulesToServers [[ " + app_war + " " + app_war + ",WEB-INF/web.xml"
	installcmd = installcmd + " WebSphere:cell=" + cellName + ",node=" + appNodeName + ",server=" + appServerName  + "+WebSphere:cell=" + cellName + ",node=" + webNodeName + ",server=" + webServerName + " ]]"
	installcmd = installcmd + " -MapWebModToVH [[ " + app_war + " " + app_war + ",WEB-INF/web.xml default_host ]]"
	installcmd = installcmd + " -CtxRootForWebMod [[ " + app_war + " " + app_war + ",WEB-INF/web.xml " + "/" + app_ctx +" ]]"
	installcmd = installcmd + "]"

	#command doesn't like literal single quotes quoting actural parameters IN the variables
	print("installcmd is ----------------------------------\n" + installcmd);
	AdminApp.install(appfile, installcmd);
	AdminConfig.save();
	print("Application " + installed_appname + " has been installed on WAS");
	
	mapRolesToJazzApp(installed_appname, properties);
	startApp(installed_appname, cellName, appNodeName, appServerName);

###################################################
# Function mapRolesToJazzApp(installed_appname)
###################################################
def mapRolesToJazzApp(installed_appname, properties):
	print("Mapping users and group to application " + installed_appname);
	userrealm = properties.getProperty("jazz_userrealm")
	userrole = properties.getProperty("jazz_ldap_primaryid")
	if len(userrole) == 0:
		userrole = "\'\'"
		userrealmstr = ""
	else:
		userrealmstr = " user:" + userrealm + "/"
	print "userrealmstr: ",userrealmstr
	print "userrole: ",userrole
	for propname in properties.keys():
		#JazzGuests="cn\=RQMSVTJazzUsers,cn\=SVT,dc\=RPTSVT,dc\=domain"
		if propname.find("jazz_grouprole_") == 0:
			editcmd = ""
			editcmd = editcmd + "["
			editcmd = editcmd + " -MapRolesToUsers ["
			editcmd = editcmd + "[ " + propname[15:] + " AppDeploymentOption.No AppDeploymentOption.No"
			editcmd = editcmd + " " + userrole
			editcmd = editcmd + " " + properties.getProperty(propname)
			editcmd = editcmd + " AppDeploymentOption.No"
			editcmd = editcmd + userrealmstr + userrole
			editcmd = editcmd + " group:" + userrealm + "/" + properties.getProperty(propname)
			editcmd = editcmd + "]"
			editcmd = editcmd + "]]"
			print "editcmd: ",editcmd
			print "========== mapping role: " + propname[15:] + "========"
			rc = AdminApp.edit(installed_appname, editcmd);

	rc = AdminConfig.save();

####################
# main
####################
import sys
import java.util as util
import java.io as javaio
import os

if len(sys.argv) < 3:
	print "<JAZZ_HOME> <LDAP_PROP_FILE> <COMPONENT> <CONTEXT>";
	sys.exit(-1);

JAZZ_HOME = sys.argv[0];
if not os.path.exists(JAZZ_HOME):
	print("JAZZ_HOME " + JAZZ_HOME + " does not exist.");
	sys.exit(-2);

propfile = sys.argv[1];
if not os.path.exists(propfile):
	print("Properties file " + propfile + " does not exist.");
	sys.exit(-2);
	
props = util.Properties();
ldappropsfis=javaio.FileInputStream(propfile);
props.load(ldappropsfis);

comp = sys.argv[2];

if len(sys.argv) > 3:
	app_ctx = sys.argv[3];

cellName = getCellName();
print("Cell name is: " + cellName);
appNodeName = getNodeName('APPLICATION_SERVER');
print("App node name is " + appNodeName);
appServerName = getServerName('APPLICATION_SERVER');
print("App server name is: " + appServerName)
webNodeName = getNodeName('WEB_SERVER');
print("Web node name is " + webNodeName);
webServerName = getServerName('WEB_SERVER');
print("Web server name is " + webServerName);

if comp == 'jts':
	distribute_appNames=['jts','admin','clmhelp'];
elif comp == 'ccm':
	distribute_appNames=['ccm'];
elif comp == 'qm':
	distribute_appNames=['qm'];
elif comp == 'rm':
	distribute_appNames=['rm','converter']
else:
	print("Unsupported component " + comp);
	sys.exit(-1);
	
for app_name in distribute_appNames:
	if app_name == 'jts' or app_name == 'ccm' or app_name == 'qm' or app_name == 'rm':
		deployJazzApp(JAZZ_HOME, app_name, app_ctx, cellName, appNodeName, appServerName, webNodeName, webServerName, props);
	else:
		deployJazzApp(JAZZ_HOME, app_name, None, cellName, appNodeName, appServerName, webNodeName, webServerName, props);
