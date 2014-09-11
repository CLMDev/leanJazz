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
#
#	Inputs - taken from 'environment'
#		<NODE_NAME> - The node name of WAS
#		<SERVER_NAME> - The server name of WAS, normally server1
#
#	Outputs - save to 'environment'
#		<UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

IHS_HOSTNAME=$1
if [ -z "${IHS_HOSTNAME}" ]; then
	echo "The IHS_HOSTNAME must be provided."
	exit 1
fi

IHS_ROOT_PASSWORD=$2
if [ -z "${IHS_ROOT_PASSWORD}" ]; then
	echo "The IHS_ROOT_PASSWORD must be provided."
	exit 1
fi

WEBSERVER_NAME=$3
if [ -z "${WEBSERVER_NAME}" ]; then
	echo "WEBSERVER_NAME need to be provided."
	exit 1
fi

IHS_WEB_PORT=$4
if [ -z "${IHS_WEB_PORT}" ]; then
	echo "IHS_WEB_PORT need to be provided."
	exit 1
fi

IHS_HOME=$5
if [ -z "${IHS_HOME}" ]; then
	echo "IHS_HOME need to be provided."
	exit 1
fi

IHS_PLUGINS_HOME=$6
if [ -z "${IHS_PLUGINS_HOME}" ]; then
	echo "IHS_PLUGINS_HOME need to be provided."
	exit 1
fi

IHS_ADMIN_PORT=$7
if [ -z "${IHS_ADMIN_PORT}" ]; then
	echo "IHS_ADMIN_PORT need to be provided."
	exit 1
fi

IHS_ADMIN_USERNAME=$8
if [ -z "${IHS_ADMIN_USERNAME}" ]; then
	echo "IHS_ADMIN_USERNAME need to be provided."
	exit 1
fi

IHS_ADMIN_PASSWORD=$9
if [ -z "${IHS_ADMIN_PASSWORD}" ]; then
	echo "IHS_ADMIN_PASSWORD need to be provided."
	exit 1
fi

KEYSTORE_PASSWORD=${10}
if [ -z "${KEYSTORE_PASSWORD}" ]; then
	echo "KEYSTORE_PASSWORD need to be provided."
	exit 1
fi

COMPONENT=${11}
if [ -z "${COMPONENT}" ]; then
	echo "COMPONENT need to be provided."
	exit 1
fi

CONTEXT=${12}
if [ -z "${CONTEXT}" ]; then
	echo "CONTEXT need to be provided."
	exit 1
fi

if [ -z "${WAS_PROFILE_ROOT}" ]; then
	echo "Failed to load WAS_PROFILE_ROOT, check the environment variables in $envProp file."
	exit 1
fi
if [ ! -d ${WAS_PROFILE_ROOT} ]; then
	echo "The WAS_PROFILE_ROOT ${WAS_PROFILE_ROOT} does not exist."
	exit 1
fi

if [ -z "${WAS_SYS_USERNAME}" ]; then
	echo "Failed to load WAS_SYS_USERNAME, check the environment variables in $envProp file."
	exit 1
fi

if [ -z "${NODE_NAME}" ]; then
	echo "Failed to load NODE_NAME, check the environment variables in $envProp file."
	exit 1
fi

if [ -z "${SERVER_NAME}" ]; then
	echo "Failed to load SERVER_NAME, check the environment variables in $envProp file."
	exit 1
fi

if [ -z "${HOSTNAME}" ]; then
	echo "Failed to load HOSTNAME, check the environment variables."
	exit 1
fi
echo "This script is running on ${HOSTNAME}"

UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR=`pwd -P`
echo "UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR=${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}" >> $envProp

echo "------Server Info------"
echo "COMPONENT is: ${COMPONENT}"
echo "CONTEXT is: ${CONTEXT}"
echo "Hostname is: ${HOSTNAME}"

echo "Creating WebServer ${WEBSERVER_NAME} ... "
su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}/CreateWebServer.py ${WEBSERVER_NAME} ${IHS_HOSTNAME} ${IHS_WEB_PORT} ${IHS_HOME} ${IHS_PLUGINS_HOME} ${IHS_ADMIN_PORT} ${IHS_ADMIN_USERNAME} ${IHS_ADMIN_PASSWORD}"
if [ $? -ne 0 ]; then
	echo "Failed to create web server ${WEBSERVER_NAME}."
	exit 1
fi
echo "Web server ${WEBSERVER_NAME} has been created."

CERT_FILE=/tmp/serverroot.cer
echo "Extracting WAS certificate to ${CERT_FILE} ... "
if [ -f ${CERT_FILE} ]; then
	rm -rf ${CERT-FILE}
fi
su - ${WAS_SYS_USERNAME} -c "${WAS_PROFILE_ROOT}/bin/wsadmin.sh -lang jython -f ${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}/Extract_server1_Cert.py ${CERT_FILE}" 
if [ $? -ne 0 ]; then
	echo "Failed to extract certificate."
	exit 1
fi
echo "WAS certificate has been extracted to ${CERT_FILE}."

chmod 755 ${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}/sshScripts/*

echo "Installing expect if it is not find on the system ... "
sh ${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}/sshScripts/install_expect.sh

echo "Setting up SSH remote access to web server ${IHS_HOSTNAME} ..."
HOME=$HOME ${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}/sshScripts/setupSSH -d -p ${IHS_ROOT_PASSWORD} root@${IHS_HOSTNAME}


REMOTE_CERT_FILE=/tmp/serverroot_${NODE_NAME}_${SERVER_NAME}.cer
echo "Uploading WAS certificate to web server ${IHS_HOSTNAME}:${REMOTE_CERT_FILE} ..."
scp ${CERT_FILE} root@${IHS_HOSTNAME}:${REMOTE_CERT_FILE}

REMOTE_KEY_DB=${IHS_PLUGINS_HOME}/config/webservermerge/plugin-key.kdb
echo "Adding WAS certificate to IHS Plugins' key store ..."
ssh root@${IHS_HOSTNAME} "${IHS_HOME}/bin/gskcmd -cert -list -db ${REMOTE_KEY_DB} -label server_root_${NODE_NAME}_${SERVER_NAME} -pw ${KEYSTORE_PASSWORD}"
if [ $? -eq 0 ]; then
	echo "Removing existing certificate with label server_root_${NODE_NAME}_${SERVER_NAME} ..."
	ssh root@${IHS_HOSTNAME} "${IHS_HOME}/bin/gskcmd -cert -delete -db ${REMOTE_KEY_DB} -label server_root_${NODE_NAME}_${SERVER_NAME} -pw ${KEYSTORE_PASSWORD}"
fi
ssh root@${IHS_HOSTNAME} "${IHS_HOME}/bin/gskcmd -cert -add -db ${REMOTE_KEY_DB} -label server_root_${NODE_NAME}_${SERVER_NAME} -pw ${KEYSTORE_PASSWORD} -file ${REMOTE_CERT_FILE}"

echo "Listing current certificate ... "
ssh root@${IHS_HOSTNAME} "${IHS_HOME}/bin/gskcmd -cert -list -db ${REMOTE_KEY_DB} -pw ${KEYSTORE_PASSWORD}"

ssh root@${IHS_HOSTNAME} "rm -rf ${REMOTE_CERT_FILE}"
rm -rf ${CERT_FILE}


echo "Downloading IHS Plugins configuration file from web server ${IHS_HOSTNAME} ... "
PLUGINS_CONFIG_FILE=/tmp/plugin-cfg.xml
scp root@${IHS_HOSTNAME}:${IHS_PLUGINS_HOME}/config/webservermerge/plugin-cfg.xml ${PLUGINS_CONFIG_FILE}

echo "Updating IHS Plugins configuration file ... "
PLUGINS_CONFIG_SEGMENT_FILE=/tmp/plugin-cfg-segment.xml
cp -f ${UPDATE_IHSPLUGINS_REMOTELY_SCRIPTS_DIR}/templates/plugin-cfg-segment-${COMPONENT}.xml ${PLUGINS_CONFIG_SEGMENT_FILE}

sed -i s%_WAS_NODE_NAME_%${NODE_NAME}%g ${PLUGINS_CONFIG_SEGMENT_FILE}
sed -i s%_WAS_SERVER_NAME_%${SERVER_NAME}%g ${PLUGINS_CONFIG_SEGMENT_FILE}
sed -i s%_WAS_HOST_NAME_%${HOSTNAME}%g ${PLUGINS_CONFIG_SEGMENT_FILE}
sed -i s%_IHS_PLUGINS_HOME_%${IHS_PLUGINS_HOME}%g ${PLUGINS_CONFIG_SEGMENT_FILE}
sed -i s%_WebServerMerge_%webservermerge%g ${PLUGINS_CONFIG_SEGMENT_FILE}
sed -i s%_CONTEXT_%${CONTEXT}%g ${PLUGINS_CONFIG_SEGMENT_FILE}

sed -i 's/<\/Config>//' ${PLUGINS_CONFIG_FILE}
cat ${PLUGINS_CONFIG_SEGMENT_FILE} >> ${PLUGINS_CONFIG_FILE}
echo "</Config>" >> ${PLUGINS_CONFIG_FILE}

echo "Uploading IHS Plugins configuration file back to web server ${IHS_HOSTNAME} ... "
scp ${PLUGINS_CONFIG_FILE} root@${IHS_HOSTNAME}:${IHS_PLUGINS_HOME}/config/webservermerge/plugin-cfg.xml

rm -rf ${PLUGINS_CONFIG_FILE}
rm -rf ${PLUGINS_CONFIG_SEGMENT_FILE}

exit 0
