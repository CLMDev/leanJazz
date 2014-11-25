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
#		<OS_TUNNING_SCRIPTS_DIR> - The home directory of this script
#
########################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

OS_TUNNING_SCRIPTS_DIR=`pwd -P`
echo "OS_TUNNING_SCRIPTS_DIR=${OS_TUNNING_SCRIPTS_DIR}" >> $envProp

################################################
# Changing default Redhat cpu soft lock up    
# http://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1009996 
# https://access.redhat.com/site/articles/17187#
################################################
sed -i s%kernel.softlockup_thresh%#kernel.softlockup_thresh% /etc/sysctl.conf
echo kernel.softlockup_thresh = 30 >> /etc/sysctl.conf

exit 0
