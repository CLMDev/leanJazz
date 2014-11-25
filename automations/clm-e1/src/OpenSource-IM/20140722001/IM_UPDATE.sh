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
#		<IM_HOME> - The home directory of IBM Installation Manager
#		<IM_REPO> - Optional, The software package repository for update IBM Installation Manager
#		<IM_REPO_USERNAME> - Optional, The username to access the IM repository
#		<IM_REPO_PASSWORD> - Optional, The password to access the IM repository, must be provided if IM_REPO_USERNAME be provided
#		<IM_MASTER_PASSWORD> - Optional, The master password of IM secure store, must be provided if IM_REPO_USERNAME and IM_REPO_PASSWORD be provided
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<NONE>
#
########################################################

if [ `whoami` != "root" ] ; then
	echo "You must run this script as root."
	echo ""
	exit 1
fi

IM_HOME=$1
if [ -z "${IM_HOME}" ]; then
	echo "IM_HOME must be provided."
	exit 1
fi
if [ ! -f ${IM_HOME}/eclipse/tools/imcl ]; then
	echo "IM command line tool does not exist at ${IM_HOME}/eclipse/tools/imcl."
	exit 1
fi

IM_INSTALL_USER=`ls -l ${IM_HOME}/eclipse/IBMIM | cut -d' ' -f 3`

IM_REPO=$2
if [ ! -z "${IM_REPO}" ]; then
	echo "Using custom IM update repository ${IM_REPO} ..."
	if [ "$3" -a "$4" ]; then
		IS_IM_REPO_SECURED="Y"
		echo "The IM update repository is secured."
				
		IM_REPO_USERNAME=$3
		IM_REPO_PASSWORD=$4

		IM_MASTER_PASSWORD=$5
		if [ -z "${IM_MASTER_PASSWORD}" ]; then
			echo "IM_MASTER_PASSWORD must be provided."
			exit 1
		fi
		
		IM_MASTER_PASSWORD_FILE=${IM_HOME}/eclipse/tools/im_master_passwd
		echo "${IM_MASTER_PASSWORD}" > ${IM_MASTER_PASSWORD_FILE}
		chown ${IM_INSTALL_USER} ${IM_MASTER_PASSWORD_FILE}
		chmod 600 ${IM_MASTER_PASSWORD_FILE}

		IM_SECURE_STORAGE=${IM_HOME}/eclipse/tools/im_secure.store

		echo "Saving credentials to secure storage file ${IM_SECURE_STORAGE} ..."
		if [ "${IM_INSTALL_USER}" == "root" ]; then
			${IM_HOME}/eclipse/tools/imutilsc saveCredential -url ${IM_REPO} -userName ${IM_REPO_USERNAME} -userPassword ${IM_REPO_PASSWORD} -secureStorageFile ${IM_SECURE_STORAGE} -masterPasswordFile ${IM_MASTER_PASSWORD_FILE}
		else
			su - -c "${IM_HOME}/eclipse/tools/imutilsc saveCredential -url ${IM_REPO} -userName ${IM_REPO_USERNAME} -userPassword ${IM_REPO_PASSWORD} -secureStorageFile ${IM_SECURE_STORAGE} -masterPasswordFile ${IM_MASTER_PASSWORD_FILE}" -- ${IM_INSTALL_USER}
		fi
		if [ $? -ne 0 ] || [ ! -f ${IM_SECURE_STORAGE} ] || [ ! -f ${IM_MASTER_PASSWORD_FILE} ]; then
			echo "Failed to save credentials to secure storage file ${IM_SECURE_STORAGE}"
			exit 1
		fi
		chown ${IM_INSTALL_USER} ${IM_SECURE_STORAGE}
		chmod 600 ${IM_SECURE_STORAGE}
	else
		IS_IM_REPO_SECURED="N"
		echo "The IM update repository is not secured."
	fi
else
	echo "No custom IM update repository specified, using service repositories, this needs public Internet access ... "
fi

echo "Updating IBM Installation Manager at ${IM_HOME} using user account ${IM_INSTALL_USER} ..."
if [ ! -z "${IM_REPO}" ]; then
	if [ ${IS_IM_REPO_SECURED} == "Y" ]; then
		if [ "${IM_INSTALL_USER}" == "root" ]; then
			${IM_HOME}/eclipse/tools/imcl install com.ibm.cic.agent -repositories ${IM_REPO} -preferences offering.service.repositories.areUsed=false -secureStorageFile ${IM_SECURE_STORAGE} -masterPasswordFile ${IM_MASTER_PASSWORD_FILE}
		else
			su - ${IM_INSTALL_USER} -c "${IM_HOME}/eclipse/tools/imcl install com.ibm.cic.agent -repositories ${IM_REPO} -preferences offering.service.repositories.areUsed=false -secureStorageFile ${IM_SECURE_STORAGE} -masterPasswordFile ${IM_MASTER_PASSWORD_FILE}"
		fi
	else
		if [ "${IM_INSTALL_USER}" == "root" ]; then
			${IM_HOME}/eclipse/tools/imcl install com.ibm.cic.agent -repositories ${IM_REPO} -preferences offering.service.repositories.areUsed=false
		else
			su - ${IM_INSTALL_USER} -c "${IM_HOME}/eclipse/tools/imcl install com.ibm.cic.agent -repositories ${IM_REPO} -preferences offering.service.repositories.areUsed=false"
		fi
	fi
else
	if [ "${IM_INSTALL_USER}" == "root" ]; then
		${IM_HOME}/eclipse/tools/imcl install com.ibm.cic.agent
	else
		su - ${IM_INSTALL_USER} -c "${IM_HOME}/eclipse/tools/imcl install com.ibm.cic.agent"
	fi
fi
if [ $? -ne 0 ]; then
	echo "Failed to install IBM Installation Manager for some reason, please go check log files."
	exit 1
fi

echo "IBM Installation Manager has been updated successfully."

# Remove the plain text master password file
if [ ! -z "${IM_REPO}" ] && [ ${IS_IM_REPO_SECURED} == "Y" ]; then
	if [ "${IM_INSTALL_USER}" == "root" ]; then
		rm -rf ${IM_MASTER_PASSWORD_FILE}
	else
		su - ${IM_INSTALL_USER} -c "rm -rf ${IM_MASTER_PASSWORD_FILE}"
	fi
fi
exit 0
