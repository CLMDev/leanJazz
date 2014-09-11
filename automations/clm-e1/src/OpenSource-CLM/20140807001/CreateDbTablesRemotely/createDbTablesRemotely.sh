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
#		<COMPONENTS> - {"CLM", "JTS", "CCM", "QM", "RM"}
#
#	Inputs - taken from 'environment'
#		<JAZZ_HOME> - The home directory of JAZZ
#
#	Outputs - save to 'environment'
#		<RUN_REPOTOOLS_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

JAZZ_HOME=$1
if [ -z "${JAZZ_HOME}" ]; then
	echo "JAZZ_HOME must be provided."
	exit 1
fi
if [ ! -d ${JAZZ_HOME} ]; then
	echo "The JAZZ_HOME folder ${JAZZ_HOME} does not exist."
	exit 1
fi

CONTEXT=$2
if [ -z "${CONTEXT}" ]; then
	echo "CONTEXT must be provided."
	exit 1
fi
if [ ! -f ${JAZZ_HOME}/server/repotools-${CONTEXT}.sh ]; then
	echo "Failed to find script ${JAZZ_HOME}/server/repotools-${CONTEXT}.sh"
	exit 1
fi

DB_HOSTNAME=$3
if [ -z "${DB_HOSTNAME}" ]; then
	echo "The DB_HOSTNAME must be provided."
	exit 1
fi

DB_ROOT_PASSWORD=$4
if [ -z "${DB_ROOT_PASSWORD}" ]; then
	echo "The DB_ROOT_PASSWORD must be provided."
	exit 1
fi

DB_ADMIN_USERNAME=$5
if [ -z "${DB_ADMIN_USERNAME}" ]; then
	echo "The DB_ADMIN_USERNAME must be provided."
	exit 1
fi

RUN_REPOTOOLS_SCRIPTS_DIR=`pwd -P`
echo "RUN_REPOTOOLS_SCRIPTS_DIR=${RUN_REPOTOOLS_SCRIPTS_DIR}" >> $envProp

CLM_INSTALL_USER=`ls -l ${JAZZ_HOME} | cut -d' ' -f 3`

echo "------Server Info------"
echo "HOSTNAME is `hostname`"
echo "JAZZ_HOME is: ${JAZZ_HOME}"
echo "CONTEXT is: ${CONTEXT}"
echo "DB_HOSTNAME is ${DB_HOSTNAME}"
echo "CLM_INSTALL_USER is: ${CLM_INSTALL_USER}"

chmod 755 ${RUN_REPOTOOLS_SCRIPTS_DIR}/sshScripts/*

echo "Installing expect if it is not find on the system ... "
sh ${RUN_REPOTOOLS_SCRIPTS_DIR}/sshScripts/install_expect.sh

echo "Setting up SSH remote access to web server ${DB_HOSTNAME} ..."
HOME=$HOME ${RUN_REPOTOOLS_SCRIPTS_DIR}/sshScripts/setupSSH -d -p ${DB_ROOT_PASSWORD} root@${DB_HOSTNAME}


echo "Transferring files to ${DB_HOSTNAME} ..."
scp -r ${RUN_REPOTOOLS_SCRIPTS_DIR}/dbScripts root@${DB_HOSTNAME}:/tmp/${CONTEXT}_dbScripts
echo "Creating database(s) for ${CONTEXT} ..."
ssh root@${DB_HOSTNAME} "chmod 755 /tmp/${CONTEXT}_dbScripts/*; cd /tmp/${CONTEXT}_dbScripts; sh ./createDB.sh ${DB_ADMIN_USERNAME} ${CONTEXT}"


echo "Running repotools as user ${CLM_INSTALL_USER} ..."

echo "------Run Repo Tools for ${CONTEXT} Tables------"
su - ${CLM_INSTALL_USER} -c "cd ${JAZZ_HOME}/server;echo 'Y' | ./repotools-${CONTEXT}.sh -createTables teamserver.properties="${JAZZ_HOME}/server/conf/${CONTEXT}/teamserver.properties" logFile=repotools-${CONTEXT}_createTables.log"
if [ $? -ne 0 ]; then
	echo "Repo Tools Failed to Create ${CONTEXT} Tables"
	exit 1
fi

if [[ ${CONTEXT} == jts* ]]; then
	#Create DW Tables
	echo "------Run Repo Tools for Data WareHouse Tables------"
	su - ${CLM_INSTALL_USER} -c "cd ${JAZZ_HOME}/server;./repotools-${CONTEXT}.sh -createWarehouse teamserver.properties="${JAZZ_HOME}/server/conf/${CONTEXT}/teamserver.properties" logFile=repotools-${CONTEXT}_createWarehouse.log"
	if [ $? -ne 0 ]; then
		echo "Repo Tools Failed to Create Data WareHouse Tables"
		exit 1
	fi
fi
echo "-----------------------"
echo " "

exit 0