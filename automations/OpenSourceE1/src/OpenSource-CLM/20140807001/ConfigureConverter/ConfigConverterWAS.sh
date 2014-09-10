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
#		<NONE>
#
#	Inputs - taken from 'environment'
#		<NONE>
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

RM_CONVERTER_SCRIPTS_DIR=`pwd -P`

rpm -q xorg-x11-server-Xorg
if [ $? -ne 0 ]; then
	rpm -iv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/xorg-x11-server-Xorg-1.13.0-23.1.el6_5.x86_64.rpm
else
	rpm -Uv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/xorg-x11-server-Xorg-1.13.0-23.1.el6_5.x86_64.rpm
fi

rpm -q xorg-x11-server-common
if [ $? -ne 0 ]; then
	rpm -iv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/xorg-x11-server-common-1.13.0-23.1.el6_5.x86_64.rpm
else
	rpm -Uv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/xorg-x11-server-common-1.13.0-23.1.el6_5.x86_64.rpm
fi

rpm -q pixman
if [ $? -ne 0 ]; then
	rpm -iv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/pixman-0.26.2-5.1.el6_5.x86_64.rpm
else
	rpm -Uv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/pixman-0.26.2-5.1.el6_5.x86_64.rpm
fi

rpm -q xorg-x11-server-Xvfb
if [ $? -ne 0 ]; then
	rpm -iv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/xorg-x11-server-Xvfb-1.13.0-23.1.el6_5.x86_64.rpm
else
	rpm -Uv ${RM_CONVERTER_SCRIPTS_DIR}/rpms/xvfb/xorg-x11-server-Xvfb-1.13.0-23.1.el6_5.x86_64.rpm
fi

chmod +x ${RM_CONVERTER_SCRIPTS_DIR}/startup/startXVFB
cp ${RM_CONVERTER_SCRIPTS_DIR}/startup/startXVFB /etc/rc.d/init.d

pushd .	
cd /etc/rc.d/init.d
chkconfig --add startXVFB
/etc/rc.d/init.d/startXVFB start
popd

echo "---Starting Xvfb on port :3---"
Xvfb :3 -screen 0 800x600x24 >&- 2>&- > /dev/null & 

echo "---Setting DISPLAY---"
DISPLAY=:3.0
export DISPLAY

echo "---Adding DISPLAY to startNode.sh---"
sed -i "s%Bootstrap values ...%ADDED FOR CONVERTER CLUSTERING SUPPORT\nDISPLAY=:3.0\nexport DISPLAY\n\n# Bootstrap values ...%" ${WAS_PROFILE_ROOT}/bin/start*.sh
