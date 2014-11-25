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
#		<WAS_PROFILE_ROOT> - /opt/IBM/WebSphere/Profiles/DefaultAppSrv01
#		<WAS_SYS_USERNAME> - clmadmin
#		<JAZZ_HOME> - /opt/IBM/JazzTeamServer
#		<COMPONENT> - {"jts", "ccm", "qm", "rm"}
#		<CONTEXT> - {"jts", "ccm", "ccm01", "ccm02", "qm", "rm"}
#
#	Inputs - taken from 'environment'
#		<WAS_PROFILE_ROOT> - /opt/IBM/WebSphere/Profiles/DefaultAppSrv01
#		<WAS_SYS_USERNAME> - clmadmin
#
#	Outputs - save to 'environment'
#		<DEPLOY_CLMAPP_SCRIPTS> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

WAS_PROFILE_ROOT=$1
if [ -z "${WAS_PROFILE_ROOT}" ]; then
	echo "WAS_PROFILE_ROOT must be provided."
	exit 1
fi
if [ ! -d ${WAS_PROFILE_ROOT} ]; then
	echo "The ${WAS_PROFILE_ROOT} does not exist."
	exit 1
fi

WAS_SYS_USERNAME=$2
if [ -z "${WAS_SYS_USERNAME}" ]; then
	echo "WAS_SYS_USERNAME must be provided."
	exit 1
fi

JAZZ_HOME=$3
if [ -z "${JAZZ_HOME}" ]; then
	echo "JAZZ_HOME must be provided."
	exit 1
fi
if [ ! -d ${JAZZ_HOME} ]; then
	echo "The ${JAZZ_HOME} does not exist."
	exit 1
fi

JAZZ_LDAP_PROP_FILE=$4
if [ -z "${JAZZ_LDAP_PROP_FILE}" ]; then
	echo "JAZZ_LDAP_PROP_FILE must be provided."
	exit 1
fi
if [ ! -f ${JAZZ_LDAP_PROP_FILE} ]; then
	echo "The file ${JAZZ_LDAP_PROP_FILE} does not exist."
	exit 1
fi

COMPONENT=$5
if [ -z "${COMPONENT}" ]; then
	echo "COMPONENT must be provided."
	exit 1
fi

CONTEXT=$6
if [ -z "${CONTEXT}" ]; then
	echo "CONTEXT must be provided."
	exit 1
fi

DEPLOY_CLMAPP_SCRIPTS=`pwd -P`
echo "DEPLOY_CLMAPP_SCRIPTS=${DEPLOY_CLMAPP_SCRIPTS}" >> $envProp

echo "------Server Info------"
echo "JAZZ_HOME is: ${JAZZ_HOME}"
echo "COMPONENT is: ${COMPONENT}"
echo "CONTEXT is: ${CONTEXT}"
echo "Hostname is: `hostname`"

echo "Deploying CLM application(s) to WAS ..."
su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${DEPLOY_CLMAPP_SCRIPTS}/InstallCLMapps.py ${JAZZ_HOME} ${JAZZ_LDAP_PROP_FILE} ${COMPONENT} ${CONTEXT}"
if [ $? -ne 0 ]; then
	echo "CLM Application Deployment failed"
	exit 1
fi
echo "CLM Application deployment succeeded"
echo "-----------------------"
echo " "

exit 0
