# Open Source Component of IBM WebSphere Application Server

## Overview
All processes / scripts inside this component are basically for IBM WebSphere Application Server only.

## Configurations

### Environment Property Definitions
The environment property definitions here are for users to configure the parameters of LDAP which will be used to enable security settings of IBM WebSphere Application Server.

* ldap_host
Display as **LDAP Hostname**, the LDAP server host name. This host name is either an IP address or a domain name service (DNS) name.

* ldap_port
Display as **LDAP Port**, the port the LDAP server will listen on, default value is *389*

* ldap_bindDN
Display as **LDAP Bind Distinguished Name (DN)**, the distinguished name for the application server, which is used to bind to the directory service. For example, *cn=root*.

* ldap_bindPassword
Display as **LDAP Bind Password**, the password for the application server, which is used to bind to the directory service.

* ldap_baseDN
Display as **LDAP Base Distinguished Name (DN)**, the base distinguished name of the directory service, which indicates the starting point for LDAP searches in the directory service. For example, *ou=Rochester, o=IBM, c=us*.

* ldap_userIdMap
Display as **LDAP User ID map**, a LDAP filter that maps the short name of a user to an LDAP entry, default value is *uid*

* ldap_userFilter
Display as **LDAP User Filter**, a LDAP filter clause for searching the user registry for users, default value is *"(&(uid=%v)(objectclass=inetOrgPerson))"*

* ldap_groupIdMap
Display as **LDAP Group ID map**, a LDAP filter that maps the short name of a group to an LDAP entry, default value is *cn*

* ldap_groupFilter
Display as **LDAP Group Filter**, a LDAP filter clause for searching the user registry for groups, default value is *"(&(cn=%v)(objectclass=groupOfUniqueNames))"*

* ldap_groupMemberIdMap
Display as **LDAP Group Member ID map**, a LDAP filter that identifies user to group memberships, default value is *uniqueMember*

* ldap_primaryid
Display as **WAS Admin User ID**, the user ID of WAS Administrative User in LDAP directory

* ldap_primaryid_Password
Display as **WAS Admin User Password**, the password of WAS Administrative User in LDAP directory

* ldap_sslEnabled
Display as **LDAP with SSL**, whether secure socket communications is enabled with the LDAP server. When this option is set to true, LDAP SSL settings are used, default value is *false*


### Processes

* Install WAS Administrative Scripts
This process is used to download and install the administrative scripts from uDeploy to your instance(s), and also design to verify existing IBM WebSphere Application Server(not implemented yet), several variables like **WAS_SYS_USERNAME** / **WAS_PROFILE_ROOT** / **WAS_SERVER_NAME** will be registered to the agent properties.

* Configure WAS Common and Security
This process will help you to enable security settings of IBM WebSphere Application Server, several variables like **WAS_ADMIN_USERNAME** / **WAS_ADMIN_PASSWPRD** will be registered to the agent properties.

* Restart WAS
This process will help you to restart the IBM WebSphere Application Server.

* Start WAS
This process will help you to start the IBM WebSphere Application Server.

* Stop WAS
This process will help you to stop the IBM WebSphere Application Server.
