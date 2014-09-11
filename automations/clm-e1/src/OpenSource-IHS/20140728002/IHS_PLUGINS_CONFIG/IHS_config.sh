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
#		<IHS_HOME> - /opt/IBM/HTTPServer
#		<IHS_PLUGINS_HOME> - /opt/IBM/Plugins
#		<IHS_HTTPS_PORT> - 9443
#		<KEYSTORE_PASSWORD> - The new password of key stone file
#
#	Inputs - taken from 'environment'
#		<NONE>
#
#	Outputs - save to 'environment'
#		<IHS_CONFIG_SCRIPTS_DIR> - The home directory of this script
#
#############################################################################

envProp=/etc/env.properties
touch $envProp

. $envProp

IHS_HOME=$1
if [ -z "${IHS_HOME}" ] || [ ! -d ${IHS_HOME} ]; then
	echo "The IHS_HOME must be provided and should be an existing folder."
	exit 1
fi

IHS_PLUGINS_HOME=$2
if [ -z "${IHS_PLUGINS_HOME}" ] || [ ! -d ${IHS_PLUGINS_HOME} ]; then
	echo "The IHS_PLUGINS_HOME must be provided and should be an existing folder."
	exit 1
fi

IHS_HTTPS_PORT=$3
if [ -z "${IHS_HTTPS_PORT}" ]; then
	echo "IHS_HTTPS_PORT must be provided."
	exit 1
fi

KEYSTORE_PASSWORD=$4
if [ -z "${KEYSTORE_PASSWORD}" ]; then
	echo "KEYSTORE_PASSWORD must be provided."
	exit 1
fi

IHS_CONFIG_SCRIPTS_DIR=`pwd -P`
echo "IHS_CONFIG_SCRIPTS_DIR=${IHS_CONFIG_SCRIPTS_DIR}" >> $envProp

echo "HOSTNAME is $HOSTNAME"

if [ -d ${IHS_PLUGINS_HOME}/config/webservermerge ]; then
	rm -rf ${IHS_PLUGINS_HOME}/config/webservermerge
fi
mkdir -p ${IHS_PLUGINS_HOME}/config/webservermerge

IHS_PLUGINS_KEYSTORE_FILE=${IHS_PLUGINS_HOME}/config/webservermerge/plugin-key.kdb
echo "Creating key store file for IHS Plugin at ${IHS_PLUGINS_KEYSTORE_FILE}"
${IHS_HOME}/bin/gskcmd -keydb -create -db ${IHS_PLUGINS_KEYSTORE_FILE} -pw ${KEYSTORE_PASSWORD} -expire 1200 -stash -type cms

IHS_PLUGINS_KEYSTORE_LABEL=webspherenewpluginkey
echo "Creating default certificate and update IHS Plugin's key store file ${IHS_PLUGINS_KEYSTORE_FILE} ..."
${IHS_HOME}/bin/gskcmd -cert -list -db ${IHS_PLUGINS_KEYSTORE_FILE} -label ${IHS_PLUGINS_KEYSTORE_LABEL} -pw ${KEYSTORE_PASSWORD}
if [ $? -eq 0 ]; then
	echo "Removing existing certificate with label webspherenewpluginkey ..."
	${IHS_HOME}/bin/gskcmd -cert -delete -db ${IHS_PLUGINS_KEYSTORE_FILE} -label ${IHS_PLUGINS_KEYSTORE_LABEL} -pw ${KEYSTORE_PASSWORD}
fi
${IHS_HOME}/bin/gskcmd -cert -create -db ${IHS_PLUGINS_KEYSTORE_FILE} -label ${IHS_PLUGINS_KEYSTORE_LABEL} -expire 365 -dn "CN=$HOSTNAME" -default_cert yes -pw ${KEYSTORE_PASSWORD}
if [ $? -ne 0 ]; then
	echo "Failed to update IHS Plugin's key store file ${IHS_PLUGINS_KEYSTORE_FILE}."
	exit 1
fi
echo "IHS Plugin's key store file has been updated successfully."

echo "Creating blank IHS Plugins configurations file ... "
PLUGINS_CONFIG_FILE=${IHS_PLUGINS_HOME}/config/webservermerge/plugin-cfg.xml
cp -f ${IHS_CONFIG_SCRIPTS_DIR}/templates/plugin-cfg-template.xml ${PLUGINS_CONFIG_FILE}
sed -i s%_IHS_PLUGINS_HOME_%${IHS_PLUGINS_HOME}%g ${PLUGINS_CONFIG_FILE}
mkdir -p ${IHS_PLUGINS_HOME}/logs/webservermerge
IHS_PLUGINS_LOG=${IHS_PLUGINS_HOME}/logs/webservermerge/http_plugin.log
sed -i s%_IHS_PLUGINS_LOG_%${IHS_PLUGINS_LOG}%g ${PLUGINS_CONFIG_FILE}

IHS_KEYSTORE_FILE=${IHS_HOME}/ihsserverkey.kdb
if [ -f ${IHS_KEYSTORE_FILE} ]; then
	rm -rf ${IHS_KEYSTORE_FILE}
fi

echo "Creating key store for IHS SSL ... "
${IHS_HOME}/bin/gskcmd -keydb -create -db ${IHS_KEYSTORE_FILE} -pw ${KEYSTORE_PASSWORD} -expire 365 -stash -type cms
echo "Creating default certificate and update IHS SSL key store file ${IHS_KEYSTORE_FILE} ..."
${IHS_HOME}/bin/gskcmd -cert -create -db ${IHS_KEYSTORE_FILE} -label ihsserver -expire 365 -dn "CN=$HOSTNAME" -default_cert yes -pw ${KEYSTORE_PASSWORD}

echo "Updating IHS configuration to enable SSL and IHS Plugins ... "

VH_CONF_FILE=${IHS_HOME}/conf/virtual_host.conf
cp -f templates/virtual_host_template.conf ${VH_CONF_FILE}
sed -i s%_PLUGINS_CONFIG_FILE_%${PLUGINS_CONFIG_FILE}% ${VH_CONF_FILE}
sed -i s%_IHS_HTTPS_PORT_%${IHS_HTTPS_PORT}% ${VH_CONF_FILE}
sed -i s%_IHS_KEYSTORE_FILE_%${IHS_KEYSTORE_FILE}% ${VH_CONF_FILE}
sed -i s%_IHS_HOME_%${IHS_HOME}% ${VH_CONF_FILE}

HTTPD_CONF_FILE=${IHS_HOME}/conf/httpd.conf
sed -i s%WebSpherePluginConfig%#WebSpherePluginConfig% $HTTPD_CONF_FILE
sed -i "s%Include conf/virtual_host.conf%#Include conf/virtual_host.conf%" $HTTPD_CONF_FILE
echo "Include conf/virtual_host.conf" >> $HTTPD_CONF_FILE

exit 0
