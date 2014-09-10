#############################################################################
#
# (c) Copyright 2014 IBM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#		 http://www.apache.org/licenses/LICENSE-2.0
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
	
def singleWAS():
	cellName = getCellName()
	print("Cell name is: " + cellName)
	nodeName = getNodeName('APPLICATION_SERVER');
	print("App node name is " + nodeName);
	serverName = getServerName('APPLICATION_SERVER');
	print "App server name is: " + serverName

def syncNodes():
	print "------------------ sync nodes ---------------"
	nodelist = AdminConfig.list('Node').splitlines()
	
	for n in nodelist:
		nodename = AdminConfig.showAttribute(n, 'name')
		objname = "type=NodeSync,node=" + nodename + ",*"
		Syncl = AdminControl.completeObjectName(objname)
		if Syncl != "":
			AdminControl.invoke(Syncl, 'sync')
			print "Done with node " + nodename
		else:
			print "Skipping node " + nodename
		continue

def genProp(host, port, baseDN, bindDN, bindPassword, primaryAdminId, sslEnabled):
	print "-------Configure LDAP General Properties-------"
	ldapGenProps = "[-ldapHost " + host + " -ldapPort " + port + " -ldapServerType CUSTOM "
	ldapGenProps = ldapGenProps + " -baseDN " + baseDN + " -bindDN " + bindDN + " -bindPassword " + bindPassword
	ldapGenProps = ldapGenProps + " -primaryAdminId " + primaryAdminId
	ldapGenProps = ldapGenProps + " -searchTimeout 120 -reuseConnection false -sslEnabled " + sslEnabled + " -sslConfig -autoGenerateServerId true"
	ldapGenProps = ldapGenProps + " -ignoreCase false -customProperties -verifyRegistry false]"
	rc = AdminTask.configureAdminLDAPUserRegistry(ldapGenProps)
	rc = AdminConfig.save()

def addlProp(userFilter, groupFilter, userIdMap, groupIdMap, groupMemberIdMap):
	print "-------Configure Perf LDAP Additional Properties-------"
	ldapAddProps = "[-userFilter " + userFilter + " -groupFilter " + groupFilter
	ldapAddProps = ldapAddProps + " -userIdMap " + userIdMap + " -groupIdMap " + groupIdMap + " -groupMemberIdMap " + groupMemberIdMap
	ldapAddProps = ldapAddProps + " -certificateFilter -certificateMapMode EXACT_DN -krbUserFilter"
	ldapAddProps = ldapAddProps + ' -customProperties ["com.ibm.websphere.security.ldap.recursiveSearch="] -verifyRegistry false'
	ldapAddProps = ldapAddProps + "]"
	rc = AdminTask.configureAdminLDAPUserRegistry(ldapAddProps)
	rc = AdminConfig.save()

def setRealmTrust():
	print "-------Set Realm Trust-------"
	AdminTask.configureTrustedRealms('[-communicationType inbound -trustAllRealms false]')
	AdminConfig.save()

def testCon(host, port, baseDN, bindDN, bindPassword, sslEnabled):
	print "-------Test LDAP Connection-------"
	ldapConn = "[-type CUSTOM -hostname " + host + " -port " + port + " -baseDN " + baseDN + " -bindDN " + bindDN + " -bindPassword " + bindPassword + " -sslEnabled " + sslEnabled + "]"
	rc = AdminTask.validateLDAPConnection(ldapConn)
	rc = AdminConfig.save()
	rc = AdminTask.configureAdminLDAPUserRegistry('[-verifyRegistry true ]')
	rc = AdminConfig.save()

def setCurrentSecurity():
	print "-------Set Security Current Settings-------"
	AdminTask.setAdminActiveSecuritySettings('-enableGlobalSecurity true -cacheTimeout 600 -enforceJava2Security false -appSecurityEnabled true -activeUserRegistry LDAPUserRegistry -activeAuthMechanism LTPA')
	rc = AdminConfig.save()

	print "-------Save Registry as Current & Display Current Registry Settings-------"
	#Saves Registry
	print AdminTask.getUserRegistryInfo('[-userRegistryType LDAPUserRegistry]')
	AdminConfig.save()


##################################################
# Main
##################################################
import sys
import java.util as util 
import java.io as javaio

if (len(sys.argv) > 0):
	print "LDAP_FILE =", sys.argv[0];
	LDAP_FILE = sys.argv[0];
	print "PROFILE_TYPE =", sys.argv[1];
	PROFILE_TYPE = sys.argv[1];

#load LDAP Properties from properties file
propertiesLDAP = util.Properties();
propertiesLDAPfile = javaio.FileInputStream(LDAP_FILE);
propertiesLDAP.load(propertiesLDAPfile);

host = propertiesLDAP.getProperty("jazz_ldap_host");
port = propertiesLDAP.getProperty("jazz_ldap_port");
baseDN = propertiesLDAP.getProperty("jazz_ldap_baseDN");
bindDN = propertiesLDAP.getProperty("jazz_ldap_bindDN");
bindPassword = propertiesLDAP.getProperty("jazz_ldap_bindPassword");
primaryAdminId = propertiesLDAP.getProperty("jazz_ldap_primaryid");
sslEnabled = propertiesLDAP.getProperty("jazz_ldap_sslEnabled")

userFilter = propertiesLDAP.getProperty("jazz_ldap_userFilter");
groupFilter = propertiesLDAP.getProperty("jazz_ldap_groupFilter");
userIdMap = propertiesLDAP.getProperty("jazz_ldap_userIdMap");
groupIdMap = propertiesLDAP.getProperty("jazz_ldap_groupIdMap");
groupMemberIdMap = propertiesLDAP.getProperty("jazz_ldap_groupMemberIdMap");

# if cluster
if PROFILE_TYPE == "dmgr":
	syncNodes();
else:
	# if single
	singleWAS();

genProp(host, port, baseDN, bindDN, bindPassword, primaryAdminId, sslEnabled);
addlProp(userFilter, groupFilter, userIdMap, groupIdMap, groupMemberIdMap);
setRealmTrust();
testCon(host, port, baseDN, bindDN, bindPassword, sslEnabled);
setCurrentSecurity();

# if cluster
if PROFILE_TYPE == "dmgr": 
	syncNodes();
