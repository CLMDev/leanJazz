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
#	Authored: Unknown
#	Modified:
#		Xue Po Wang (xuepow@cn.ibm.com)
#
#	Script Inputs
#
#	Inputs - taken from 'environment'
#		<IHS_HOME> - /opt/IBM/HTTPServer
#		<IHS_USER_NAME> - clmadmin
#
#	Outputs - save to 'environment'
#		<NONE>
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

if [ -z "${IHS_HOME}" ]; then
	echo "Failed to load IHS_HOME."
	exit 1
fi
if [ ! -f ${IHS_HOME}/bin/adminctl ]; then
	echo "The adminctl command does not exist at ${IHS_HOME}/bin/adminctl."
	exit 1
fi
if [ ! -f ${IHS_HOME}/bin/apachectl ]; then
	echo "The apachectl command does not exist at ${IHS_HOME}/bin/apachectl."
	exit 1
fi

${IHS_HOME}/bin/adminctl stop
${IHS_HOME}/bin/apachectl stop

echo "sleep 30 seconds to wait all processes completed...."
sleep 30

${IHS_HOME}/bin/adminctl start
${IHS_HOME}/bin/apachectl start

