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

###################################################################
#	Authored: Xue Po Wang (xuepow@cn.ibm.com)
#	Modified:
#
#	Rational Core Team Automation
#
#	Script Inputs
#		<IM_HOME> - /opt/IBM/InstallationManager
#		<JAZZ_HOME> - The home directory of CLM
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<NONE>
#
###################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

IM_HOME=$1
if [ -z "${IM_HOME}" ]; then
	echo "IM_HOME must be provided."
	exit 1
fi
if [ ! -f ${IM_HOME}/eclipse/tools/imcl ]; then
	echo "Failed to find ${IM_HOME}/eclipse/tools/imcl, file does not exist."
	exit 1
fi

JAZZ_HOME=$2
if [ -z "${JAZZ_HOME}" ]; then
	echo "JAZZ_HOME must be provided."
	exit 1
fi

echo "JAZZ_HOME is: ${JAZZ_HOME}"
echo "IM_HOME is: ${IM_HOME}"

# Cloud be previous failed installation, make sure we can have a clean installation
${IM_HOME}/eclipse/tools/imcl listInstalledPackages | grep jfs
if [ $? -eq 0 ]; then
	echo "Found existing CLM component(s), removing ... "
	${IM_HOME}/eclipse/tools/imcl uninstall `${IM_HOME}/eclipse/tools/imcl listInstalledPackages | grep jfs`
else
	echo "No existing CLM component(s)"
fi

if [ -d ${JAZZ_HOME} ]; then
	rm -rf ${JAZZ_HOME}/*
fi

exit 0
