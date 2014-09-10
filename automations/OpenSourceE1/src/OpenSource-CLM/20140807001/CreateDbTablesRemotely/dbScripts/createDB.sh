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
#	Authored: Bradley Herrin (bcherrin@us.ibm.com)
#	Modified:
#		Xue Po Wang (xuepow@cn.ibm.com)
#
#	Script Inputs
#		<DB2_ADMIN_USERNAME> - The username of DB2 administrative user, normally db2inst1
#		<PRODUCTS> - {CLM}
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<NONE>
#
#############################################################################

if [ `whoami` != "root" ] ; then
	echo "You must run this script as root."
	echo ""
	exit 1
fi

DB2_ADMIN_USERNAME=$1
if [ -z "${DB2_ADMIN_USERNAME}" ]; then
	echo "DB2_ADMIN_USERNAME must be provided."
	exit 1
fi

PRODUCTS=$2
if [ -z "${PRODUCTS}" ]; then
	echo "PRODUCTS must be provided."
	exit 1
fi

CREATE_DB2_DB_SCRIPTS=`pwd -P`
su - ${DB2_ADMIN_USERNAME} -c "sh ${CREATE_DB2_DB_SCRIPTS}/createtables.sh $PRODUCTS"
exit $?
