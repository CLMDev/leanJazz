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
#	Authored: Jennifer Liu (yeliu@us.ibm.com)
#	Modified:
#		Xue Po Wang (xuepow@cn.ibm.com)
#
#	Rational Core Team Automation
#
#	Script Inputs
#		<IM_HOME> - /opt/IBM/InstallationManager
#		<CLM_REPO> - The software package repository which contains installation package of IBM CLM products
#		<COMPONENT> - The name of CLM component, should be one of {"jts", "ccm", "qm", "rm"}
#		<CONTEXT> - The context of CLM component going to use, like {"jts", "ccm", "ccm01", "ccm02", "qm", "rm"}
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<INSTALL_CLM_SCRIPTS> - The home directory of this script
#		<JAZZ_HOME> - The home directory of CLM
#
###################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

IM_HOME=$1
if [ -z "${IM_HOME}" ]; then
	echo "IM_HOME must be provided."
	exit 1
fi
if [ ! -f ${IM_HOME}/eclipse/IBMIM ]; then
	echo "Failed to find ${IM_HOME}/eclipse/IBMIM"
	exit 1
fi
if [ ! -f ${IM_HOME}/eclipse/tools/imcl ]; then
	echo "Failed to find ${IM_HOME}/eclipse/tools/imcl, file does not exist."
	exit 1
fi
if [ ! -f ${IM_HOME}/eclipse/tools/imutilsc ]; then
	echo "Failed to find ${IM_HOME}/eclipse/tools/imutilsc, file does not exist."
	exit 1
fi

CLM_REPO=$2
if [ -z "${CLM_REPO}" ]; then
	echo "CLM_REPO must be provided."
	exit 1
fi

COMPONENT=$3
if [ -z "${COMPONENT}" ]; then
	echo "COMPONENT must be provided."
	exit 1
fi

CONTEXT=$4
if [ -z "${CONTEXT}" ]; then
	echo "CONTEXT must be provided."
	exit 1
fi

IM_INSTALL_USER=`ls -l ${IM_HOME}/eclipse/IBMIM | cut -d' ' -f 3`

if [ "$5" -a "$6" ]; then
	IS_CLM_REPO_SECURED="Y"
	echo "The CLM repository is secured."
				
	CLM_REPO_USERNAME=$5
	CLM_REPO_PASSWORD=$6

	CLM_MASTER_PASSWORD=$7
	if [ -z "${CLM_MASTER_PASSWORD}" ]; then
		echo "CLM_MASTER_PASSWORD must be provided."
		exit 1
	fi
	
	CLM_MASTER_PASSWORD_FILE=${IM_HOME}/eclipse/tools/clm_master_passwd
	echo "${CLM_MASTER_PASSWORD}" > ${CLM_MASTER_PASSWORD_FILE}
	chown ${IM_INSTALL_USER} ${CLM_MASTER_PASSWORD_FILE}
	chmod 600 ${CLM_MASTER_PASSWORD_FILE}

	CLM_SECURE_STORAGE=${IM_HOME}/eclipse/tools/clm_secure.store

	echo "Saving credentials to secure storage file ${CLM_SECURE_STORAGE} ..."
	if [ "${IM_INSTALL_USER}" == "root" ]; then
		${IM_HOME}/eclipse/tools/imutilsc saveCredential -url ${CLM_REPO} -userName ${CLM_REPO_USERNAME} -userPassword ${CLM_REPO_PASSWORD} -secureStorageFile ${CLM_SECURE_STORAGE} -masterPasswordFile ${CLM_MASTER_PASSWORD_FILE}
	else
		su - -c "${IM_HOME}/eclipse/tools/imutilsc saveCredential -url ${CLM_REPO} -userName ${CLM_REPO_USERNAME} -userPassword ${CLM_REPO_PASSWORD} -secureStorageFile ${CLM_SECURE_STORAGE} -masterPasswordFile ${CLM_MASTER_PASSWORD_FILE}" -- ${IM_INSTALL_USER}
	fi
	if [ $? -ne 0 ] || [ ! -f ${CLM_SECURE_STORAGE} ] || [ ! -f ${CLM_MASTER_PASSWORD_FILE} ]; then
		echo "Failed to save credentials to secure storage file ${CLM_SECURE_STORAGE}"
		exit 1
	fi
	chown ${IM_INSTALL_USER} ${CLM_SECURE_STORAGE}
	chmod 600 ${CLM_SECURE_STORAGE}
else
	IS_CLM_REPO_SECURED="N"
	echo "The CLM repository is not secured."
fi

INSTALL_CLM_SCRIPTS=`pwd -P`
echo "INSTALL_CLM_SCRIPTS=${INSTALL_CLM_SCRIPTS}" >> $envProp

JAZZ_HOME=/opt/IBM/JazzTeamServer
echo "JAZZ_HOME=${JAZZ_HOME}" >> $envProp

if [ -d ${JAZZ_HOME} ]; then
	rm -rf ${JAZZ_HOME}
fi
if [ -d /JazzTeamServer ]; then
	ln -s /JazzTeamServer ${JAZZ_HOME}
	if [ -d /JazzTeamServer/lost+found ]; then
		rm -rf /JazzTeamServer/lost+found
	fi
fi

echo "------Server Info------"
echo "JAZZ_HOME is: ${JAZZ_HOME}"
echo "COMPONENT is: ${COMPONENT}"
echo "CONTEXT is: ${CONTEXT}"
echo "IM_HOME is: ${IM_HOME}"
echo "Hostname is: `hostname`"

echo "Set correct ulimit"
./testulimit.sh

echo "Substitute CLM REPO"
CLM_XML=${INSTALL_CLM_SCRIPTS}/CLM.xml
cp silent/CLM_template_${COMPONENT}.xml ${CLM_XML}
sed -i s%_CLM_REPO_%${CLM_REPO}% ${CLM_XML}
sed -i s%_JAZZ_HOME_%${JAZZ_HOME}% ${CLM_XML}
sed -i s%_CONTEXT_%${CONTEXT}% ${CLM_XML}

chown -R ${IM_INSTALL_USER} ${JAZZ_HOME}
chmod -R 777 ${JAZZ_HOME}

echo "Trying to uninstall existing CLM component(s) ... "
# Cloud be previous failed installation, make sure we can have a clean installation
if [ "${IM_INSTALL_USER}" == "root" ]; then
	./uninstallCLM.sh ${IM_HOME} ${JAZZ_HOME}
else
	su - ${IM_INSTALL_USER} -c "cd ${INSTALL_CLM_SCRIPTS}; ./uninstallCLM.sh ${IM_HOME} ${JAZZ_HOME}"
fi

echo "Installing CLM with IBM Installation Manager at ${IM_HOME} using user account ${IM_INSTALL_USER} ..."
if [ ${IS_CLM_REPO_SECURED} == "Y" ]; then
	if [ "${IM_INSTALL_USER}" == "root" ]; then
		cd ${IM_HOME}/eclipse; ./IBMIM --launcher.ini silent-install.ini -input ${CLM_XML} -acceptLicense -secureStorageFile ${CLM_SECURE_STORAGE} -masterPasswordFile ${CLM_MASTER_PASSWORD_FILE}
	else
		su - ${IM_INSTALL_USER} -c "cd ${IM_HOME}/eclipse; ./IBMIM --launcher.ini silent-install.ini -input ${CLM_XML} -acceptLicense -secureStorageFile ${CLM_SECURE_STORAGE} -masterPasswordFile ${CLM_MASTER_PASSWORD_FILE}"
	fi
else
	if [ "${IM_INSTALL_USER}" == "root" ]; then
		cd ${IM_HOME}/eclipse; ./IBMIM --launcher.ini silent-install.ini -input ${CLM_XML} -acceptLicense
	else
		su - ${IM_INSTALL_USER} -c "cd ${IM_HOME}/eclipse; ./IBMIM --launcher.ini silent-install.ini -input ${CLM_XML} -acceptLicense"
	fi
fi
if [ $? -ne 0 ]; then
	echo "Failed to install CLM for some reason, please go check log files."
	exit 1
fi

echo "CLM has been installed successfully."

ls -l ${JAZZ_HOME}

exit 0
