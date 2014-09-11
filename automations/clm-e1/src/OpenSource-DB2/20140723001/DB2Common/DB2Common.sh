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
#		<NONE>
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<DB2_COMMON_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

if [ `whoami` != "root" ] ; then
	echo "You must run this script as root."
	echo ""
	exit 1
fi

if [ -d /db2inst1 ]; then
	ln -s /db2inst1 /db2fs
	rm -rf /db2inst1/lost+found
	chmod 777 /db2inst1
fi

DB2_COMMON_SCRIPTS_DIR=`pwd -P`
echo "DB2_COMMON_SCRIPTS_DIR=${DB2_COMMON_SCRIPTS_DIR}" >> $envProp

exit 0
