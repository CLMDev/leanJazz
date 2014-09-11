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
#		<NODE_LIST> - A list of node names separated by comma
#		<PROP_FILE> - The output properties file to save CONTEXT to
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<GENERATE_CONTEXT_SCRIPTS_DIR> - The home directory of this script
#
###################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

NODE_LIST=$1
if [ -z "${NODE_LIST}" ]; then
	echo "NODE_LIST must be provided."
	exit 1
fi

PROP_FILE=$2
if [ -z "${PROP_FILE}" ]; then
	echo "PROP_FILE must be provided."
	exit 1
fi

GENERATE_CONTEXT_SCRIPTS_DIR=`pwd -P`
echo "GENERATE_CONTEXT_SCRIPTS_DIR=${GENERATE_CONTEXT_SCRIPTS_DIR}" >> $envProp

echo "Nodes are: ${NODE_LIST}"
NODES=( $( echo ${NODE_LIST} | tr ',' '\n' | sort -u ) )
LENGTH=${#NODES[@]}
if [ ${LENGTH} == 1 ]; then
	echo "Only one node, no need to set id"
	CONTEXT_ID=
else
	CONTEXT_ID=`printf "%02d" ${LENGTH}`
fi
echo "The CONTEXT_ID is ${CONTEXT_ID}"

echo "Saving context to ${PROP_FILE} ..."
echo "CONTEXT_ID=${CONTEXT_ID}" >> ${PROP_FILE}

exit 0
