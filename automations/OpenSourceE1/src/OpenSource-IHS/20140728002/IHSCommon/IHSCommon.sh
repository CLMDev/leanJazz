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
#	Authored: Xue Po Wang (xuepow@cn.ibm.com)
#	Modified:
#
#	Script Inputs
#		<IHS_HOME> - /opt/IBM/HTTPServer
#		<IHS_PLUGINS_HOME> - /opt/IBM/Plugins
#		<IHS_USER_NAME> - clmadmin
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<IHS_HOME> - The home directory of IHS
#		<IHS_COMMON_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

IHS_HOME=$1
if [ -z "${IHS_HOME}" ]; then
	echo "IHS_HOME need to be provided."
	exit 1
fi
# Important! For restart web server
echo "IHS_HOME=${IHS_HOME}" >> $envProp

IHS_PLUGINS_HOME=$2
if [ -z "${IHS_PLUGINS_HOME}" ]; then
	echo "IHS_PLUGINS_HOME need to be provided."
	exit 1
fi

IHS_COMMON_SCRIPTS_DIR=`pwd -P`
# Important! For restart web server
echo "IHS_COMMON_SCRIPTS_DIR=${IHS_COMMON_SCRIPTS_DIR}" >> $envProp

exit 0
