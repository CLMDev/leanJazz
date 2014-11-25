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
#		<PRODUCTS> - {CLM}
#
#	Inputs - taken from 'environment'
#		<none>
#
#############################################################################

PRODUCTS=$1
if [ -z "${PRODUCTS}" ]; then
	echo "PRODUCTS must be provided."
	exit 1
fi
echo "Create database tables for $PRODUCTS"

if [ ${PRODUCTS} == "CLM" ]; then
	declare -a prod=("JTS" "CCM" "QM" "RM" "DW")
elif [[ ${PRODUCTS} == jts* ]]; then
	declare -a prod=("jts" "dw")
else
	declare -a prod=(${PRODUCTS})
fi

EXIST_DB_NAMES=$( db2 list db directory | grep -i alias | awk '{print $4}' )

function createDatabase() {
	DB_NAME=$( echo "${1}DB" | tr "[:lower:]" "[:upper:]" )
	if [ -n "$( echo "${EXIST_DB_NAMES}" | grep "${DB_NAME}" )" ]; then
		echo "Found existing database ${DB_NAME}, dropping ... "
		db2 DROP DATABASE ${DB_NAME}
	fi
	echo "Creating database ${DB_NAME} ..."
	db2 CREATE DATABASE ${DB_NAME} AUTOMATIC STORAGE YES ON '/db2fs' DBPATH ON '/db2fs' USING CODESET UTF-8 TERRITORY US COLLATE USING SYSTEM PAGESIZE 16384
}

for APP in "${prod[@]}"
do
	{
		createDatabase ${APP}
		wait ${!}
		if [ $? -eq 0 ]; then
			echo "Database for ${APP} has been created successfully."
		else
			echo "Failed to create database for ${APP}."
			exit 1
		fi
	}
done

exit 0


