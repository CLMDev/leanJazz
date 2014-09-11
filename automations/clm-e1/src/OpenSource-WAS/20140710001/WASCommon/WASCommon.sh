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
#		<NONE>
#
#	Inputs - taken from 'environment'
#		<WAS_SYS_USERNAME> - clmadmin
#		<WAS_PROFILE_ROOT> - /opt/IBM/WebSphere/Profiles/DefaultAppSrv01
#		<WAS_SERVER_NAME> - server1
#
#	Outputs - save to 'environment'
#		<WAS_COMMON_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

if [ -z "${WAS_PROFILE_ROOT}" ] || [ ! -d ${WAS_PROFILE_ROOT} ]; then
	echo "Failed to load WAS_PROFILE_ROOT, or the folder does not exist."
	exit 1
fi

# WAS_SYS_USERNAME is the system user account
# The user name of this account could be as same as the primary admin id of WAS security settings(like LDAP) or not
# We need to use the system user account to su with, not a 'virtual' user in WAS security settings
if [ -z "${WAS_SYS_USERNAME}" ]; then
	echo "Failed to load WAS_SYS_USERNAME."
	exit 1
fi

WAS_COMMON_SCRIPTS_DIR=`pwd -P`
echo "WAS_COMMON_SCRIPTS_DIR=${WAS_COMMON_SCRIPTS_DIR}" >> $envProp

echo `hostname`

su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${WAS_COMMON_SCRIPTS_DIR}/saveNodeAndServerName.py $envProp"
if [ $? -ne 0 ]; then
	echo "Failed to save NODE_NAME into $envProp."
	exit 1
fi

exit 0
