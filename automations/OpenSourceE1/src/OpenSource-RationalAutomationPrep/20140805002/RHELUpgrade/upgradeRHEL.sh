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
#		<RHEL_UPGRADE_SCRIPTS_DIR> - The home directory of this script
#
########################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

TARGET_VERSION=6.5

RHEL_UPGRADE_SCRIPTS_DIR=`pwd -P`
echo "RHEL_UPGRADE_SCRIPTS_DIR=${RHEL_UPGRADE_SCRIPTS_DIR}" >> $envProp

version=`cat /etc/redhat-release`
echo "Current Red Hat Release ${version}"
echo ${version} | grep ${TARGET_VERSION}
if [ $? -ne 0 ]; then
	yum -y --releasever=${TARGET_VERSION} upgrade
fi
version=`cat /etc/redhat-release`
echo "Current Red Hat Release ${version}"

exit 0
