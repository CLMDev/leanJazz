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
#	Authored: Xue Po Wang (xuepow@cn.ibm.com)
#	Modified:
#
#	Script Inputs
#		<JTS_REPOSITORY_URL> - The repository url of JTS
#		<JAZZ_HOME> - The home directory of JAZZ
#		<CONTEXT> - The context of CLM component going to use, like {"jts", "ccm", "ccm01", "ccm02", "qm", "rm"}
#		<CLM_ADMIN_USERNAME> - The username of CLM administrative user
#		<CLM_ADMIN_PASSWORD> - The password of CLM administrative user
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<SYNC_USERS_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

JTS_REPOSITORY_URL=$1
if [ -z "${JTS_REPOSITORY_URL}" ]; then
	echo "JTS_REPOSITORY_URL should be provided."
	exit 1
fi

JAZZ_HOME=$2
if [ -z "${JAZZ_HOME}" ]; then
	echo "JAZZ_HOME should be provided."
	exit 1
fi
if [ ! -d ${JAZZ_HOME} ]; then
	echo "Failed to find JAZZ_HOME at ${JAZZ_HOME}"
	exit 1
fi

CONTEXT=$3
if [ -z "${CONTEXT}" ]; then
	echo "CONTEXT should be provided."
	exit 1
fi

CLM_ADMIN_USERNAME=$4
if [ -z "${CLM_ADMIN_USERNAME}" ]; then
	echo "CLM_ADMIN_USERNAME should be provided."
	exit 1
fi
CLM_ADMIN_PASSWORD=$5
if [ -z "${CLM_ADMIN_PASSWORD}" ]; then
	echo "CLM_ADMIN_PASSWORD should be provided."
	exit 1
fi

SYNC_USERS_SCRIPTS_DIR=`pwd -P`
echo "SYNC_USERS_SCRIPTS_DIR=${SYNC_USERS_SCRIPTS_DIR}" >> $envProp

echo "------Server Info------"
echo "JAZZ_HOME is: ${JAZZ_HOME}"
echo "CONTEXT is: ${CONTEXT}"
echo "Hostname is: `hostname`"

echo "Synchronizing users ... "
su - ${CLM_INSTALL_USER} -c "cd ${JAZZ_HOME}/server;./repotools-${CONTEXT}.sh -syncUsers repositoryURL=${JTS_REPOSITORY_URL} adminUserId=${CLM_ADMIN_USERNAME} adminPassword=${CLM_ADMIN_PASSWORD} logFile=repotools-${CONTEXT}_syncUsers.log"
if [ $? -ne 0 ]; then
	echo "Failed to import users."
	exit 1
fi

exit 0
