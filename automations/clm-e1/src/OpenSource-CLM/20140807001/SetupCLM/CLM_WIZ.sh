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
#	Authored: Bradley Herrin (bcherrin@us.ibm.com)
#	Modified:
#		Xue Po Wang (xuepow@cn.ibm.com)
#
#	Script Inputs
#		<JTS_REPOSITORY_URL> - The repository url of JTS
#		<DB_TYPE> - db2 | oracle
#		<DB_CONN_URL_JTS> - The connection URL of JTS database
#		<DB_CONN_URL_DW> - The connection URL of Data Warehouse
#		<DB_ADMIN_PASSWORD> - The password of database administrative user
#		<JAZZ_HOME> - The home directory of JAZZ
#		<COMPONENT> - The name of CLM component, should be one of {"jts", "ccm", "qm", "rm"}
#		<CONTEXT> - The context of CLM component going to use, like {"jts", "ccm", "ccm01", "ccm02", "qm", "rm"}
#		<JAZZ_LDAP_PROP_FILE> - The properties which stores the LDAP settings of Jazz
#		<SCR_URL_APP> - The discovery URL of CLM application
#		<DB_CONN_URL_APP> - The connection URL of CLM application database, should be provided if the component is not JTS
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<JTS_SETUP_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

JTS_REPOSITORY_URL=$1
if [ -z "${JTS_REPOSITORY_URL}" ]; then
	echo "JTS_REPOSITORY_URL should be provided."
	exit 1
fi

DB_TYPE=$2
if [ -z "${DB_TYPE}" ]; then
	echo "DB_TYPE should be provided."
	exit 1
fi
if [ "${DB_TYPE}" != "db2" ] && [ "${DB_TYPE}" != "oracle" ]; then
	echo "DB_TYPE can only be db2 or oracle."
	exit 1
fi

DB_CONN_URL_JTS=$3
if [ -z "${DB_CONN_URL_JTS}" ]; then
	echo "DB_CONN_URL_JTS should be provided."
	exit 1
fi

DB_CONN_URL_DW=$4
if [ -z "${DB_CONN_URL_DW}" ]; then
	echo "DB_CONN_URL_DW should be provided."
	exit 1
fi

DB_ADMIN_PASSWORD=$5
if [ -z "${DB_ADMIN_PASSWORD}" ]; then
	echo "DB_ADMIN_PASSWORD should be provided."
	exit 1
fi

JAZZ_HOME=$6
if [ -z "${JAZZ_HOME}" ]; then
	echo "JAZZ_HOME should be provided."
	exit 1
fi
if [ ! -d ${JAZZ_HOME} ]; then
	echo "Failed to find JAZZ_HOME at ${JAZZ_HOME}"
	exit 1
fi

COMPONENT=$7
if [ -z "${COMPONENT}" ]; then
	echo "COMPONENT should be provided."
	exit 1
fi

CONTEXT=$8
if [ -z "${CONTEXT}" ]; then
	echo "CONTEXT should be provided."
	exit 1
fi

JAZZ_LDAP_PROP_FILE=$9
if [ -z "${JAZZ_LDAP_PROP_FILE}" ]; then
	echo "JAZZ_LDAP_PROP_FILE should be provided."
	exit 1
fi
if [ ! -f ${JAZZ_LDAP_PROP_FILE} ]; then
	echo "Failed to find JAZZ_LDAP_PROP_FILE at ${JAZZ_LDAP_PROP_FILE}"
	exit 1
fi

SCR_URL_APP=${10}
if [ ${COMPONENT} != "jts" ] && [ -z "${SCR_URL_APP}" ]; then
	echo "SCR_URL_APP should be provided."
	exit 1
fi

DB_CONN_URL_APP=${11}
if [ ${COMPONENT} != "jts" ] && [ -z "${DB_CONN_URL_APP}" ]; then
	echo "DB_CONN_URL_APP should be provided."
	exit 1
fi

JTS_SETUP_SCRIPTS_DIR=`pwd -P`
echo "JTS_SETUP_SCRIPTS_DIR=${JTS_SETUP_SCRIPTS_DIR}" >> $envProp

echo "------Server Info------"
echo "JAZZ_HOME is: ${JAZZ_HOME}"
echo "COMPONENT is: ${COMPONENT}"
echo "CONTEXT is: ${CONTEXT}"
echo "Hostname is: `hostname`"

JTS_WIZ_PROPS_FILE=${JTS_SETUP_SCRIPTS_DIR}/wiz_${CONTEXT}.properties
cp ${JTS_SETUP_SCRIPTS_DIR}/properties/wiz_template_${COMPONENT}.properties ${JTS_WIZ_PROPS_FILE}

DB_TYPE=$( echo "${DB_TYPE}" | tr "[:lower:]" "[:upper:]" )
sed -i s%_DB_TYPE_%${DB_TYPE}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_DB_CONN_URL_JTS_%${DB_CONN_URL_JTS}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_DB_CONN_URL_DW_%${DB_CONN_URL_DW}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_DB_ADMIN_PASSWORD_%${DB_ADMIN_PASSWORD}% ${JTS_WIZ_PROPS_FILE}

. ${JAZZ_LDAP_PROP_FILE}

sed -i s%_LDAP_HOST_%${ldap_host}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_LDAP_PORT_%${ldap_port}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_REGISTRY_USERNAME_%${ldap_bindDN}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_REGISTRY_PASSWORD_%${ldap_bindPassword}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_BASE_USER_DN_%${ldap_baseDN}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_USER_ATTRIBUTE_MAPPING_%$jazz_ldap_userAttributesMapping% ${JTS_WIZ_PROPS_FILE}
sed -i s%_BASE_GROUP_DN_%${ldap_baseDN}% ${JTS_WIZ_PROPS_FILE}
sed -i s%_GROUP_NAME_ATTRIBUTE_%$jazz_ldap_groupNameAttribute% ${JTS_WIZ_PROPS_FILE}
sed -i s%_MEMBERS_OF_GROUP_%$jazz_ldap_membersOfGroup% ${JTS_WIZ_PROPS_FILE}
sed -i s%_GROUP_MAPPING_%$jazz_ldap_groupMapping% ${JTS_WIZ_PROPS_FILE}

CLM_ADMIN_USERNAME=${jazz_ldap_primaryid}
CLM_ADMIN_PASSWORD=${jazz_ldap_primaryid_Password}

if [ ${COMPONENT} != "jts" ]; then
	sed -i s%_SCR_URL_APP_%${SCR_URL_APP}% ${JTS_WIZ_PROPS_FILE}
	sed -i s%_CLM_ADMIN_USERNAME_%${CLM_ADMIN_USERNAME}% ${JTS_WIZ_PROPS_FILE}
	sed -i s%_DB_CONN_URL_APP_%${DB_CONN_URL_APP}% ${JTS_WIZ_PROPS_FILE}
	sed -i s%_CONTEXT_%${CONTEXT}% ${JTS_WIZ_PROPS_FILE}
fi

CLM_INSTALL_USER=`ls -l ${JAZZ_HOME} | cut -d' ' -f 3`
echo "Running ${COMPONENT} setup using user account ${CLM_INSTALL_USER} to context ${CONTEXT} ..."
su - ${CLM_INSTALL_USER} -c "cd ${JAZZ_HOME}/server;./repotools-${CONTEXT}.sh -setup repositoryURL=${JTS_REPOSITORY_URL} adminUserId=${CLM_ADMIN_USERNAME} adminPassword=${CLM_ADMIN_PASSWORD} parametersFile=${JTS_WIZ_PROPS_FILE} logFile=repotools-${CONTEXT}_setup.log;"
if [ $? -ne 0 ]; then
	echo "Failed to run ${COMPONENT} setup ... "
	exit 1
fi
echo "The ${COMPONENT} is ready to use now."

exit 0
