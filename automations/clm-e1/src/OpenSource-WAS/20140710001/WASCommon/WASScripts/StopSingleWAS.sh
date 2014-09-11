#!/bin/sh
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

#############################################################################
# Name: StopSingleWAS.sh
#	Authored: unknown
#
# Updated for SSE nonRoot: Kenneth Thomson (kenneth.thomson@uk.ibm.com)	
#	
#############################################################################

#TODO from Super Wang: Forget about the following code and please use "service <ProfileName>-<ServerName>_was.init stop" to stop WAS

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

if [ -z "${WAS_SERVER_NAME}" ]; then
	echo "WAS_SERVER_NAME need to be provided."
	exit 1
fi

echo `hostname`

echo "As non-Root user [${WAS_SYS_USERNAME}] stop the WAS server ....."

echo "Checking status of WebSphere Application Server - ${WAS_SERVER_NAME} ..."

if ps ax | grep -v grep | grep "${WAS_PROFILE_ROOT}" | grep "${WAS_SERVER_NAME}" > /dev/null ; then
	echo "WebSphere Application Server - ${WAS_SERVER_NAME} is running."
	su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/stopServer.sh ${WAS_SERVER_NAME}"
	if [ $? -ne 0 ]; then
		echo "WebSphere Server failed to stop"
		exit 1
	fi
else
	echo "WebSphere Application Server - ${WAS_SERVER_NAME} is not running."
	exit 0
fi

echo "Sleeping 30 second to wait everything stopped."

sleep 30

echo "Checking status of WebSphere Application Server - ${WAS_SERVER_NAME} again ..."

if ps ax | grep -v grep | grep "${WAS_PROFILE_ROOT}" | grep "${WAS_SERVER_NAME}" > /dev/null ; then
	echo "WebSphere Application Server - ${WAS_SERVER_NAME} is running."
	exit 1
else
	echo "WebSphere Application Server - ${WAS_SERVER_NAME} is not running."
	exit 0
fi
