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

########################################################
#
#	Authored: Xue Po Wang (xuepow@cn.ibm.com)
#	Modified:
#
# 	Rational Core Team Automation
#
#	Script Inputs
#		<NONE>
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<SETUP_NTP_SCRIPTS_DIR> - The home directory of this script
#
########################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

NTP_SERVER=$1
if [ -z "${NTP_SERVER}" ]; then
	echo "NTP_SERVER must be provided."
	exit 1
fi

ntpdate -q ${NTP_SERVER}
if [ $? -ne 0 ]; then
	echo "Failed to check the status of NTP server ${NTP_SERVER}"
	exit 1
fi

SETUP_NTP_SCRIPTS_DIR=`pwd -P`
echo "SETUP_NTP_SCRIPTS_DIR=${SETUP_NTP_SCRIPTS_DIR}" >> $envProp

echo "Configuring NTP on `hostname` ..."
service ntpd stop

NTP_CONFIG_FILE=/etc/ntp.conf
if grep -q '^# Please consider joining the pool' ${NTP_CONFIG_FILE}; then
	sed -i "/^# Please consider joining the pool/a server ${NTP_SERVER}" ${NTP_CONFIG_FILE}
else
	sed -i 1i"server ${NTP_SERVER}" ${LICENSE_FILE_PATH}
fi

service ntpd restart
chkconfig ntpd on

exit 0
