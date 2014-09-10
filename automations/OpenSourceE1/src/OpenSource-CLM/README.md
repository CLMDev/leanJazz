# Open Source Component of IBM Collaborative Lifecycle Management (JTS / CCM / QM / RM)

## Overview
All processes / scripts inside this component are basically for IBM Collaborative Lifecycle Management related applications, including JTS, CCM, QM and RM.

The tricky part is that component OpenSource-JTS, OpenSource-CCM, OpenSource-QM and OpenSource-RM will share the same source code here, we defined theses four separate components in uDeploy for better understanding, if they want to install CCM application on one node, they just need to map the OpenSource-CCM component to that node.

## Configurations

### Environment Property Definitions
The environment property definitions here are for users to configure the parameters of LDAP which will be used to enable security settings of IBM WebSphere Application Server.

* CLM_REPO
The software repository that will be used to install CLM related applications the default value is *https://jazz.net/downloads/clm/5.0/5.0/install-repository/clm-offerings/repository/repository.config*, it's a repository on jazz.net, if your instances can access the public Internet, you can use this repository directly.

* CLM_REPO_USERNAME
If your repository is secured with user authentication mechanism, you need to specify the username who has the access right here, DO provide your jazz.net id if your didn't change the value of CLM_REPO, and leave it empty(the default value) if your own repository don't have such mechanism.

* CLM_REPO_PASSWORD
This is the password of the user account which you are going to use to access the repository, must be provided if CLM_REPO_USERNAME is provided

* CLM_MASTER_PASSWORD
The master password which will be used for IBM Installation Manager secure store, must be provided if CLM_REPO_USERNAME and CLM_REPO_PASSWORD is provided, you can find more information about it from the information center.

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

* jazz_ldap_userAttributesMapping
Display as **User Property Names Mapping**, the mapping of Jazz user property names to LDAP registry entry attribute names. The mapping should be represented as {contributorAttributeName1}={LDAPEntryAttributeName1}, {contributorAttributeName2}={LDAPEntryAttributeName2}..., default value is *"userId=uid,name=cn,emailAddress=mail"*

* jazz_ldap_groupMapping
Display as **Jazz to LDAP Group Mapping**, the mapping between Jazz groups and LDAP groups. One Jazz group can be mapped to multiple LDAP groups. The LDAP groups must be separated by a semi colon. For example, *JazzAdmins=LDAPAdmins1;LDAPAdmins2,JazzUsers=LDAPUsers1;LDAPUsers2* maps JazzAdmins group to LDAPAdmins1 and LDAPAdmins2, and maps JazzUsers group to LDAPUsers1 and LDAPUsers2.

* jazz_grouprole_JazzAdmins
Display as **Jazz LDAP Group for Jazz Admins**, the distinguished name for the LDAP group which will be used as Jazz Admins. For example, *cn=JazzAdmins,dc=domain*.

* jazz_grouprole_JazzDWAdmins
Display as **Jazz LDAP Group for Jazz Data Warehouse Admins**, the distinguished name for the LDAP group which will be used as Jazz Data Warehouse Admins. For example, *cn=JazzDWAdmins,dc=domain*.

* jazz_grouprole_JazzUsers
Display as **Jazz LDAP Group for Jazz Users**, the distinguished name for the LDAP group which will be used as Jazz Users. For example, *cn=JazzUsers,dc=domain*.

* jazz_grouprole_JazzGuests
Display as **Jazz LDAP Group for Jazz Guests**, the distinguished name for the LDAP group which will be used as Jazz Guests. For example, *cn=JazzGuests,dc=domain*.

* jazz_grouprole_JazzProjectAdmins
Display as **Jazz LDAP Group for Jazz Project Admins**,, the distinguished name for the LDAP group which will be used as Jazz Project Admins. For example, *cn=JazzProjectAdmins,dc=domain*.

* jazz_ldap_primaryid
Display as **Jazz Admin Username**, The username of Jazz administrative user in LDAP directory service, default value is *clmadmin*.

* jazz_ldap_primaryid_Password
Display as **Jazz Admin User Password**, The password of Jazz administrative user in LDAP directory service.

* ldap_groupIdMap
Display as **LDAP Group ID map**, a LDAP filter that maps the short name of a group to an LDAP entry, default value is *cn*

* ldap_groupMemberIdMap
Display as **LDAP Group Member ID map**, a LDAP filter that identifies user to group memberships, default value is *uniqueMember*

* NTP_SERVER
Display as **NTP Server**, the time server for the CLM application(s) to sync their time, default value is *0.rhel.pool.ntp.org*.


### Processes

* Init Component Nodes Registration
This process will create a environment property called **CCM_NODES** or **QM_NODES** or **RM_NODES** based on which component you are running against.

* Compute Context and Register Component Node
This process will attach the hostname to the environment property created in process **Init Component Nodes Registration**, count how many existing hostnames has been registered, save application context like ccm02 to an agent property *CONTEXT*.

* Install CLM Component
This process will install CLM component using IBM Installation Manager with application context and register **JAZZ_HOME** to agent properties.

* Create DB and Schema remotely
This process will create the database and schema needed by CLM applications, and register the database connection string(s) to environment properties.

* Create web server and configure IHS Plugin remotely
This process will create web server definition in WAS, configure IHS and Plugins to map specified URL to WAS.

* Tune WAS
This process will tune WAS, like configure the necessary JVM properties for CLM application(s).

* Deploy CLM Web Applications
This process will deploy the CLM web application(s) to the WAS and configure JAAS.

* Setup CLM Component
This process will call the repo-tools to do CLM application setup.
