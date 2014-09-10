#!/bin/bash
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

#############################################################################
#
#	Authored: Tanya Wolff (twolff@ca.ibm.com)
#	Modified:
#		Xue Po Wang (xuepow@cn.ibm.com)
#
#	Script Inputs
#		<LDAP_SECURITY_PROP_FILE> - The properties file which contains LDAP settings
#
#	Inputs - taken from 'environment'
#		<WAS_PROFILE_ROOT> - /opt/IBM/WebSphere/Profiles/DefaultAppSrv01
#		<WAS_SYS_USERNAME> - clmadmin
#
#	Outputs - save to 'environment'
#		<WAS_LDAP_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

if [ -z "${WAS_PROFILE_ROOT}" ] || [ ! -d ${WAS_PROFILE_ROOT} ]; then
	echo "Failed to load WAS_PROFILE_ROOT, or the folder does not exist."
	exit 1
fi

if [ -z "${WAS_SYS_USERNAME}" ]; then
	echo "Failed to load WAS_SYS_USERNAME."
	exit 1
fi

LDAP_SECURITY_PROP_FILE=$1
if [ -z "${LDAP_SECURITY_PROP_FILE}" ] || [ ! -f ${LDAP_SECURITY_PROP_FILE} ]; then
	echo "LDAP_SECURITY_PROP_FILE must be provided or failed to find the file ${LDAP_SECURITY_PROP_FILE}."
	exit 1
fi

WAS_LDAP_SCRIPTS_DIR=`pwd -P`
echo "WAS_LDAP_SCRIPTS_DIR=${WAS_LDAP_SCRIPTS_DIR}" >> $envProp

echo `hostname`

. ${LDAP_SECURITY_PROP_FILE}
echo "jazz_ldap_primaryid=$jazz_ldap_primaryid"

su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${WAS_LDAP_SCRIPTS_DIR}/enableLDAP.py ${WAS_LDAP_SCRIPTS_DIR}/LDAP/LDAPSecurity.properties default"
if [ $? -ne 0 ]; then
	echo "Could not set LDAP. Login to the WAS console, disable administrative security, restart the server, then run this script again."
	exit 1
fi

# Set the credentials so jazz_ldap_primaryid can start/stop WAS

# Note if jazz_ldap_primaryid is different than the owner of WAS/bin files(${WAS_SYS_USERNAME}),
# Then they need to set credentials to be able to execute wsadmin
# in their java user.home directory which overrides soap.client.props
# SOAPPROPS=~${WAS_USERNAME}/wsadmin.properties

echo "----- Setting up soap properties for $jazz_ldap_primaryid"
SOAPPROPS=${WAS_PROFILE_ROOT}/properties/soap.client.props
echo "SOAPPROPS=$SOAPPROPS"
if [ -e $SOAPPROPS ]; then
	sed -i s/^.*com.ibm.SOAP.securityEnabled=.*$/com.ibm.SOAP.securityEnabled=true/ $SOAPPROPS
	sed -i s/^.*com.ibm.SOAP.loginUserid=.*$/com.ibm.SOAP.loginUserid=$jazz_ldap_primaryid/ $SOAPPROPS
	sed -i s/^.*com.ibm.SOAP.loginPassword=.*$/com.ibm.SOAP.loginPassword=$jazz_ldap_primaryid_Password/ $SOAPPROPS
else
	echo com.ibm.SOAP.securityEnabled=true > $SOAPPROPS
	echo com.ibm.SOAP.loginUserid=$jazz_ldap_primaryid >> $SOAPPROPS
	echo com.ibm.SOAP.loginPassword=$jazz_ldap_primaryid_Password >> $SOAPPROPS
fi

# Encrypt the password inside $SOAPPROPS
${WAS_PROFILE_ROOT}/bin/PropFilePasswordEncoder.sh $SOAPPROPS com.ibm.SOAP.loginPassword

exit 0