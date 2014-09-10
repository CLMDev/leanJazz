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
#		<WAS_PROFILE_ROOT> - /opt/IBM/WebSphere/Profiles/DefaultAppSrv01
#		<WAS_SYS_USERNAME> - clmadmin
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<SET_HEAP_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

WAS_PROFILE_ROOT=$1
if [ -z "${WAS_PROFILE_ROOT}" ]; then
	echo "WAS_PROFILE_ROOT need to be provided."
	exit 1
fi
if [ ! -d ${WAS_PROFILE_ROOT} ]; then
	echo "The WAS_PROFILE_ROOT folder ${WAS_PROFILE_ROOT} does not exist."
	exit 1
fi

WAS_SYS_USERNAME=$2
if [ -z "${WAS_SYS_USERNAME}" ]; then
	echo "WAS_SYS_USERNAME need to be provided."
	exit 1
fi

SET_HEAP_SCRIPTS_DIR=`pwd -P`
echo "SET_HEAP_SCRIPTS_DIR=${SET_HEAP_SCRIPTS_DIR}" >> $envProp

PROPSFILE=${SET_HEAP_SCRIPTS_DIR}/was.properties

RAMSize=`ls -la /proc/kcore | awk '{print $5}' | tr -d ''`
echo "Ramsize is $RAMSize"
if [ $RAMSize -lt 4000 ]; then
	echo "The system RAM size is less than 4GB"
	sed -i s%HeapSize=4096%HeapSize=$RAMSize% $PROPSFILE
	sed -i s%"-Xmx4g -Xms4g"%"-Xmx2g -Xms2g"% $PROPSFILE
elif [ $RAMSize -lt 6000 ]; then
	echo "The system RAM size is 4gb, do nothing"
elif [ $RAMSize -lt 7500 ]; then
	 echo "The system RAM size is less than 7GB"
	sed -i s%HeapSize=4096%HeapSize=$RAMSize% $PROPSFILE
	sed -i s%"-Xmx4g -Xms4g"%"-Xmx6g -Xms6g"% $PROPSFILE
	sed -i s%-Xmn512m%-Xmn1g% $PROPSFILE

else 
	echo "The system RAM size is 8gb"
fi

echo "----- SetJvmProps"
su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${SET_HEAP_SCRIPTS_DIR}/SetJvmProps.py ${SET_HEAP_SCRIPTS_DIR}/was.properties default" 
if [ $? -ne 0 ]; then
	echo "WAS JVM settings NOT updated"
	exit 1
fi

echo "----- Update WAS Session Management settings"
su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${SET_HEAP_SCRIPTS_DIR}/SetSMProps.py ${SET_HEAP_SCRIPTS_DIR}/was.properties"
if [ $? -ne 0 ]; then
	echo "WAS Session Management settings NOT updated"
	exit 1
fi

exit 0